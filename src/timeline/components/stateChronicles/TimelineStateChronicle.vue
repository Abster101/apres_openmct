<template>
    <li
        :style="activityStyle"
        :title="domainObject.value"
        @mouseover="onMouseHover"
    >
  </li>
</template>
<script>

const ACTIVITY_HEIGHT = 40;
const NUMERIC_HEIGHT = 34

export default {
    inject: ['openmct'],
    props: {
        domainObject: {
            type: Object,
            required: true,
            default() {
                return  {
                    configuration: {}
                }
            }
        },
        parentDomainObject: {
            type: Object,
            required: true,
            default() {
                return  {
                    configuration: {}
                }
            }
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
        endPoints: {
            type: Object
        },
        pixelMultiplier: {
            type: Number
        },
        formatter: {
            type: Object
        },
        projectEndTime:{
            type:String
        }
    },
    emits: ['onEpisodeHover'],
    computed: {
        activityStyle() {
            const stateChronicles = {
                'position': 'absolute',
                'left': `${this.leftPosition}px`,
                'width': `${this.width}px`,
                'backgroundColor': this.domainObject.colorHex,
                'color': this.domainObject.textColorHex,
                'max-height': `${ACTIVITY_HEIGHT}px`,
                'min-height': `${ACTIVITY_HEIGHT}px`,
                'cursor': this.isEditing ? 'grab' : 'auto',
            };
            return stateChronicles;
        },
        leftPosition() {
            const start = this.formatter.parse(this.domainObject.time);
            const end = start + this.domainObject.duration;

            let position = Math.floor((start - this.startBounds) / this.pixelMultiplier);

            if(start < this.startBounds && end > this.endBounds){
                position = 0;
            }

            return position;
        },
        width() {
            const width = Math.floor(this.domainObject.duration / this.pixelMultiplier);
            
            return width;
        },
    },
    methods: {
        onMouseHover() {
            this.$emit('onEpisodeHover', this.domainObject.value);
        },
    },
    mounted() {
    },
}
</script>
<style scoped>

</style>
