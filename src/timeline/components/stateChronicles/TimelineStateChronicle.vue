<template>
    <div
        :style="styleVars"
        class="state-chronicle"
        :title="domainObject.value"
        @mouseover="onMouseHover"
    >
  </div>
</template>

<style scoped>
    .state-chronicle {
        position: absolute;
        left: calc(1px * var(--left));
        width: calc(1px * var(--width));
        background: var(--backgroundColor);
        color: var(--textColor);
        height: 100%;
        cursor: var(--cursor);
    }
</style>

<script>
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
        styleVars() {
            return {
                '--left': this.leftPosition,
                '--width': this.width,
                '--backgroundColor': this.domainObject.colorHex,
                '--textColor': this.domainObject.textColorHex || 'white',
                '--cursor': this.isEditing ? 'grab' : 'auto',
            };
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
