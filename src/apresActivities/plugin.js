import ActivityViewProvider from './ActivityViewProvider';
import ActivityInspectorViewProvider from './ActivityInspectorViewProvider';

export default function (actionAttributes) {
    return function install (openmct) {

        const actionTypeDef = {
            cssClass: 'icon-activity',
            creatable: false
        }

        openmct.types.addType('apres.action.type', actionTypeDef);
        openmct.objectViews.addProvider(new ActivityViewProvider(openmct));
        openmct.inspectorViews.addProvider(new ActivityInspectorViewProvider(openmct, actionAttributes));
    }
}
