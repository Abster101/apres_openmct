<template>
    <li 
        :style="activityStyle"
        :title="domainObject.name"
        class="timeline-activity"
        @mousedown="onMouseDown"
        @contextmenu.prevent="showContextMenu"
    >
        <span class="w-full text-align-center align-self-center">{{domainObject.name}}</span>
    </li>
</template>
<script>
import lodash from 'lodash';
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
        activityStyle() {
            return {
                'top': `${this.index * (ACTIVITY_HEIGHT + 4)}px`,
                'left': `${this.leftPosition}px`,
                'backgroundColor': this.getStyle('backgroundColor'),
                'border': this.border,
                'color': this.getStyle('color'),
                'width': `${this.width}px`,
                'max-height': `${ACTIVITY_HEIGHT}px`,
                'min-height': `${ACTIVITY_HEIGHT}px`,
                'cursor': this.isEditing ? 'grab' : 'auto'
            };
        },
        border(){
            let borderStyle = this.getStyle('border');

            const errorsViolatedObjFiltered = this.errors?.filter(error => {
                return error.actionID === this.domainObject.identifier.key;
            });

            const errorsViolatorsObjFiltered = this.errors?.filter(error => {
                for(const violator of error.violators){
                    return violator.objID === this.domainObject.identifier.key;
                }
            });

            if(errorsViolatedObjFiltered.length >= 1 && errorsViolatorsObjFiltered.length >= 1 && this.violationClicked){
                borderStyle = '2px solid #ff19c2';
            }else if(errorsViolatedObjFiltered.length >= 1 && this.violationClicked){
                borderStyle = '2px solid red';
            }else if(errorsViolatorsObjFiltered.length >= 1 && this.violationClicked){
                borderStyle = '2px solid #ecff19';
            }

            return borderStyle;
        },
        leftPosition() {
            const start = this.formatter.parse(this.configuration.startTime);

            return Math.floor((start - this.startBounds) / this.pixelMultiplier);
        },
        width() {
            return Math.floor(this.configuration.duration / this.pixelMultiplier);
        },
        configuration() {
            return this.parentDomainObject.configuration.activities[this.keystring];
        }
    },
    data() {
        let keystring = this.openmct.objects.makeKeyString(this.domainObject.identifier);
        let configuration = this.parentDomainObject.configuration.activities[keystring];
        let defaultStyle = {
            backgroundColor: this.domainObject.configuration.colorHex,
            border: this.domainObject.configuration.colorHex,
            color: 'gray'
        }

        return {
            keystring,
            defaultStyle,
            duration: configuration.duration,
            start: this.formatter.parse(configuration.startTime),
            end: configuration.startTime + configuration.duration,
            activityHeight: 0
        }
    },
    methods: {
        onMouseDown(event) {
            if (!this.isEditing) {
                return;
            }
            event.preventDefault();
            
            // Need to reset the start time because it may have changed from the inspector.
            this.start = this.formatter.parse(this.configuration.startTime);

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
            const configPath = `configuration.activities[${this.keystring}]`;
            const startTimestamp = this.formatter.format(this.start);
            const endTimestamp = this.formatter.format(this.start + this.duration);

            this.openmct.objects.mutate(this.parentDomainObject, `${configPath}.startTime`, startTimestamp);
            this.openmct.objects.mutate(this.parentDomainObject, `${configPath}.endTime`, endTimestamp);
        },
        initializeSelectable() {
            const configuration = this.parentDomainObject.configuration.activities[this.keystring]
            const backgroundColor = configuration.colorHex;

            let context = {
                layoutItem: {
                    fill: backgroundColor,
                    stroke: backgroundColor,
                    id: this.keystring,
                    type: 'apres.activity.type'
                }
            };

            this.removeSelectable = this.openmct.selection.selectable(this.$el, context);
        },
        getStyle(property) {
            const configuration = this.parentDomainObject.configuration;
            const objectStyles = configuration.objectStyles && configuration.objectStyles[this.keystring];

            if (objectStyles) {
                const staticStyle = objectStyles.staticStyle || {};
                const styles = staticStyle.style || {};

                return styles[property];
            }

            return this.defaultStyle[property];
        },
        getRemoveActionObject() {
            return {
                name: 'Remove',
                key: 'apres:remove-action',
                cssClass: 'icon-trash',
                description: 'Remove action from timeline.',
                callBack: (objectPath, viewProvider) => {
                    this.$emit('removeAction', this.keystring);
                },
                group: 'view'
            }
        },
        showContextMenu(event) {
            const removeAction = this.getRemoveActionObject();

            this.openmct.menus.showMenu(event.x, event.y, [removeAction]);
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
