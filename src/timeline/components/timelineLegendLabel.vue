<template>
<div :style="legendLabelStyle">
    <span>{{title}}</span>
</div>
</template>

<script>
import TimelineActivity from './timelineActivity.vue';
import TimelineStateChronicle from './timelineStateChronicle.vue';

const ACTIVITY_HEIGHT = 44;

export default {
    inject: ['openmct'],
    components: {
        TimelineActivity,
        TimelineStateChronicle
    },
    props: {
        numActivities: {
            type: Number,
            required: true,
            default() {
                return 1;
            }
        },
        title: {
            type: String
        }
    },
    computed: {
        legendLabelStyle() {
            return {
                'max-height': `${ACTIVITY_HEIGHT * this.numActivities}px`,
                'min-height': `${ACTIVITY_HEIGHT * this.numActivities}px`,
                'border-top': '2px solid #6c6c6c',
                'border-bottom': '2px solid #6c6c6c',
                'margin-top': '10px',
                'margin-bottom': '10px',
                'background': '#6c6c6c',
                'display': 'flex',
                'justify-content': 'center',
                'align-content': 'center',
                'flex-direction': 'column',
                'text-align': 'center',
                'color': '#dddddd'
            }
        }
    }
}
</script>
