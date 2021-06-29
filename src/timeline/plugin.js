import ChroniclesViewProvider from '../apresStateChronicle/chroniclesViewProvider';
import ActivityViewProvider from "../apresActivities/activityViewProvider";
import TimelineViewProvider from "./timelineViewProvider";
import viewActions from "./viewActions";

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
                    domainObject.configuration = {
                        activities: {}
                    };
                },
                form: [
                    {
                        name: "Start Time",
                        control: "textfield",
                        cssClass: "l-input-sm",
                        key: "startTime",
                        required: true,
                        property: [
                            "configuration",
                            "startTime"
                        ]
                    },
                    {
                        name: "EndTime",
                        control: "textfield",
                        cssClass: "l-input-sm l-numeric",
                        key: "endTime",
                        required: true,
                        property: [
                            "configuration",
                            "endTime"
                        ]
                    }
                ]
            }
        );


        viewActions.forEach(action => {
            openmct.actions.register(action);
        });
        openmct.objectViews.addProvider(new TimelineViewProvider(openmct));
        openmct.objectViews.addProvider(new ActivityViewProvider(openmct));
        openmct.objectViews.addProvider(new ChroniclesViewProvider(openmct));
    }
};
