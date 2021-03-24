import TimelineActivity from './timelineActivity.vue';
import activityListViewProvider from './activityListViewProvider.js';

<timeline-activity>
    v-for="(name,type, units) in activities"
   ?nec :name= "activityDomainObject.identifier.key" ,
   ?nec :type= {"activityDomainObject.identifier.key": "integer", "restrict"}
    :units= "activityDomainObject.length.key"

{"name": "DrillUnStow",
"duration": 1200},
{"name": "DrillStow",
"duration": 1200},
{"name": "DrillCam_PwrOn",
"duration": 30},
{"name": "DrillCam_PwrOff",
"duration": 30},
{"name": "DrillCam_Operate",
    "duration": 30},
</timeline-activity>
