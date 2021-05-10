<template>
  <div
    ref="timeline-container"
    :style="style">
        <ul style="min-width: 100%; min-height: 100%; position: relative;">
            <timeline-activity
                v-for="(activityDomainObject, index) in inBoundsActivities"
                :key="activityDomainObject.identifier.key"
                :domainObject="activityDomainObject"
                :index="index"
                :isEditing="isEditing"
                :startBounds="start"
                :endBounds="end"
                :pixelMultiplier="pixelMultiplier"
            />
        </ul>
  </div>
</template>

<script>
import TimelineActivity from './timelineActivity.vue';
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
        TimelineActivity
    },
    computed: {
        inBoundsActivities() {
            return this.activities.filter(activity => {
                return (
                    activity.configuration.startTime <= this.end
                );
            })
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

            this.start = timeBounds.start;
            this.end = timeBounds.end;

            this.initializePixelMultiplier();
        },
        initializePixelMultiplier() {
            let container = this.$refs['timeline-container'];
            let boundingClientRect = container.getBoundingClientRect();
            let width = boundingClientRect.width;
            let boundsDiff = this.end - this.start;

            this.pixelMultiplier = width / boundsDiff;
        }
    },
    data() {
        return {
            activities: [],
            chronicles: [],
            startBounds: 0,
            endBounds:0,
            pixelMultiplier: PIXEL_MULTIPLIER
        }
    },
    mounted() {
        this.openmct.time.on('bounds', this.initializeTimeBounds);
        this.initializeTimeBounds(this.openmct.time.bounds());

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
