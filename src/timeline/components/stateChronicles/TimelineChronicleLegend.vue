<template>
<div :style="styleVars" class="chronicle-legend" v-if="inBoundsEpisodes.length > 0">
    <div v-if="chronicle.chronicleType === 'numeric'">
        <div @mouseover="showOptionBar = true" @mouseleave="showOptionBar = false">
            <div :style="zoomStyle" v-show="showOptionBar">
                <button
					class="c-icon-button icon-plus"
                    :style="buttonStyle"
					title="zoom in"
					@click="expandNumericHeight"
				></button>
				<button
					class="c-icon-button icon-minus"
                    :style="buttonStyle"
					title="zoom out"
					@click="decreaseNumericHeight"
				></button>
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
    <template v-else>
        <template
            v-for="(episode, index) in inBoundsEpisodes"
        >
            <p :key="'p-' + index" :style="titleStyle">{{displayedValue}}</p>
            <timeline-state-chronicle
                :key="'c-' + index"
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
        </template>
    </template>
</div>
</template>

<style scoped>
    .chronicle-legend {
        position: relative;
        height: calc(1px * var(--height));

        border-bottom: 1px solid #444;
    }

    .chronicle-legend:first-of-type {
        border-top: 1px solid #444;
    }

    .chronicle-legend:nth-child(2n) {
        background-color: rgba(0,0,0,0.2);
    }
</style>

<script>
import TimelineStateChronicle from './TimelineStateChronicle.vue';
import TimelineNumericChronicle from './TimelineNumericChronicle.vue';
import { NUMERIC_HEIGHT, NUMERIC_HEIGHT_EXPAND } from '../shared-constants';

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
            numericHeight: NUMERIC_HEIGHT,
            showOptionBar: false,
        }
    },
    created() {
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
        styleVars() {
            return {
                '--height': this.numericHeight + 4,
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
                'padding-top': '10px',
                'padding-left': '10px',
                'height': `${this.numericHeight + 4}px`,
                'z-index': '5',
            }
        },
        buttonStyle(){
            return {
                'background-color': 'rgba(99, 112, 120, 0.8)',
                'font-size': '10px',
            }
        },
        inBoundsEpisodes() {
            const filteredEpisodes = this.chronicle.episodes.filter(episode => {
                return (
                    this.formatter.parse(episode.time) <= this.endBounds
                );
            });

            return filteredEpisodes;
        }
    },
    methods: {
        changeDisplayValue(value) {
            this.displayedValue = value;
        },
        expandNumericHeight() {
            this.numericHeight = this.numericHeight + NUMERIC_HEIGHT_EXPAND;

            const labelHeightInfo = {
                name: this.chronicle.name,
                index: this.index,
                height: this.numericHeight + 4,
            }

            this.$emit('changeNumericHeight', labelHeightInfo);
        },
        decreaseNumericHeight() {
            const newHeight = this.numericHeight - NUMERIC_HEIGHT_EXPAND;

            if(newHeight >= NUMERIC_HEIGHT){
                this.numericHeight = newHeight;

                const labelHeightInfo = {
                    name: this.chronicle.name,
                    index: this.index,
                    height: this.numericHeight + 4,
                };

                this.$emit('changeNumericHeight', labelHeightInfo);
            }
        },
    },
}
</script>