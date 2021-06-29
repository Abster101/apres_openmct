<template>
<div class="flex flex-row w-full">
    <div
        class="w-10-10"
    >
        <!-- 30px div to match timeline-axis -->
        <div
            class="flex align-self-center"
            style="min-height: 30px;"
        >
            <button
                class="c-icon-button c-icon-button--major icon-plus"
                title="zoom in"
                @click="zoomIn"
            ></button>
            <button
                class="c-icon-button c-icon-button--major icon-minus"
                title="zoom out"
                @click="zoomOut"
            ></button>
        </div>
        <!-- timeline legend labels -->
        <div>
            <timeline-legend-label
                v-for="(legend, index) in legends"
                :key="'timeline-legend-label' + index"
                :num-activities="timelineLegends[legend].length"
                :title="legend"
            >
                {{legend}}
            </timeline-legend-label>
        </div>
    </div>
    <div
        ref="timeline-container"
        class="w-9-10"
        :style="style"
    >
        <timeline-axis
            :bounds="bounds"
            :time-system="timeSystem"
            :content-height="50"
            :rendering-engine="'svg'"
        />
        <div
            style="min-width: 100%; min-height: 100%;"
        >
            <timeline-legend
                v-for="(legend, index) in legends"
                :key="'timeline-legend-' + index"
                :title="legend"
                :activities="timelineLegends[legend]"
                :parentDomainObject="domainObject"
                :index="index"
                :isEditing="isEditing"
                :startBounds="bounds.start"
                :endBounds="bounds.end"
                :pixelMultiplier="pixelMultiplier"
                :formatter="timeFormatter"
            />
        </div>
    </div>
</div>
</template>

<script>
console.log("hey there")
import TimelineLegend from './timelineLegend.vue';
import TimelineLegendLabel from './timelineLegendLabel.vue';
import TimelineAxis from './timeSystemAxis.vue';
import Error from './error.vue';
import Moment from 'moment';
import lodash from 'lodash';

const PIXEL_MULTIPLIER = 0.05;
const TIMELINE_PADDING = 1000 * 60 * 15; //  mins of padding for timeline center action

