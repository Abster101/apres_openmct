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
                }
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
