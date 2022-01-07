<template>
<div :style="styleVars" class="legend-label">
    <span>{{title}}</span>
</div>
</template>

<style scoped>
    .legend-label {
        height: calc(1px * var(--height));
        min-height: calc(1px * var(--minHeight));
        border-bottom: 1px solid #444;
        background: #6c6c6c;
        display: flex;
        justify-content: center;
        align-content: center;
        flex-direction: column;
        text-align: center;
        color: #dddddd;
    }

    .legend-label:first-of-type {
        border-top: 1px solid #444;
    }

    .legend-label:nth-child(2n) {
        background: #6c6c6ccc;
    }
</style>

<script>
import { ACTIVITY_HEIGHT } from './shared-constants';
import TimelineActivity from './timelineActivity.vue';

export default {
    inject: ['openmct'],
    components: {
        TimelineActivity,
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
        index: {
            type: Number
        },
    },
    computed: {
        styleVars() {
            return {
                '--height': this.height,
                // FIXME ROWS: Remove this. See "FIXME ROWS" in timeline.vue
                '--minHeight': ACTIVITY_HEIGHT
            }
        },
        height() {
            // FIXME ROWS: Remove numericHeightInfo. See "FIXME ROWS" in timeline.vue
            if (typeof this.numericHeightInfo === 'undefined' || this.numericHeightInfo?.length === 0) {
                return ACTIVITY_HEIGHT * this.numActivities;
            } else {
                const match = this.numericHeightInfo.filter((info) => {
                    return this.index === info.index;
                });

                if(match.length > 0){
                    return match[0].height;
                }
            }
        },
    }
}
</script>
