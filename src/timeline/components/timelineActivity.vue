<template>
    <li 
        :style="activityStyle"
        @mousedown="onMouseDown"
    >
        {{ name }}
    </li>
</template>
<script>
import activityViewVue from '../../apresActivities/components/activityView.vue';

const ACTIVITY_HEIGHT = 40;

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
        }
    },
    computed: {
        activityStyle() {
            return {
                'position': 'absolute',
                'top': `${this.index * (ACTIVITY_HEIGHT + 4)}px`,
                'left': `${this.leftPosition}px`,
                'backgroundColor': this.color,
                'width': `${this.duration * this.pixelMultiplier * 100}px`,
                'padding': '10px',
                'max-height': `${ACTIVITY_HEIGHT}px`,
                'min-height': `${ACTIVITY_HEIGHT}px`,
                'display': 'flex',
                'align-items': 'center'
            };
        },
        leftPosition() {
            return (this.start - this.startBounds) * this.pixelMultiplier;
        }
    },
    data() {
        let configuration = this.domainObject.configuration;

        return {
            name: this.domainObject.name,
            start: configuration.startTime,
            duration: configuration.duration,
            end: configuration.startTime + configuration.duration,
            color: configuration.colorHex,
            activityHeight: 0
        }
    },
    methods: {
        onMouseDown(event) {
            if (!this.isEditing) {
                return;
            }
            event.preventDefault();
            document.addEventListener('mousemove', this.move);
            document.addEventListener('mouseup', this.endMove);

            this.clientX = event.clientX;
        },
        move(event) {
            let delta = (event.clientX - this.clientX) / this.pixelMultiplier;

            this.start += delta;
            this.end = this.start + this.width;

            this.clientX = event.clientX;
        },
        endMove() {
            document.removeEventListener('mousemove', this.move);
            document.removeEventListener('mouseup', this.endMove);

            this.persistMove();
        },
        persistMove() {
            this.openmct.objects.mutate(this.domainObject, 'configuration.startTime', this.start);
        }
    },
    mounted() {
        let boundingClientRect = this.$el.getBoundingClientRect();
        
        this.activityHeight = boundingClientRect.height;
    }
}
</script>
