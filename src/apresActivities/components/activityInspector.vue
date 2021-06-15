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
        }
    },
    computed: {
        startTime() {
            return this.domainObject.configuration.startTime;
        },
        duration() {
            return this.domainObject.configuration.duration / 1000;
        }
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let formatter = this.getFormatter(timeSystem.timeFormat);

        return {
            isEditing: this.openmct.editor.isEditing(),
            error: undefined,
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
            this.openmct.objects.mutate(this.domainObject, 'configuration.startTime', value);
        }
    }
}
</script>