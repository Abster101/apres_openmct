<template>
    <div :style="activityStyle" ref="graph"></div>
</template>

<script>
import Plotly from 'plotly';

const ACTIVITY_HEIGHT = 40;

export default {
    inject: ['openmct'],
    props: {
        episodes: {
            type: Array,
            required: true,
            default() {
                return  {
                    configuration: []
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
        endPoints: {
            type: Object
        },
        limits: {
            type: Object
        },
        pixelMultiplier: {
            type: Number
        },
        formatter: {
            type: Object
        },
        projectEndTime:{
            type:String
        }
    },
    data() {
        return {
            data: [],
            startTime: null,
            endTime: null,
            duration: 0,
            plotLoaded: false,
        }
    },
    computed: {
        activityStyle() {
            return {
                'left': `${this.leftPosition}px`,
                'min-height': `${ACTIVITY_HEIGHT}px`,
                'max-height': `${ACTIVITY_HEIGHT}px`,
                'width': `${this.width}px`,
            };
        },
        leftPosition(){
            return Math.floor((this.startTime - this.startBounds) / this.pixelMultiplier);
        },
        width(){
            const width = Math.floor(this.duration / this.pixelMultiplier);

            if(this.plotLoaded){
                const plotConfig = {
                    width: width,
                    showlegend: false,
                };

                this.resizeGraph(plotConfig);
            }

            return width;
        },
    },
    mounted() {
        this.calculateStarTime();

        const yMin = this.endPoints.min;
        const yMax = this.endPoints.max;
        const xMin = new Date(this.startTime);
        const xMax = new Date(this.projectEndTime);
        const data = this.sortData(this.episodes);
        const limits = this.sortLimits(this.limits, this.episodes);

        this.duration = this.calculateTotalDuration(this.episodes);

        const graphWidth = this.calculateWidth(this.duration);

        var layout = {
            autosize: false,
            dragMode: false,
            showlegend: false,
            height: 40,
            width: graphWidth,
            paper_bgcolor: '#393939',
            plot_bgcolor: '#393939',
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
                pad: 0,
            },
            xaxis: {
                showgrid: false,
                tickmode: "linear",
                dtick: 30 * 24 * 60 * 60 * 1000,
                range: [xMin, xMax],
                fixedrange: true,
            },
            yaxis: {
                showgrid: false,
                range: [yMin, yMax],
                fixedrange: true,
            },
        };

        this.data = [data, ...limits];

        Plotly.newPlot(this.$refs.graph, this.data, layout, {displayModeBar: false});

        this.plotLoaded = true;
    },
    methods: {
        calculateStarTime: function(){
            for (const episode of this.episodes) {
                const parsedTime = this.formatter.parse(episode.time);

                if (!this.startTime) {
                    this.startTime = parsedTime;
                } else {
                    if(this.startTime > parsedTime){
                        this.startTime = parsedTime;
                    }
                }
            }
        },
        calculateTotalDuration: function(episodes){
            let duration = 0;

            for (const episode of this.episodes) {
                duration = duration + episode.duration;
            }

            return duration;
        },
        calculateWidth: function(duration){
            const width = Math.floor(duration / this.pixelMultiplier);

            return width;
        },
        resizeGraph: function(object){
            Plotly.relayout(this.$refs.graph, object);
        },
        sortData: function(episodes){
            const xMax = new Date(this.projectEndTime);
            const color = this.episodes[0].colorHex;
            const x = [];
            const y = [];

            for (const episode of episodes) {
                x.push(episode.time);
                y.push(episode.value);
            }

            x.push(xMax);
            y.push(y[y.length-1]);

            return {
                x: x,
                y: y,
                mode: 'lines',
                type: 'scatter',
                line: {
                    color: color,
                    width: 2,
                    shape: 'hv',
                },
            };
        },
        sortLimits: function(limits, episodes) {
            const xMax = new Date(this.projectEndTime);
            const color = 'B81306';
            const dataPoints = [];

            if(typeof limits.minLimit !== 'undefined'){
                const x = [];
                const y = [];

                if(episodes.length > 0){
                    x.push(episodes[0].time);
                    x.push(xMax);

                    y.push(limits.minLimit);
                    y.push(limits.minLimit);
                }

                const plotConfig = {
                    x: x,
                    y: y,
                    mode: 'lines',
                    type: 'scatter',
                    line: {
                        color: color,
                        width: 2,
                    },
                };

                dataPoints.push(plotConfig);
            }

            if(typeof limits.maxLimit !== 'undefined'){
                const x = [];
                const y = [];

                if(episodes.length > 0){
                    x.push(episodes[0].time);
                    x.push(xMax);

                    y.push(limits.maxLimit);
                    y.push(limits.maxLimit);
                }

                const plotConfig = {
                    x: x,
                    y: y,
                    mode: 'lines',
                    type: 'scatter',
                    marker: {
                        size: 4,
                    },
                    line: {
                        color: color,
                        width: 2,
                    },
                    showLegend: false,
                };

                dataPoints.push(plotConfig);
            }

            return dataPoints;
        },
    },
    watch: {
        episodes: function(newVal, oldVal) {
            if (newVal !== oldVal){
                this.duration = this.calculateTotalDuration(newVal);
            }
        },
    },
}
</script>
<style scoped>

</style>