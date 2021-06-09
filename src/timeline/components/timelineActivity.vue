<template>
    <li 
        :style="activityStyle"
        :title="domainObject.name"
        class="timeline-activity"
        @mousedown="onMouseDown"
    >
        <span class="align-self-center">{{domainObject.name}}</span>
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
                'top': `${this.index * (ACTIVITY_HEIGHT + 4)}px`,
                'left': `${this.leftPosition}px`,
                'backgroundColor': this.domainObject.configuration.colorHex,
                'width': `${this.width}px`,
                'max-height': `${ACTIVITY_HEIGHT}px`,
                'min-height': `${ACTIVITY_HEIGHT}px`,
                'cursor': this.isEditing ? 'grab' : 'auto'
            };
        },
        leftPosition() {
            return Math.floor((this.start - this.startBounds) / this.pixelMultiplier);
        },
        width() {
            return Math.floor(this.domainObject.configuration.duration / this.pixelMultiplier);
        }
    },
    data() {
        let configuration = this.domainObject.configuration;

        return {
            duration: configuration.duration,
            start: configuration.startTime,
            end: configuration.startTime + configuration.duration,
            activityHeight: 0
        }
    },
    methods: {
        isElementSelected() {
            return !!this.$el.attributes.getNamedItem('s-selected');
        },
        onMouseDown(event) {
            if (!this.isEditing || !this.isElementSelected()) {
                return;
            }
            event.preventDefault();
            document.addEventListener('mousemove', this.move);
            document.addEventListener('mouseup', this.endMove);

            this.clientX = event.clientX;
        },
        setStart(delta) {
            let start = this.start + delta;
            let end = start + this.duration

            if (start <= this.startBounds) {
                this.start = this.startBounds;
            } else if (end >= this.endBounds) {
                this.start = this.endBounds - this.duration;
            } else {
                this.start = start;
            }
        },
        move(event) {
            let delta = (event.clientX - this.clientX) * this.pixelMultiplier;

            this.setStart(delta);

            this.end = this.start + this.width;

            this.clientX = event.clientX;

            this.persistMove(); //needed to update inspector in realtime
        },
        endMove() {
            document.removeEventListener('mousemove', this.move);
            document.removeEventListener('mouseup', this.endMove);
            
            this.start = Math.floor(this.start);
            this.end = Math.floor(this.end);

            this.persistMove();
        },
        persistMove() {
            this.openmct.objects.mutate(this.domainObject, 'configuration.startTime', this.start);
        },
        initializeSelectable() {
            let context = {
                item: this.domainObject
            };

            this.removeSelectable = this.openmct.selection.selectable(this.$el, context);
        }
    },
    mounted() {
        let boundingClientRect = this.$el.getBoundingClientRect();
        
        this.activityHeight = boundingClientRect.height;

        this.initializeSelectable();
    },
    beforeDestroy() {
        this.removeSelectable();
    }
}
</script>
