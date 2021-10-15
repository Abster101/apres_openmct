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

        this.height;

        const numeric = {
            'position': 'absolute',
            'height': '7px',
            'width': '7px',
            'backgroundColor': this.domainObject.colorHex,
            'border-radius': '50%',
            'left': `${this.leftPosition}px`,
            'top' : `${this.height}px`,
            'cursor': this.isEditing ? 'grab' : 'auto',
        }
        
        if (!isNaN(this.domainObject.value)) {
            return numeric;
        } else {
            return stateChronicles;
        }
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
    height() {
        if(this.endPoints){
            const top = 0;
            const value = parseFloat(this.domainObject.value);
            const boundsDiff = this.endPoints.max - this.endPoints.min;
            const pixelHeightMultiplier = boundsDiff / NUMERIC_HEIGHT;
            let height = 0;

            if(this.endPoints.max === value) {
                height = 0;
            } else if (this.endPoints.min === value) {
                height = NUMERIC_HEIGHT;
            } else {
                const diff = this.endPoints.max - value;
                height = Math.floor(diff / pixelHeightMultiplier);
            }

            return height;
        }
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
