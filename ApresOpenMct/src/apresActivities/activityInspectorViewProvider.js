import activityInspector from './components/activityInspector.vue'
import Vue from 'vue'
import timelineUtil from '../lib/timelineUtil'

export default class ActivityInspectorViewProvider {
    /** @type {TODO} */
    openmct

    /** @type {ModelAttribute[]} */
    actionAttributes

    /** @type {PlanningProjectJson} */
    #projectJSON

    /**
    @param {TODO} openmct
    @param {ModelAttribute[]} actionAttributes
    @param {PlanningProjectJson} projectJSON
    */
    constructor(openmct, actionAttributes, projectJSON) {
        this.openmct = openmct
        this.actionAttributes = actionAttributes
        this.#projectJSON = projectJSON

        this.key = 'apres.activity.inspector'
        this.name = 'Activity Inspector View'
    }

    /**
    @param {TODO} selection
    @returns {boolean}
    */
    canView(selection) {
        if (selection.length === 0 || selection[0].length === 0) {
            return false;
        }
        let parent = selection[0].length > 1 && selection[0][1].context.item;
        let object = selection[0][0].context.layoutItem;

        return parent
            && parent.type === 'apres.timeline.type'
            && object
            && object.type === 'apres.activity.type'
    }

    /**
    @param {TODO} selection
    @returns {TODO}
    */
    view(selection) {
        let component;

        return {
            show: element => {
                component = new Vue({
                    el: element,
                    components: {
                        activityInspector
                    },
                    data: () => {
                        return {
                            actionObject: this.#getActionObject(selection),
                            parentDomainObject: selection[0][1].context.item,
                            uniqueAttributes: this.#getUniqueAttributes(selection),
                            // TODO, for now we assume formulas are only for the
                            // duration of an action. Can formulas dictate other
                            // parameters too?
                            durationFormula: this.#getDurationFormula(selection),
                        }
                    },
                    provide: {
                        openmct: this.openmct,
                        actionAttributes: this.actionAttributes
                    },
                    template: /*html*/ `
                        <activity-inspector
                            :actionObject="actionObject"
                            :parentDomainObject="parentDomainObject"
                            :uniqueAttributes="uniqueAttributes"
                            :durationFormula="durationFormula"
                        />
                    `
                });
            },
            destroy() {
                component.$destroy()
            },
        }
    }

    priority() {
        return 1;
    }

    /**
    @param {TODO} selection
    @returns {ActivityConfig}
    */
    #getActionObject(selection) {
        return selection[0][0].context.layoutItem
    }

    /**
    Returns an array of the attribute types that are unique to the currently selected timeline action.
    @param {TODO} selection
    @returns {PlanningProjectActivity}
    */
    #getSelectedAction(selection) {
        // Get the selected action from the backend object.
        const {id: selectionActionId, activityType} = this.#getActionObject(selection)

        /** @type {TimelineDomainObject} */
        const timelineDomainObject = selection[0][1].context.item
        const planningProject = timelineUtil.getProjectJsonFromTimelineObject(timelineDomainObject)

        // FIXME The last three properties are possibly undefined as per the Schemas.
        // This is not ideal, especially since the assumption is that these
        // fields exist.

        /** @type {PlanningProjectActivity[] | undefined} */
        let actions
        if (activityType === 'process') actions = planningProject?.activityPlan?.processes
        else actions = planningProject?.activityPlan?.actions

        if (!actions) throw new Error('Actions are undefined. This should not happen.')

        const selectedAction = actions.find(action => action.uuid === selectionActionId)

        if (!selectedAction) throw new Error('Action not found. This should not happen.')

        return selectedAction
    }

    /**
    Returns an array of the attribute types that are unique to the currently selected timeline action.
    @param {TODO} selection
    @returns {ModelAttribute[]}
    */
    #getUniqueAttributes(selection) {
        const selectedAction = this.#getSelectedAction(selection)

        // Get the action's current param values.
        // F.e. [ { name: "NIRVSS_Dur", value: "12345" } ]
        // Are these the action's current values (persisted from database) or default values?
        const initialInputParams = selectedAction.parameters 

        // F.e. "NIRVSS_Operate" (which depends on the "NIRVSS_Dur" input).
        const actionTypeName = selectedAction.actionType

        // Find the custom parameters for the selected actionType.
        const actionType = timelineUtil.getActionTypeObject(this.#projectJSON, actionTypeName)

        /** @type {ModelAttribute[] | undefined} */
        const uniqueAttributes = actionType?.parameters?.map(param => ({
            name: param.name,
            units: param.units,

            // TODO Is this correct for the initial values to show in the UI?
            default:
                initialInputParams?.find(input => input.name === param.name)?.value ??
                param.defaultVal ??
                // TODO What is the default value if not found?
                '',

            // I assume always true because this is an input parameter for the user.
            editable: true,

            // I assume always true otherwise the formula cannot work without the input value.
            userRequired: true,

            modelType: {
                name: param.modelType.name,
                restictSet: param.modelType.restictSet,

                // FIXME Discrepancy in data models: the destination type (from
                // ModelAttributesSchema) expects a single range object, while
                // the source type (from InterfaceModelSchema) has an array of
                // range objects.
                //
                // For now, I just pull the first item from the source array.
                restrictRange: param.modelType.restrictRange?.[0],
            },
        }))

        return uniqueAttributes ?? []
    }

    /**
    Returns the string formula for the current action's duration.
    @param {TODO} selection
    @returns {string}
    */
    #getDurationFormula(selection) {
        const selectedAction = this.#getSelectedAction(selection)

        const actionType = timelineUtil.getActionTypeObject(this.#projectJSON, selectedAction.actionType)

        // An empty string means no formula.
        if (!actionType) return ""

        const formula = actionType.duration

        return formula
    }
}
