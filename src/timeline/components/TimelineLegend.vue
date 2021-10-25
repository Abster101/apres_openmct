<template>
<ul :style="legendStyle">
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
    />
</ul>
</template>

<script>
import TimelineActivity from './TimelineActivity.vue';

const ACTIVITY_HEIGHT = 44;

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
        legendStyle() {
            return {
                'position': 'relative',
                'max-height': `${ACTIVITY_HEIGHT * this.activities.length}px`,
                'min-height': `${ACTIVITY_HEIGHT * this.activities.length}px`,
                'border-top': '2px solid #6c6c6c',
                'border-bottom': '2px solid #6c6c6c',
                'margin-top': '10px',
				'margin-bottom': '10px',
            }
        },
        titleStyle() {
            return {
                'max-height': `${(ACTIVITY_HEIGHT * this.activities.length) - 4}px`,
                'min-height': `${(ACTIVITY_HEIGHT * this.activities.length) - 4}px`,
                'width': '120px',
                'background': '#6c6c6c',
                'display': 'flex',
                'justify-content': 'center',
                'align-content': 'center',
                'flex-direction': 'column',
                'text-align': 'center',
                'color': '#dddddd'
            }
        },
        inBoundsActivities() {
            return this.activities.filter(activity => {
                return (
                    this.formatter.parse(activity.configuration.startTime) <= this.endBounds
                );
            })
        }
    }
}
</script>