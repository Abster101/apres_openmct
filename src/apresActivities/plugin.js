import ActivityViewProvider from './activityViewProvider';
import ActivityInspectorViewProvider from './activityInspectorViewProvider';

export default function (actionAttributes) {
    return function install (openmct) {

        const actionTypeDef = {
            cssClass: 'icon-activity',
            creatable: false
        }

        openmct.types.addType('apres.action.type', actionTypeDef);
        openmct.objectViews.addProvider(new ActivityViewProvider(openmct));
        openmct.inspectorViews.addProvider(ActivityInspectorViewProvider(openmct, actionAttributes));
    }
}