export default {
    inject: ['openmct', 'objectPath'],
    props: {
        isEditing: {
            type: Boolean
        },
        domainObject: {
            type: Object
        }
    },
    components: {
        TimelineLegend,
        TimelineLegendLabel,
        TimelineAxis,
        Error
    },
    computed: {
        inBoundErrors() {
            return this.errors.filter(error => {
                return (error.startTime <= this.bounds.end &&
                    error.startTime >= this.bounds.start);
            });
        },
        style() {
            return {
                'overflow': 'hidden'
            }
        },
        legends() {
            return Object.keys(this.timelineLegends);
        }
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let timeFormatter = this.getFormatter(timeSystem.timeFormat);

        return {
            activities: [],
            timelineLegends: {},
            chronicles: [],
            bounds: {},
            timeSystem: {},
            pixelMultiplier: PIXEL_MULTIPLIER,
            errors: [],
            timeSystem,
            timeFormatter
        }
    },
    methods: {
        addActivityToConfiguration(activityDomainObject) {
            let keystring = this.openmct.objects.makeKeyString(activityDomainObject.identifier);
            
            if (!this.domainObject.configuration.activities[keystring]) {
                const configuration = lodash.cloneDeep(activityDomainObject.configuration);
                const startTime = this.timeFormatter.parse(this.domainObject.configuration.startTime);

                if (startTime) {
                    configuration.startTime = startTime;
                }

                this.openmct.objects.mutate(this.domainObject, `configuration.activities[${keystring}]`, configuration);
            }
        },
        addActivity(activityDomainObject) {
            this.addActivityToConfiguration(activityDomainObject);
            this.activities.push(activityDomainObject);

            const activityTimelineLegend = activityDomainObject.configuration.timelineLegend;

            if (this.timelineLegends[activityTimelineLegend]) {
                this.timelineLegends[activityTimelineLegend].push(activityDomainObject);
            } else {
                this.$set(this.timelineLegends, activityTimelineLegend, [activityDomainObject]);
            }

            if (this.activities.length === 2) {
                this.addError(activityDomainObject);
            }
        },
        addError(activityDomainObject) {
            this.errors.push({
                startTime: activityDomainObject.configuration.startTime
            });
        },
        removeActivity(activityIdentifier) {
            console.log(activityIdentifier);
        },
        reorderActivities(reorderPlan) {
            let oldActivities = this.activities.slice();

            reorderPlan.forEach((reorderEvent) => {
                this.$set(this.activities, reorderEvent.newIndex, oldActivities[reorderEvent.oldIndex]);
            });
        },
        initializeTimeBounds(timeBounds, tick) {
            if (tick) {
                return;
            }

            this.bounds = timeBounds;

            this.initializePixelMultiplier();
        },
        initializePixelMultiplier() {
            let container = this.$refs['timeline-container'];
            let boundingClientRect = container.getBoundingClientRect();
            let width = boundingClientRect.width;
            let boundsDiff = this.bounds.end - this.bounds.start;

            this.pixelMultiplier = boundsDiff / width;
        },
        getViewContext() {
            return {
                type: 'timeline-component',
                centerTimeline: this.setTimeBoundsFromConfiguration,
                zoomIn: this.zoomIn,
                zoomOut: this.zoomOut
            }
        },
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        getTimelineCenterBounds() {
            if (!this.activities.length) {
                return;
            }

            let start = 0;
            let end = 0;

            this.activities.forEach((activity, index) => {
                const keystring = this.openmct.objects.makeKeyString(activity.identifier);
                const configuration = this.domainObject.configuration.activities[keystring]
                const startTime = this.timeFormatter.parse(configuration.startTime);
                const endTime = startTime + configuration.duration;

                if (index === 0) {
                    start = startTime;
                    end = endTime;
                } else {
                    if (startTime < start) {
                        start = startTime;
                    }

                    if (endTime > end) {
                        end = endTime;
                    }
                }
            });

            start = Math.floor(start - TIMELINE_PADDING);
            end = Math.ceil(end + TIMELINE_PADDING);

            return [start, end];
        },
        centerTimeline() {
            const [start, end] = this.getTimelineCenterBounds();

            this.openmct.time.bounds({start, end});
        },
        zoomIn() {
            const zoomFactor = 0.1 * (this.bounds.end - this.bounds.start)
            const start = this.bounds.start + zoomFactor;
            const end = this.bounds.end - zoomFactor;

            this.openmct.time.bounds({start, end});
        },
        zoomOut() {
            const zoomFactor = 0.1 * (this.bounds.end - this.bounds.start)
            const start = this.bounds.start - zoomFactor;
            const end = this.bounds.end + zoomFactor;

            this.openmct.time.bounds({start, end});
        },
        setTimeBoundsFromConfiguration() {
            const configuration = this.domainObject.configuration;

            if (configuration.startTime && configuration.endTime) {
                this.openmct.time.bounds({
                    start: this.timeFormatter.parse(configuration.startTime),
                    end: this.timeFormatter.parse(configuration.endTime)
                });
            } else {
                this.centerTimeline();
            }
        }
    },
    mounted() {
        this.openmct.time.on('bounds', this.initializeTimeBounds);
        this.initializeTimeBounds(this.openmct.time.bounds());
        this.timeSystem = this.openmct.timeSystem;

        const composition = this.openmct.composition.get(this.domainObject);

        composition.on('add', this.addActivity);
        composition.on('remove', this.removeActivity);
        composition.on('reorder', this.reorderActivities);
        composition.load();

        this.unsubscribeFromComposition = () => {
            composition.off('add', this.addActivity);
            composition.off('remove', this.removeActivity);
        }
    },
    beforeDestroy() {
        this.unsubscribeFromComposition();
        this.openmct.time.off('bounds', (this.initializeTimeBounds));
    }
}
</script>

<style lang="scss">
</style>
