<template>
    <div>
        <!-- Trick: The expression `configuration &&` in the `:value` attribute
        below serves to ensure that the template remains reactive to changes in
        `configuration`. -->
        <InspectorField
            v-for="attribute in allAttributes"
            :key="attribute.name"
            :label="attribute.name + (attribute.units ? ` (${attribute.units})` : '')"
            :value="configuration && currentUIValues[attribute.name]"
            :isEditable="isEditing && attribute.editable === true"
            :error="errors[attribute.name]"
            @valueChanged="(value) => setValue(attribute.name, value)"
        />
    </div>
</template>

<script>
import { Parser } from 'expr-eval';
import r from 'regexr';
import timelineUtil from '../../lib/timelineUtil';
import InspectorField from './InspectorField.vue';

const digitsRegex = r`[0-9]+`;
const integerRegex = r`^${digitsRegex}$`;
const rationalNumberRegex = r`^${digitsRegex}\.?(${digitsRegex})?$`;

export default {
    inject: ['openmct', 'globalAttributes'],

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
            /** @type {Record<string, string>} */
            currentUIValues: {},
        };
    },
    created() {
        /** @type {TimelineModelAttribute[]} */
        const attributes = this.allAttributes

        for (const attribute of attributes) {
            this.currentUIValues[attribute.name] = this.formattedValueForDisplay(attribute)
        }
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

        /** @returns {TimelineModelAttribute[]} */
        allAttributes() {
            /** @type {TimelineModelAttribute[]} */
            const globalAttributes = this.globalAttributes

            /** @type {TimelineModelAttribute[]} The attributes specific to the selected action. */
            const uniqueAttributes = this.uniqueAttributes;

            return [...globalAttributes, ...uniqueAttributes];
        }
    },
    methods: {
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        /** @param {TimelineModelAttribute} attribute */
        formattedValueForDisplay(attribute) {

            // Special cases: actionName and procesName are stored as name in
            // the domain object. Similarly actionType and processType are stored as type.
            /** @type {keyof ActivityConfig} */
            const attributeName = ['actionName', 'processName'].includes(attribute.name) 
                ? 'name'
                : ['actionType', 'processType'].includes(attribute.name)
                ? 'type'
                : attribute.name

            /** @type {ActivityConfig} */
            const activityConfig = this.configuration

            // FIXME: old schemas has a "default" property, but new ones don't.
            // Report to John?
            let value = activityConfig[attributeName] 

            if (attributeName === 'name') value = value || activityConfig.activityType || ""

            // duration is in ms but show it as human readable like "2hr 3m 3.734s"
            else if (attributeName === 'duration') value = msToHuman(value)

            else if (attributeName === 'drillDur') {
                value = value ??
                    activityConfig.duration != null
                        ? activityConfig.duration / 1000
                        : timelineUtil.getDuration() / 1000
            }

            return String(value)
        },
        /**
        @param {string} key
        @param {string} value
        */
        setValue(key, value) {
            const val = value.trim();

            this.currentUIValues[key] = val

            if (this.errors[key]) {
                this.errors = { ...this.errors, ...{ [key]: undefined } };
            }

            /** @type {TimelineModelAttribute[]} */
            const globalAttrs = this.globalAttributes

            if (globalAttrs.some(a => key === a.name)) {
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

                    this.updateActivityConfig('endTime', endTime);
                    this.updateActivityConfig(key, val);
                } else if (key === 'actionName' || key === 'processName') {
                    const isValid = !!val

                    if (!isValid) {
                        this.errors[key] = 'Name is required.';
                        this.errors = { ...this.errors };
                    }

                    key = 'name'

                    this.updateActivityConfig(key, val);
                }

                return;
            }

            // After this point is handling of unique parameters that are used
            // only (for now) in calculating an activity's duration.

            /** @type {TimelineModelAttribute[]} */
            const attributes = this.allAttributes;
            const attribute = attributes.find(attr => attr.name === key);

            if (!attribute) throw new Error('Impossible!');

            const modelType = attribute.modelType;
            const type = (typeof modelType === 'object' && modelType.name)
                || (typeof modelType === 'string' && modelType)

            if (type === 'integer') {
                if (!integerRegex.test(val)) {
                    this.errors = { ...this.errors, ...{ [key]: 'Must be an integer' } };
                    return;
                }
            }
            else if (type === 'rational') {
                if (!rationalNumberRegex.test(val)) {
                    this.errors = { ...this.errors, ...{ [key]: 'Must be an rational number' } };
                    return;
                }
            }

            this.updateActivityConfig(key, val);

            // An empty string means no formula.
            if (!this.durationFormula) return;

            // We only need to instantiate the formula once initially.
            if (!this._durationFormula) this._durationFormula = Parser.parse(this.durationFormula)

            /** @type {ReturnType<(typeof Parser)['parse']>} */
            const durationFormula = this._durationFormula

            /** @type {TimelineModelAttribute[]} */
            const attrs = this.uniqueAttributes;

            /** @type {ActivityConfig} */
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
            this.updateActivityConfig('duration', durationSeconds * 1000);
            this.updateActivityConfig('endTime', this.timeFormatter.format(endTimeMs));
        },

        /**
        @param {string} key
        @param {string | number} value
        */
        updateActivityConfig(key, value) {
            // The user does not update processes, those are auto-generated.
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

/**
Convert milliseconds to a human readable time like 1h 2m 30s.
@param {number} duration
*/
function msToHuman(duration) {
    const seconds = (duration / 1000) % 60
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    return `${hours}hr ${minutes}m ${seconds.toFixed(3)}s`
}

</script>
