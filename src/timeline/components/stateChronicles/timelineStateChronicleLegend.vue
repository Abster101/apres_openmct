<template>
<ul :style="legendStyle" v-if="inBoundsEpisodes.length > 0">
    <p :style="titleStyle">{{displayedValue}}</p>
    <timeline-state-chronicle
        v-for="(episode, index) in inBoundsEpisodes"
        :key="'episode-' + episode.time"
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
</ul>
</template>

<script>
import TimelineStateChronicle from './timelineStateChronicle.vue';

const ACTIVITY_HEIGHT = 44;

export default {
    inject: ['openmct'],
    components: {
        TimelineStateChronicle
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
        }
    },
    mounted() {
        const lastEpisode = this.chronicle.episodes[this.chronicle.episodes.length-1];
        this.displayedValue = lastEpisode.value;

        if (typeof this.chronicle.endPoints !== 'undefined') {
            this.endPoints = this.chronicle.endPoints;
        }
    },
    computed: {
        legendStyle() {
            return {
                'position': 'relative',
                'max-height': `${ACTIVITY_HEIGHT * 1}px`,
                'min-height': `${ACTIVITY_HEIGHT * 1}px`,
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
    },
}
</script>