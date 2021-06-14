<template>
<div class="c-inspector__properties c-inspect-properties">
    <div class="c-inspect-properties__header"> Activity </div>
    <ul class="c-inspect-properties__section">
        <li class="c-inspect-properties__row">
            <div class="c-inspect-properties__label">Start Time: </div>
            <div class="c-inspect-properties__value">{{startTime}}</div>
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
            return this.timeFormatter.format(this.domainObject.configuration.startTime);
        },
        duration() {
            return this.domainObject.configuration.duration / 1000;
        }
    },
    data() {
        let timeSystem = this.openmct.time.timeSystem();
        let timeFormatter = this.getFormatter(timeSystem.timeFormat);

        return {
            timeSystem,
            timeFormatter
        }
    },
    methods: {
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        }
    }
}
</script>