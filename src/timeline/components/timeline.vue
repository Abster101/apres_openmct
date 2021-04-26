<template>
  <div style="min-width: 100%">
        <ul style="min-width: 100%; min-height: 100%; position: relative;">
            <timeline-activity
                v-for="(activityDomainObject, index) in activities"
                :key="activityDomainObject.identifier.key"
                :domainObject="activityDomainObject"
                :index="index"
                :isEditing="isEditing"
            />
        </ul>
  </div>
</template>

<script>
import TimelineActivity from './timelineActivity.vue';


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
        }
    },
    data() {
        return {
            activities: [],
            chronicles: []
        }
    },
    mounted() {
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
    }
}
</script>

<style lang="scss">
</style>
