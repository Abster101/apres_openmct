<template>
<ul :style="styleVars" class="timeline-legend">
    <timeline-activity
        v-for="(activityDomainObject, index) in inBoundsActivities"
        :key="activityDomainObject.identifier.key"
        :domainObject="activityDomainObject"
        :parentDomainObject="parentDomainObject"
        :index="index"
        :isEditing="isEditing"
        :startBounds="startBounds"
        :endBounds="endBounds"
        :pixelMultiplier="pixelMultiplier"
        :formatter="formatter"
        :errors="errors"
        :violationClicked="violationClicked"
        @removeAction="removeAction"
    />
</ul>
</template>

<style scoped>
    .timeline-legend {
        position: relative;
        border-bottom: 1px solid #444;

        height: calc(1px * var(--ACTIVITY_HEIGHT) * var(--ACTIVITY_COUNT));
    }

    .timeline-legend:first-of-type {
        border-top: 1px solid #444;
    }

    .timeline-legend:nth-child(2n) {
        background-color: rgba(0,0,0,0.2);
    }
</style>

<script>
import { ACTIVITY_HEIGHT } from './shared-constants';
import TimelineActivity from './timelineActivity.vue';

export default {
    inject: ['openmct'],
    components: {
        TimelineActivity
    },
    props: {
        activities: {
            type: Array,
            required: true,
            default() {
                return [];
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
    computed: {
        styleVars() {
            return {
                "--ACTIVITY_COUNT": this.activities.length,
                "--ACTIVITY_HEIGHT": ACTIVITY_HEIGHT,
            }
        },
        inBoundsActivities() {
            return this.activities;
        }
    },
    methods: {
         removeAction(actionId) {
            const payload = {
                actionId,
                legendId: this.title
            }
            this.$emit('removeAction', payload);
        }
    }
}
</script>