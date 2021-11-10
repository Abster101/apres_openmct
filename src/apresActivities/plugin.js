import ActivityViewProvider from './activityViewProvider';
import ActivityInspectorViewProvider from './activityInspectorViewProvider';

/**
@param {Array<ActionAttribute>} actionAttributes
@param {PlanningProjectJson} projectJSON
@returns {(mct: import('openmct')) => void}
*/
export default function (actionAttributes, projectJSON) {
    return function install (openmct) {

        const actionTypeDef = {
            cssClass: 'icon-activity',
            creatable: false
        }

        openmct.types.addType('apres.action.type', actionTypeDef);
        openmct.objectViews.addProvider(new ActivityViewProvider(openmct));
        openmct.inspectorViews.addProvider(new ActivityInspectorViewProvider(openmct, actionAttributes, projectJSON));
    }
}
