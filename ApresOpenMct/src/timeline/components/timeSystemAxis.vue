<template>
<div
    ref="axisHolder"
    class="c-timesystem-axis"
>
    <div
        class="c-conductor-axis__zoom-indicator"
    ></div>
</div>
</template>

<script>

// Why did we fork from src/ui/components/TimeSystemAxis.vue in OpenMCT?

import * as d3Selection from 'd3-selection';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import utcMultiTimeFormat from '../utcMultiTimeFormat.js';
const PADDING = 1;
const DEFAULT_DURATION_FORMATTER = 'duration';
const RESIZE_POLL_INTERVAL = 200;
const PIXELS_PER_TICK = 100;
const PIXELS_PER_TICK_WIDE = 200;
export default {
    inject: ['openmct'],
    props: {
        viewBounds: {
            type: Object,
            required: true
        },
        isFixed: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {};
    },
    watch: {
        viewBounds: {
            handler() {
                this.setScale();
            },
            deep: true
        }
    },
    mounted() {
        let vis = d3Selection.select(this.$refs.axisHolder).append("svg:svg");
        this.xAxis = d3Axis.axisTop();
        this.dragging = false;
        // draw x axis with labels. CSS is used to position them.
        this.axisElement = vis.append("g")
            .attr("class", "axis")
            .attr('font-size', '1.3em')
            .attr("transform", "translate(0,20)");
        this.setViewFromTimeSystem(this.openmct.time.timeSystem());
        this.setAxisDimensions();
        this.setScale();
        //Respond to changes in conductor
        this.openmct.time.on("timeSystem", this.setViewFromTimeSystem);
        this.resizeInterval = setInterval(this.resize, RESIZE_POLL_INTERVAL);
    },
    beforeDestroy() {
        clearInterval(this.resizeInterval);
    },
    methods: {
        setAxisDimensions() {
            const axisHolder = this.$refs.axisHolder;
            const rect = axisHolder.getBoundingClientRect();
            this.left = Math.round(rect.left);
            this.width = axisHolder.clientWidth;
        },
        setScale() {
            if (!this.width) {
                return;
            }
            let timeSystem = this.openmct.time.timeSystem();
            if (timeSystem.isUTCBased) {
                this.xScale.domain(
                    [new Date(this.viewBounds.start), new Date(this.viewBounds.end)]
                );
            } else {
                this.xScale.domain(
                    [this.viewBounds.start, this.viewBounds.end]
                );
            }
            this.xAxis.scale(this.xScale);
            this.xScale.range([PADDING, this.width - PADDING * 2]);
            this.axisElement.call(this.xAxis);
            if (this.width > 1800) {
                this.xAxis.ticks(this.width / PIXELS_PER_TICK_WIDE);
            } else {
                this.xAxis.ticks(this.width / PIXELS_PER_TICK);
            }
            this.msPerPixel = (this.viewBounds.end - this.viewBounds.start) / this.width;
        },
        setViewFromTimeSystem(timeSystem) {
            //The D3 scale used depends on the type of time system as d3
            // supports UTC out of the box.
            if (timeSystem.isUTCBased) {
                this.xScale = d3Scale.scaleUtc();
            } else {
                this.xScale = d3Scale.scaleLinear();
            }
            this.xAxis.scale(this.xScale);
            this.xAxis.tickFormat(utcMultiTimeFormat);
            this.axisElement.call(this.xAxis);
            this.setScale();
        },
        getActiveFormatter() {
            let timeSystem = this.openmct.time.timeSystem();
            if (this.isFixed) {
                return this.getFormatter(timeSystem.timeFormat);
            } else {
                return this.getFormatter(timeSystem.durationFormat || DEFAULT_DURATION_FORMATTER);
            }
        },
        getFormatter(key) {
            return this.openmct.telemetry.getValueFormatter({
                format: key
            }).formatter;
        },
        scaleToBounds(value) {
            const bounds = this.openmct.time.bounds();
            const timeDelta = bounds.end - bounds.start;
            const valueDelta = value - this.left;
            const offset = valueDelta / this.width * timeDelta;
            return parseInt(bounds.start + offset, 10);
        },
        resize() {
            if (this.$refs.axisHolder.clientWidth !== this.width) {
                this.setAxisDimensions();
                this.setScale();
            }
        }
    }
};
</script>
