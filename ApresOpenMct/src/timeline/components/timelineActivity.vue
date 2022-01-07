<template>
    <li 
        :style="styleVars"
        :title="domainObject.name"
        class="timeline-activity"
        :class="{ 'has-error': violationClicked && hasError }"
        @mousedown="onMouseDown"
        @contextmenu.prevent="showContextMenu"
    >
        <span class="p-2 text-align-center align-self-center text-gray text-shadow-gray">{{domainObject.name}}</span>
    </li>
</template>

<style scoped>
    .timeline-activity {
        border-radius: 4px;
        top: calc( 1px * ( var(--index) * ( var(--ACTIVITY_HEIGHT) + 4 ) ) );
        left: calc(1px * var(--left));
        background: rgb(var(--backgroundColor));
        border: 2px solid rgb(var(--borderColor));
        color: var(--textColor);
        width: calc(1px * var(--width));
        cursor: var(--cursor);
        height: calc(1px * var(--ACTIVITY_HEIGHT));
    }

    .timeline-activity[s-selected] {
        border: 2px solid rgb(var(--selectionColor)) !important; /* override s-selected */
        opacity: 1; /* override s-selected */
        box-shadow:
            0px 0px 0px 3px rgb(var(--selectionColor) / 50%),
            inset 0px 0px 9999999px rgb(var(--selectionColor))
            !important;
    }

    .timeline-activity.has-error {
        border: 2px solid rgb(var(--borderColor)) !important;
        box-shadow: 0px 0px 0px 3px rgb(var(--borderColor) / 25%);
    }
</style>

<script>
import {colord} from 'colord'
import { ACTIVITY_HEIGHT_FIXME } from './shared-constants'

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
        styleVars() {
            return {
                '--selectionColor': '0 153 204',
                '--index': this.index,
                '--ACTIVITY_HEIGHT': ACTIVITY_HEIGHT_FIXME,
                '--left': this.leftPosition,
                '--backgroundColor': this.background,
                '--borderColor': this.borderColor,
                '--textColor': this.getStyle('color') || 'white',
                '--width': this.width,
                '--cursor': this.isEditing ? 'grab' : 'auto',
            }
        },
        background() {
            const bg = this.getStyle('backgroundColor');

            // Prevent colors from beeing too hard/bright.

            let c = colord(bg)
            const hsl = c.toHsl()

            if (hsl.l > 70) c = c.darken((hsl.l/100) - 0.7)
            if (hsl.s > 60) c = c.desaturate((hsl.s/100) - 0.6)

            c = c.darken(0.15)

            const rgb = c.toRgb()

            return `${rgb.r} ${rgb.g} ${rgb.b}`
        },
        isViolated() {
            return this.errors?.some(error => {
                return error.actionID === this.domainObject.identifier.key;
            });
        },
        isViolator() {
            return this.errors?.some(error => {
                for(const violator of error.violators){
                    return violator.objID === this.domainObject.identifier.key;
                }
            });
        },
        hasError() {
            return this.isViolated || this.isViolator
        },
        borderColor(){
            let borderColor = ''

            if (this.isViolated && this.isViolator && this.violationClicked) borderColor = '#ff19c2';
            else if(this.isViolated && this.violationClicked) borderColor = '#ff0000';
            else if(this.isViolator && this.violationClicked) borderColor = '#ecff19';

            if (borderColor) {
                const rgb = colord(borderColor).toRgb()
                return `${rgb.r} ${rgb.g} ${rgb.b}`
            }

            borderColor = this.getStyle('border') || this.getStyle('backgroundColor');

            // Prevent colors from beeing too hard/bright.

            let c = colord(borderColor)
            const hsl = c.toHsl()

            if (hsl.l > 70) c = c.darken((hsl.l/100) - 0.7)
            if (hsl.s > 60) c = c.desaturate((hsl.s/100) - 0.6)

            const rgb = c.toRgb()

            return `${rgb.r} ${rgb.g} ${rgb.b}`
        },
        leftPosition() {
            const start = this.formatter.parse(this.configuration.startTime);

            return Math.floor((start - this.startBounds) / this.pixelMultiplier);
        },
        width() {
            return Math.floor(this.configuration.duration / this.pixelMultiplier);
        },
        configuration() {
            if (this.domainObject.activityType === 'process') {
                return this.parentDomainObject.configuration.processes[this.keystring];
            }

            return this.parentDomainObject.configuration.activities[this.keystring];
        }
    },
    data() {
        let keystring = this.openmct.objects.makeKeyString(this.domainObject.identifier);
        let configuration;

        if (this.domainObject.activityType === 'process') {
            configuration = this.parentDomainObject.configuration.processes[keystring];
        } else {
            configuration = this.parentDomainObject.configuration.activities[keystring];
        }

        let defaultStyle = {
            backgroundColor: this.domainObject.configuration.colorHex,
            border: this.domainObject.configuration.colorHex,
            color: '#dddddd'
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
            if (!this.isEditing || this.domainObject.activityType === 'process') {
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
            const backgroundColor = this.configuration.colorHex;

            let context = {
                layoutItem: {
                    fill: backgroundColor,
                    stroke: backgroundColor,
                    id: this.keystring,
                    type: 'apres.activity.type',
                    activityType: this.domainObject.activityType
                }
            };

            this.removeSelectable = this.openmct.selection.selectable(this.$el, context);
        },
        getStyle(property) {
            const objectStyles = this.configuration.objectStyles && this.configuration.objectStyles[this.keystring];

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
                onItemClicked: () => {
                    this.$emit('removeAction', this.keystring);
                },
                group: 'view'
            }
        },
        showContextMenu(event) {
            if (!this.isEditing) {
                return;
            }

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
