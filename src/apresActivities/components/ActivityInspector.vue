<template>
<div>
    <InspectorField 
        v-for="attribute in actionAttributes"
        :key="attribute.name"
        :label="attribute.name"
        :value="configuration[attribute.name]"
        :isEditable="isEditing && attribute.editable === true"
        :error="errors[attribute.name]"
        @valueChanged="setValue"
    />
</div>
</template>

<script>
import InspectorField from './InspectorField.vue';

export default {
    inject: ['openmct', 'actionAttributes'],
    props: {
        actionObject: {
            type: Object,
            required: true,
            default: () => {
                return {};
            }
        },
        parentDomainObject: {
            type: Object,
            required: true,
            default: () => {
                return {};
            }
        }
    },
    components: {
        InspectorField
    },
    computed: {
        startTime() {
            return this.configuration.startTime;
        },
        duration() {
            return this.configuration.duration;
        },
        configuration() {
            return this.parentDomainObject.configuration.activities[this.id];
        }
    },
    data() {
        console.log(this.actionAttributes);
        let timeSystem = this.openmct.time.timeSystem();
        let formatter = this.getFormatter(timeSystem.timeFormat);
        let id = this.actionObject.id;

        return {
            isEditing: this.openmct.editor.isEditing(),
            errors: {},
            id,
            timeSystem,
            formatter
        }
    },
    methods: {
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        setValue(key, value) {
            if (key === 'startTime' || key === 'endTime') {
                if(this.errors[key]) {
                    this.errors[key] = undefined;
                }
                if (this.formatter.validate(value)) {
                    this.persistValue(key, value)
                } else {
                    this.errors[key] = 'Enter valid time string';
                }
            } else {
                this.persistValue(key, value);
            }
        },
        persistValue(key, value) {
            this.openmct.objects.mutate(this.parentDomainObject, `configuration.activities[${this.id}][${key}]`, value);
        },
        setIsEditing(isEditing) {
            this.isEditing = isEditing;
        }
    },
    mounted() {
        this.openmct.editor.on('isEditing', this.setIsEditing);
    },
    unmounted() {
        this.openmct.editor.off('isEditing', this.setIsEditing);
    }
}
</script>