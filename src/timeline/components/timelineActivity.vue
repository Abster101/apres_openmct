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
const PIXEL_MULTIPLIER = 0.05;

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
        }
    },
    computed: {
        activityStyle() {
            return {
                'position': 'absolute',
                'top': `${this.index * (this.activityHeight + 4)}px`,
                'left': `${this.start * PIXEL_MULTIPLIER}px`,
                'backgroundColor': this.color,
                'width': `${this.end * PIXEL_MULTIPLIER}px`,
                'padding': '10px'
            };
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
            let delta = (event.clientX - this.clientX) / PIXEL_MULTIPLIER;

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
            console.log('persist');
            // this.openmct.objects.mutate(this.domainObject, 'configuration.startTime', this.start);
        }
    },
    mounted() {
        let boundingClientRect = this.$el.getBoundingClientRect();
        
        this.activityHeight = boundingClientRect.height;
    }
}
</script>
