import TimelineViewProvider from './timelineViewProvider';
import viewActions from './viewActions';

export default function () {
    return function plugin (openmct) {
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

        openmct.objectViews.addProvider(new TimelineViewProvider(openmct));

        viewActions.forEach(action => {
            openmct.actions.register(action);
        });
    }
}
