<template>
  <div
    ref="timeline-container"
    :style="style">
    <timeline-axis 
        :bounds="bounds"
        :time-system="timeSystem"
        :content-height="100"
        :rendering-engine="'svg'"
    />
    <ul style="min-width: 100%; min-height: 100%; position: relative;">
        <timeline-activity
            v-for="(activityDomainObject, index) in inBoundsActivities"
            :key="activityDomainObject.identifier.key"
            :domainObject="activityDomainObject"
            :index="index"
            :isEditing="isEditing"
            :startBounds="bounds.start"
            :endBounds="bounds.end"
            :pixelMultiplier="pixelMultiplier"
        />
        
        <Error 
            v-for="(error, index) in errors"
            :key="index"
            :startTime="error.startTime"
            :startBounds="bounds.start"
            :endBounds="bounds.end"
            :pixelMultiplier="pixelMultiplier"
        />
    </ul>
  </div>
</template>

<script>
import TimelineActivity from './timelineActivity.vue';
import TimelineAxis from './timeSystemAxis.vue';
import Error from './error.vue';

const PIXEL_MULTIPLIER = 0.05;

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
        TimelineActivity,
        TimelineAxis,
        Error
    },
    computed: {
        inBoundsActivities() {
            return this.activities.filter(activity => {
                return (
                    activity.configuration.startTime <= this.bounds.end
                );
            })
        },
        inBoundErrors() {
            return this.errors.filter(error => {
                return (error.startTime <= this.bounds.end &&
                    error.startTime >= this.bounds.start);
            });
        },
        style() {
            return {
                'min-width': '100%',
                'overflow': 'hidden'
            }
        }
    },
    methods: {
        addActivity(activityDomainObject) {
            this.activities.push(activityDomainObject);

            if (this.activities.length === 2) {
                // this.addError(activityDomainObject);
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

            this.pixelMultiplier = width / boundsDiff;
        }
    },
    data() {
        return {
            activities: [],
            chronicles: [],
            bounds: {},
            timeSystem: {},
            pixelMultiplier: PIXEL_MULTIPLIER,
            errors: []
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
