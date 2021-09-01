<template>
  <li
      :title="domainObject.configuration.stateColors"
      class="timeline-activity"
  >
    <span class="w-full text-align-center align-self-center">{{domainObject.name}}</span>

  </li>
</template>
<script>
import TimelineActivity from './timelineActivity.vue';

const ACTIVITY_HEIGHT = 40;

export default {
  inject: ['openmct'],
  props: {
    domainObject: {
      type: Object,
      required: true,
      default () {
        return {
          configuration: {}
        }
      }
    },
    parentDomainObject: {
      type: Object,
      required: true,
      default () {
        return {
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
    pixelMultiplier: {
      type: Number
    },
    formatter: {
      type: Object
    },
    chronicleParameters:{
      type: Array
    },
    projectEndTime:{
      type: String
    }
  },
  data(){
    return {
      eposide: []
    }
  },
  methods:{
    getStateChronicle:function () {
      let promise = new Promise((resolve, reject) => {
        const arrayofSC = this.chronicleParameters;
        for (let i in arrayofSC) {
          if (arrayofSC[i].variable === this.domainObject.name) {
            this.eposide = arrayofSC[i].episodes;
            resolve(arrayofSC[i].episodes);
          }
        }
      })
       promise.then((results) => {
          this.getTimeSC(results)
        });

    },
    getTimeSC:function(results){
      console.log(this.configuration);

      const start = this.formatter.parse(this.configuration.startTime);

      if (this.startBounds > start){
        console.log(this.configuration);
      }
      if (this. endBounds > start){
        console.log("second value")
      }
    },
    leftPosition() {
      const start = this.formatter.parse(this.configuration.startTime);

      return Math.floor((start - this.startBounds) / this.pixelMultiplier);
    }
  },
  mounted () {
    this.getStateChronicle();
    //console.log(this.domainObject.configuration.startTime); //the current start time, but we want the current time, we don't have a way to simulate that yet
    //console.log(this.domainObject.configuration.stateColors[1].stateVal);  //the value at time- Auger
  },
  load(){

  }
}
</script>
<style scoped>

</style>
