import ActivityViewProvider from './activityViewProvider';
import TimelineViewProvider from './timelineViewProvider';
import ChroniclesViewProvider from './chroniclesViewProvider';


export default function () {
    return function install(openmct) {
        openmct.types.addType(
            'apres.timeline.type',
            {
                name: 'Apres Timeline',
                cssClass: 'icon-timeline',
                creatable: true,
                initialize: function (domainObject) {
                    domainObject.composition = [];
                }
            }
        );
        openmct.types.addType(
            'apres.activity.type',
            {
                name: 'Apres Timeline Activity',
                cssClass: 'icon-activity',
                creatable: true,
                initialize: function (domainObject) {
                    domainObject.configuration = {
                        startTime: 0,
                        endTime: 10,
                        color: 'rebeccapurple'
                    };
                }//configuration= [`Action Types in Drill Model\n DrillAuger\n DrillUnStow\n DrillStow\n DrillCam_PwrOn\n DrillCam_PwrOff\n DrillCam_Operate`]
            }
        );
        openmct.types.addType(
            'apres.timeZone.type',
            {
                name: 'Apres Time Zone',
                cssClass: 'icon-clock',
                creatable: true
            }
        );
        openmct.types.addType(
            'apres.chronicle.type',
            {
                name: 'APRES State Chronicle',
                cssClass: 'icon-plot-overlay',
                creatable: true,
                initialize: function (domainObject) {
                    domainObject.configuration = {
                        startTime: 0,
                        endTime: 10,
                        state: [],
                    };
                },
                form: [
                    {
                        name: "Start Time",
                        control: "numberfield",
                        cssClass: "l-input-sm l-numeric",
                        key: "startTime",
                        required: true,
                        property: [
                            "configuration",
                            "startTime"
                        ]
                    },
                    {
                        name: "End Time",
                        control: "numberfield",
                        cssClass: "l-input-sm l-numeric",
                        key: "endTime",
                        required: true,
                        property: [
                            "configuration",
                            "endTime"
                        ]
                    },
                    {
                        name: "State Name",
                        control: "textfield",
                        cssClass: "l-input-sm l-text",
                        key: "stateName",
                        required: true,
                        property: [
                            "configuration",
                            "stateName"
                        ]
                    }
                ]
            }
        );

        openmct.objectViews.addProvider(new TimelineViewProvider(openmct));
        openmct.objectViews.addProvider(new ActivityViewProvider(openmct));
        openmct.objectViews.addProvider(new ChroniclesViewProvider(openmct));
    }
};
