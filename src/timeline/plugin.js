import TimelineViewProvider from './timelineViewProvider';
import viewActions from './viewActions';

export default function () {
    return function plugin (openmct) {
        openmct.types.addType(
            'apres.timeline.type',
            {
                name: 'Timeline',
                cssClass: 'icon-timeline',
                creatable: true,
                initialize: function (domainObject) {
                    domainObject.composition = [];
                }
            }
        );

        openmct.objectViews.addProvider(new TimelineViewProvider(openmct));

        viewActions.forEach(action => {
            openmct.actions.register(action);
        });
    }
}
