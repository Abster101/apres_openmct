<template>
<ul :style="legendStyle" v-if="inBoundsEpisodes.length > 0">
    <div v-if="endPoints">
        <div>
            <div :style="zoomStyle">
                <button :style="buttonStyle" @click="expandNumericHeight"> + </button>
                <button :style="buttonStyle" @click="decreaseNumericHeight"> - </button>
            </div>
            <TimelineNumericChronicle 
                :episodes="inBoundsEpisodes"
                :parentDomainObject="parentDomainObject"
                :index="index"
                :isEditing="isEditing"
                :startBounds="startBounds"
                :endBounds="endBounds"
                :endPoints="endPoints"
                :limits="limits"
                :projectEndTime="projectEndTime"
                :pixelMultiplier="pixelMultiplier"
                :formatter="formatter"
                :errors="errors"
                :violationClicked="violationClicked"
                :numericHeight="numericHeight"
                @onEpisodeHover="changeDisplayValue" 
            />
        </div>
    </div>
    <div v-else>
        <div
            v-for="(episode, index) in inBoundsEpisodes"
            :key="'episode-' + episode.time"
        >
            <p :style="titleStyle">{{displayedValue}}</p>
            <timeline-state-chronicle
                :domainObject="episode"
                :parentDomainObject="parentDomainObject"
                :index="index"
                :isEditing="isEditing"
                :startBounds="startBounds"
                :endBounds="endBounds"
                :endPoints="endPoints"
                :pixelMultiplier="pixelMultiplier"
                :formatter="formatter"
                :errors="errors"
                :violationClicked="violationClicked"
                @onEpisodeHover="changeDisplayValue" 
            /> 
        </div>
    </div>
</ul>
</template>

<script>
import TimelineStateChronicle from './TimelineStateChronicle.vue';
import TimelineNumericChronicle from './TimelineNumericChronicle.vue';

const ACTIVITY_HEIGHT = 44;

export default {
    inject: ['openmct'],
    components: {
        TimelineStateChronicle,
        TimelineNumericChronicle,
    },
    props: {
        chronicle: {
            type: Object,
            required: true,
            default() {
                return {};
            }
        },
        parentDomainObject: {
            type: Object,
            required: true,
            default() {
                return {}
            }
        },
        title: {
            type: String
        },
        index: {
            type: Number
        },
        isEditing: {
            type: Boolean
        },
        startBounds: {
            type: Number
        },
        endBounds: {
            type: Number
        },
        projectEndTime: {
            type: String
        },
        pixelMultiplier: {
            type: Number
        },
        formatter: {
            type: Object
        },
        errors: {
            type: Array
        },
        violationClicked: {
            type: Boolean
        },
    },
    data() {
        return {
            displayedValue: "",
            endPoints: null,
            limits: null,
            numericHeight: 40,
        }
    },
    mounted() {
        const lastEpisode = this.chronicle.episodes[this.chronicle.episodes.length-1];
        this.displayedValue = lastEpisode.value;

        if (typeof this.chronicle.endPoints !== 'undefined') {
            this.endPoints = this.chronicle.endPoints;
        }

        if (typeof this.chronicle.limits !== 'undefined') {
            this.limits = this.chronicle.limits;
        }
    },
    computed: {
        legendStyle() {
            return {
                'position': 'relative',
                'height': `${this.numericHeight + 4}px`,
                'min-height': `${ACTIVITY_HEIGHT}px`,
                'border-top': '2px solid #6c6c6c',
                'border-bottom': '2px solid #6c6c6c',
                'margin-top': '10px',
				'margin-bottom': '10px',
            }
        },
        titleStyle() {
            return {
                'position': 'absolute',
                'margin-left': '10px',
                'z-index': '5',
            }
        },
        zoomStyle(){
            return {
                'position': 'absolute',
                'color': 'white',
                'margin-left': '10px',
                'z-index': '5',
            }
        },
        buttonStyle(){
            return {
                'font-size': '20px',
            }
        },
        inBoundsEpisodes() {
            const filteredEpisodes = this.chronicle.episodes.filter(episode => {
                return (
                    this.formatter.parse(episode.time) <= this.endBounds
                );
            });

            const test = [filteredEpisodes[filteredEpisodes.length-1]]
            return filteredEpisodes;
        }
    },
    methods: {
        changeDisplayValue(value) {
            this.displayedValue = value;
        },
        expandNumericHeight() {
            this.numericHeight = this.numericHeight + 20;

            const labelHeightInfo = {
                name: this.chronicle.name,
                height: this.numericHeight + 4,
            }

            this.$emit('changeNumericHeight', labelHeightInfo);
        },
        decreaseNumericHeight() {
            const newHeight = this.numericHeight - 20;

            if(newHeight >= 40){
                this.numericHeight = newHeight;
                
                const labelHeightInfo = {
                    name: this.chronicle.name,
                    height: this.numericHeight + 4,
                };

                this.$emit('changeNumericHeight', labelHeightInfo);
            }
        },
    },
}
</script>