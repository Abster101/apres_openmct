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
        },
        numericHeightInfo: {
            type: Array
        },
    },
    computed: {
        legendLabelStyle() {
            return {
                'height': `${this.height}px`,
                'min-height': `44px`,
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
        },
        height() {
            if (typeof this.numericHeightInfo === 'undefined' || this.numericHeightInfo?.length === 0) {
                return ACTIVITY_HEIGHT * this.numActivities;
            } else {
                const match = this.numericHeightInfo.filter((info) => {
                    return this.title === info.name;
                })

                if(match.length > 0){
                    return match[0].height;
                }
            }
        },
    }
}
</script>
