<template>
    <div>
        <InspectorField
            v-for="attribute in allAttributes"
            :key="attribute.name"
            :label="attribute.name"

            FIXME="We have value coming from two totally different sources."
            :value="(configuration && configuration[attribute.name]) || attribute.default"

            :isEditable="isEditing && attribute.editable === true"
            :error="errors[attribute.name]"
            @valueChanged="setValue"
        />
    </div>
</template>

<script>
import {Parser} from 'expr-eval'
import InspectorField from './InspectorField.vue'

const digitsRegex = /^[0-9]+$/

export default {
    // TODO actionAttributes does not need to be injected, it can just be a prop, it is only ever used in this root component.
    inject: ['openmct', 'actionAttributes'],

    props: {
        actionObject: {
            type: Object,
            required: true,
            default: () => {
                return {}
            },
        },
        parentDomainObject: {
            type: Object,
            required: true,
            default: () => {
                return {}
            },
        },

        /** An array of ActionAttribute */
        uniqueAttributes: {
            type: Array,
            default: () => [],
        },

        /** The current action's duration formula string. */
        durationFormula: {
            type: String,
            default: "",
        },
    },
    components: {
        InspectorField,
    },
    computed: {
        startTime() {
            return this.configuration && this.configuration.startTime
        },
        duration() {
            return this.configuration && this.configuration.duration
        },
        configuration() {
            /** @type {TimelineDomainObject} */
            const domain = this.parentDomainObject

            return domain.configuration.activities[this.id]
        },

        /** @returns {ActionAttribute[]} */
        allAttributes() {
            /** @type {ActionAttribute[]} */
            const actionAttributes = this.actionAttributes

            /** @type {ActionAttribute[]} */
            const uniqueAttributes = this.uniqueAttributes

            // get specific attributes from the InterfaceModel json
            return [...actionAttributes, ...uniqueAttributes]
        },
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem()
        let timeFormatter = this.getFormatter(timeSystem.timeFormat)
        let id = this.actionObject.id

        return {
            isEditing: this.openmct.editor.isEditing(),
            errors: {},
            id,
            timeSystem,
            timeFormatter,
            value: '',
        }
    },
    methods: {
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key,
            }).formatter
        },
        setValue(key, value) {
            const val = value.trim()

            if (this.errors[key]) this.errors = {...this.errors, ...{[key]: undefined}}

            if (key === 'startTime') {
                // FIXME, timeFormatter fails when it shouldn't. Seems to happen
                // with the initial values that appear in the UI when first
                // selecting an action.  After clicking on another action, then
                // switching back, the format is changed and then it begins to
                // work.
                //
                // const isValid = this.timeFormatter.validate(value)
                const isValid = !isNaN(Date.parse(val))
                //                     ^ JS Date works.

                if (!isValid) {
                    this.errors = {...this.errors, ...{[key]: 'Enter valid time string. Either "YYYY-MM-DD HH:MM:SS.sssZ" or "YYYY-MM-DDTHH:MM:SSZ"'}}
                    return
                }

                const startTimeSeconds = this.timeFormatter.parse(val)
                const endTime = this.timeFormatter.format(startTimeSeconds + this.duration)

                this.updateDomainObject('startTime', val)
                this.updateDomainObject('endTime', endTime)

                return
            }

            /** @type {ActionAttribute[]} */
            const attributes = this.allAttributes
            const attribute = attributes.find(attr => attr.name === key)

            if (!attribute) throw new Error('Uh oh.')

            const type = attribute.modelType

            if (type?.name === 'integer') {
                if (!digitsRegex.test(val)) {
                    this.errors = {...this.errors, ...{[key]: 'Must be an integer'}}
                    return
                }
            }

            this.updateDomainObject(key, val)

            if (!this.durationFormula) return

            /** @type {ActionAttribute[]} */
            const attrs = this.uniqueAttributes

            /** @type {Record<string, number>} */
            const formulaInputs = {}

            /** @type {TimelineDomainObject['configuration']['activities'][0]} */
            const actionConfig = this.configuration

            for (const attr of attrs) {
                formulaInputs[attr.name] = actionConfig[attr.name] ?? 1
            }

            const duration = parseInt(Parser.evaluate(this.durationFormula, formulaInputs))
            const startTimeSeconds = parseInt(this.timeFormatter.parse(this.startTime))

            console.log('new duration:', startTimeSeconds + duration)
            debugger

            // Apparently action attributes are in milliseconds, but actionType seems to have default values in seconds.
            this.updateDomainObject('duration', duration * 1000)
            // this.updateDomainObject('endTime', startTimeSeconds + duration)
            this.updateDomainObject('endTime', this.timeFormatter.format(startTimeSeconds + duration))
        },

        /**
        @param {string} key
        @param {string | number} value
        */
        updateDomainObject(key, value) {
            /** @type {TimelineDomainObject} */
            const domain = this.parentDomainObject

            this.openmct.objects.mutate(domain, `configuration.activities[${this.id}][${key}]`, value)
        },

        setIsEditing(isEditing) {
            this.isEditing = isEditing
        },
    },
    mounted() {
        this.openmct.editor.on('isEditing', this.setIsEditing)
    },
    destroyed() {
        this.openmct.editor.off('isEditing', this.setIsEditing)
    },
}
</script>
