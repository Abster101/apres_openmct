import ActivityInspectorViewProvider from './activityInspectorViewProvider';

/**
@param {GlobalModelAttribute[]} actionAttributes
@param {GlobalModelAttribute[]} processAttributes
@param {PlanningProjectJson} projectJSON
@returns {(mct: import('openmct')) => void}
*/
export default function (actionAttributes, processAttributes, projectJSON) {
    return function install (openmct) {

        const actionTypeDef = {
            cssClass: 'icon-activity',
            creatable: false
        }

        openmct.types.addType('apres.action.type', actionTypeDef);
        openmct.inspectorViews.addProvider(new ActivityInspectorViewProvider(openmct, actionAttributes, processAttributes, projectJSON));
    }
}
