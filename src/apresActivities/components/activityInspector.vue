<template>
<div class="c-inspector__properties c-inspect-properties">
    <div class="c-inspect-properties__header"> Activity </div>
    <ul 
        v-if="!isEditing"
        class="c-inspect-properties__section"
    >
        <li class="c-inspect-properties__row">
            <div class="c-inspect-properties__label">Start Time: </div>
            <div class="c-inspect-properties__value">{{startTime}}</div>
        </li>
        <li class="c-inspect-properties__row">
            <div class="c-inspect-properties__label">Duration (seconds): </div>
            <div class="c-inspect-properties__value">{{duration}}</div>
        </li>
    </ul>
    <ul
        v-else
    >
        <li class="c-inspect-properties__row">
            <div class="c-inspect-properties__label">Start Time: </div>
            <div class="c-inspect-properties__value">
                <input
                    class="c-input--datetime"
                    type="text"
                    :value="startTime"
                    @blur="setStartTime"
                />
            </div>
            <div 
                class="c-inspect-properties__value"
                style="color: red;"
            >
                {{error}}
            </div>
        </li>
        <li class="c-inspect-properties__row">
            <div class="c-inspect-properties__label">Duration (seconds): </div>
            <div class="c-inspect-properties__value">{{duration}}</div>
        </li>
    </ul>
</div>
</template>

<script>

export default {
    inject: ['openmct'],
    props: {
        domainObject: {
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
    computed: {
        startTime() {
            return this.configuration.startTime;
        },
        duration() {
            return this.configuration.duration / 1000;
        },
        configuration() {
            return this.parentDomainObject.configuration.activities[this.keystring];
        }
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let formatter = this.getFormatter(timeSystem.timeFormat);
        let keystring = this.openmct.objects.makeKeyString(this.domainObject.identifier);

        return {
            isEditing: this.openmct.editor.isEditing(),
            error: undefined,
            keystring,
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
        setStartTime(event) {
            this.error = undefined;

            const value = event.target.value;

            if (this.formatter.validate(value)) {
                this.persistStartTime(value)
            } else {
                this.error = "Enter valid time string";
            }
        },
        persistStartTime(value) {
            this.openmct.objects.mutate(this.parentDomainObject, `configuration.activities[${this.keystring}].startTime`, value);
        }
    }
}
</script>