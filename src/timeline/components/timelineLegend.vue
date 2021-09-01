<template>
<ul :style="legendStyle">

    <timeline-activity
        v-if="activityType"
        v-for="(activityDomainObject, index) in inBoundsActivities"
        :key="activityDomainObject.identifier.key"
        :domainObject="activityDomainObject"
        :parentDomainObject="parentDomainObject"
        :index="index"
        :isEditing="isEditing"
        :startBounds="startBounds"
        :endBounds="endBounds"
        :pixelMultiplier="pixelMultiplier"
        :formatter="formatter"
    />
  <TimelineStateChronicle
      v-else
      v-for="(activityDomainObject, index) in inBoundsActivities"
      :key="activityDomainObject.identifier.key"
      :domainObject="activityDomainObject"
      :parentDomainObject="parentDomainObject"
      :index="index"
      :isEditing="isEditing"
      :startBounds="startBounds"
      :endBounds="endBounds"
      :pixelMultiplier="pixelMultiplier"
      :formatter="formatter"
      :chronicleParameters="chronicleParameters"
      :projectEndTime = "projectEndTime"
  ></TimelineStateChronicle>
</ul>
</template>

<script>
import TimelineActivity from './timelineActivity.vue';
import TimelineStateChronicle from "./timelineStateChronicle.vue";

const ACTIVITY_HEIGHT = 44;

export default {
    inject: ['openmct'],
    components: {
        TimelineActivity,
        TimelineStateChronicle
    },
    props: {
        activities: {
            type: Array,
            required: true,
            default() {
                return [];
            }
        },
        parentDomainObject: {
            type: Object,
            required: true,
            default() {
                return {}
            }
        },
        title: {
            type: String
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
      chronicleParameters: {
        type: Array
      },
      projectEndTime:{
          type: String
      }
    },
    data() {
      return {
         activityType: false,
      }
    },
    methods:{
      getComparison:function (){
        let type = this.activities[0].type;
        let type_array = type.split(".");
        if (type_array[1] == "activity")
        {
          this.activityType = true;
        }else{
          this.activityType = false;
        }
        },
      getStateChronicle:function (){
      //  let value1 = this.domainObject.configuration.stateColors[1].stateVal;
      }
    },
    mounted() {
      //console.log(this.activities[0].type);
      this.getComparison();
      this.getStateChronicle();
      },
    computed: {
        legendStyle() {
            return {
                'position': 'relative',
                'max-height': `${ACTIVITY_HEIGHT * this.activities.length}px`,
                'min-height': `${ACTIVITY_HEIGHT * this.activities.length}px`,
                'border-top': '2px solid #6c6c6c',
                'border-bottom': '2px solid #6c6c6c',
                'margin-top': '10px',
                'margin-bottom': '10px'
            }
        },
        titleStyle() {
            return {
                'max-height': `${(ACTIVITY_HEIGHT * this.activities.length) - 4}px`,
                'min-height': `${(ACTIVITY_HEIGHT * this.activities.length) - 4}px`,
                'width': '120px',
                'background': '#6c6c6c',
                'display': 'flex',
                'justify-content': 'center',
                'align-content': 'center',
                'flex-direction': 'column',
                'text-align': 'center',
                'color': '#dddddd'
            }
        },
        inBoundsActivities() {
            return this.activities.filter(activity => {
                return (
                    this.formatter.parse(activity.configuration.startTime) <= this.endBounds
                );
            })
        }
    }
}
</script>
