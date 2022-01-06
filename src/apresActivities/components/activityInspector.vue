<template>
    <div>
        <!-- Trick: The expression `configuration &&` in the `:value` attribute
        below serves to ensure that the template remains reactive to changes in
        `configuration`. -->
        <InspectorField
            v-for="attribute in allAttributes"
            :key="attribute.name"
            :label="attribute.name + (attribute.units ? ` (${attribute.units})` : '')"
            :value="configuration && formattedValueForDisplay(attribute)"
            :isEditable="isEditing && attribute.editable === true"
            :error="errors[attribute.name]"
            @valueChanged="(value) => setValue(attribute.name, value)"
        />
    </div>
</template>

<script>
import { Parser } from 'expr-eval';
import InspectorField from './InspectorField.vue';

const digitsRegex = /^[0-9]+$/;

export default {
    // TODO actionAttributes could be a prop because it is only ever used in this root component, not injected into a deep component.
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
        },

        /** An array of ActionAttribute */
        uniqueAttributes: {
            type: Array,
            default: () => []
        },

        /** The current action's duration formula string. */
        durationFormula: {
            type: String,
            default: ''
        }
    },
    components: {
        InspectorField
    },
    computed: {
        startTime() {
            return this.configuration.startTime;
        },
        // in milliseconds
        duration() {
            return this.configuration.duration;
        },
        configuration() {
            /** @type {TimelineDomainObject} */
            const domain = this.parentDomainObject;

            if (this.actionObject.activityType === 'process') {
                return domain.configuration.processes[this.id];
            }

            return domain.configuration.activities[this.id];
        },

        /** @returns {ModelAttribute[]} */
        allAttributes() {
            /** @type {ModelAttribute[]} The global attributes. */
            const actionAttributes = this.actionAttributes;

            /** @type {ModelAttribute[]} The attributes specific to the selected action. */
            const uniqueAttributes = this.uniqueAttributes;

            return [...actionAttributes, ...uniqueAttributes];
        }
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let timeFormatter = this.getFormatter(timeSystem.timeFormat);
        let id = this.actionObject.id;

        return {
            isEditing: this.openmct.editor.isEditing(),
            errors: {},
            id,
            timeSystem,
            timeFormatter,
            value: ''
        };
    },
    methods: {
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        formattedValueForDisplay(attribute) {
            let value = (this.configuration[attribute.name]) || attribute.default

            // duration is in ms but show it as human readable like "2hr 3m 3.734s"
            if (attribute.name === 'duration') value = msToHuman(value)

            return String(value)
        },
        setValue(key, value) {
            const val = value.trim();

            if (this.errors[key]) {
                this.errors = { ...this.errors, ...{ [key]: undefined } };
            }

            if (key === 'startTime') {
                // FIXME in OpenMCT, timeFormatter fails when it shouldn't. Seems to happen
                // with the initial values that appear in the UI when first
                // selecting an action.  After clicking on another action, then
                // switching back, the format is changed and then it begins to
                // work.
                //
                // const isValid = this.timeFormatter.validate(value)
                const isValid = !isNaN(Date.parse(val));
                //                     ^ JS Date works.

                if (!isValid) {
                    this.errors[key] =
                        'Invalid time string. Format is "YYYY-MM-DD HH:MM:SS.sssZ" or "YYYY-MM-DDTHH:MM:SSZ"';
                    this.errors = { ...this.errors };
                    return;
                }

                const startTimeSeconds = this.timeFormatter.parse(val);
                const endTime = this.timeFormatter.format(startTimeSeconds + this.duration);

                this.updateDomainObject('startTime', val);
                this.updateDomainObject('endTime', endTime);

                return;
            }

            /** @type {ModelAttribute[]} */
            const attributes = this.allAttributes;
            const attribute = attributes.find(attr => attr.name === key);

            if (!attribute) throw new Error('Impossible!');

            const type = attribute.modelType;

            if (type?.name === 'integer') {
                if (!digitsRegex.test(val)) {
                    this.errors = { ...this.errors, ...{ [key]: 'Must be an integer' } };
                    return;
                }
            }

            // TODO validate unique parameters based on their type
            this.updateDomainObject(key, val);

            // An empty string means no formula.
            if (!this.durationFormula) return;

            // We only need to instantiate the formula once initially.
            if (!this._durationFormula) this._durationFormula = Parser.parse(this.durationFormula)

            /** @type {ReturnType<(typeof Parser)['parse']>} */
            const durationFormula = this._durationFormula

            /** @type {ModelAttribute[]} */
            const attrs = this.uniqueAttributes;

            /** @type {TimelineDomainObject['configuration']['activities'][0]} */
            const activityConfig = this.configuration;

            /** @type {Record<string, number>} */
            const formulaInputs = {};

            for (const attr of attrs) {
                // Default to 1 in case a value is missing so nothing crashes from divide-by-zero or similar.
                formulaInputs[attr.name] = parseFloat(activityConfig[attr.name] ?? "1");
            }

            /** @type {number} */
            const durationSeconds = durationFormula.evaluate(formulaInputs)

            /** @type {number} */
            const startTimeMs = this.timeFormatter.parse(this.startTime);

            /** @type {number} */
            const endTimeMs = startTimeMs + durationSeconds * 1000;

            // actionType uses seconds, but the action's duration is in milliseconds
            this.updateDomainObject('duration', durationSeconds * 1000);
            this.updateDomainObject('endTime', this.timeFormatter.format(endTimeMs));
        },

        /**
        @param {string} key
        @param {string | number} value
        */
        updateDomainObject(key, value) {
            if (this.actionObject.activityType === 'process') {
                return;
            }

            /** @type {TimelineDomainObject} */
            const domain = this.parentDomainObject;

            this.openmct.objects.mutate(domain, `configuration.activities[${this.id}][${key}]`, value);
        },

        setIsEditing(isEditing) {
            this.isEditing = isEditing;
        }
    },
    mounted() {
        this.openmct.editor.on('isEditing', this.setIsEditing);
    },
    destroyed() {
        this.openmct.editor.off('isEditing', this.setIsEditing);
    }
};

function msToHuman(duration) {
    const seconds = (duration / 1000) % 60
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    return `${hours}hr ${minutes}m ${seconds.toFixed(3)}s`
}

</script>
