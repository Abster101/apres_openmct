import timelineUtil from "../lib/timelineUtil";

export default class ApresObjectProvider {
    /** @type {PlanningProjectJson} */
    planningProject;

    /** @type {Record<string, ActivityType>} */
    interfaceModelActionTypes

    /** @param {PlanningProjectJson} planningProject */
    constructor(planningProject) {
        this.planningProject = planningProject;
        this.actionDefinitions = this.getActionDefinitions();
        this.stateChronicleDefinitions = this.getStateChronicleDefinitions();
        this.interfaceModelActionTypes = this.getInterfaceModelActionTypes();
    }

    /** 
    @private
    @returns {Record<string, TimelineModelConfig>}
    */
    getActionDefinitions() {
        /** @type {Record<string, TimelineModelConfig>} */
        const definitions = {};

        this.planningProject.configuration.modelConfig.forEach(action => {
            definitions[action.actProcType] = action;
        });

        return definitions;
    }

    /**
    @private
    @returns {Record<string, TimelineStateChronicleConfig>}
    */
    getStateChronicleDefinitions() {
        /** @type {Record<string, TimelineStateChronicleConfig>} */
        const definitions = {};

        this.planningProject.configuration.stateChronicleConfig.forEach(stateChronicle => {
            definitions[stateChronicle.varName] = stateChronicle;
        });

        return definitions;
    }

    /** @returns {Record<string, ActivityType>} */
    getInterfaceModelActionTypes() {
    /** @type {Record<string, ActivityType>} */
        const interfaceModelActionTypes = {};

        this.planningProject.interfaceModel.actionTypes.forEach((actionType) => {
            interfaceModelActionTypes[actionType.name] = actionType;
        });

        return interfaceModelActionTypes;
    }

    /** 
    @private
    @returns {string[]}
    */
    getActionTypesComposition(identifier) {
        /** @type {string[]} */
        const composition = [];

        this.planningProject.configuration.modelConfig.forEach(action => {
            if (!action.actProcType.toLowerCase().includes('operate')) {
                composition.push(`apres:actionsType::${action.actProcType}::${identifier.key}`);
            }
        });

        return composition;
    }

    /**
    @private
    @returns {string[]}
    */
    getStateChronicleTypesComposition(identifier) {
        /** @type {string[]} */
        const composition = [];

        // FIXME The activityTypes property is not defined in this class, and this class does not inherit from any class.
        this.activityTypes.stateChronicleConfig.forEach(stateChronicle => {
            composition.push(`apres:stateChroniclesType::${stateChronicle.varName}::${identifier.key}`);
        });

        return composition;
    }

    /** 
    @private
    @param {Identifier} identifier
    */
    // TODO does this get called for processes too?
    getAction(identifier) {
        const keyArray = identifier.key.split('::');

        if (keyArray[1] === 'source') {
            return Promise.resolve({
                identifier,
                name: 'Actions',
                type: 'apres.action.source',
                location: keyArray[2],
                configuration: {
                    // TODO rename stuff, there is confusion because "actionTypes" in the code base is not "actionTypes" in the data models, but something else.
                    actionTypes: this.actionDefinitions
                },
                composition: this.getActionTypesComposition(identifier)
            });
        } else {
            const proctype = keyArray[1];
            const timelineModelConfig = this.actionDefinitions[proctype];
            const location = `${identifier.namespace}:${keyArray.slice(2).join('::')}`;

            // TODO choose one
            // const actionType = timelineUtil.getActionTypeObject(this.planningProject, proctype)
            const actionType = this.interfaceModelActionTypes[proctype];

            const actionConfig = timelineUtil.getPartialActionConfig({
                actionName: proctype,
                actionType: proctype,
            }, timelineModelConfig, actionType);

            // NOTE! Setting startTime to null signals for the value to default to the
            // timeline's startTime in timeline.vue after being added.
            actionConfig.startTime = null

            // FIXME There is a type error here because UUID and other fields
            // may not be defined.  This domain object will be incomplete when
            // received on the other side. We need to complete this missing type
            // wiring to ensure things flow properly.
            const actionDomainObject = timelineUtil.getActivityDomainObject(actionConfig, location, identifier);

            return Promise.resolve(actionDomainObject)
        }
    }

    /**
    @private
    @param {Identifier} identifier
    */
    getStateChronicle(identifier) {
        const keyArray = identifier.key.split('::');

        if (keyArray[1] === 'source') {
            return Promise.resolve({
                identifier,
                name: 'State Chronicles',
                type: 'apres.stateChronicle.source',
                location: keyArray[2],
                configuration: {
                    actionTypes: this.stateChronicleDefinitions
                },
                composition: this.getStateChronicleTypesComposition(identifier)
            });
        } else {
            const varName = keyArray[1];
            const modelObject = this.stateChronicleDefinitions[varName];
            const location = `${identifier.namespace}:${keyArray.slice(2).join('::')}`;

            // FIXME
            if (typeof modelObject.colorHex === 'undefined') console.warn('FIXME: moduleObject.colorHex property does not exist.')

            return Promise.resolve({
                identifier,
                name: varName,
                cssClass: 'icon-activity',
                type: `apres.stateChronicle.${varName}`,
                location: location,
                configuration: {
                    stateColors: modelObject.stateColors,
                    stateVal: "idle",
                    // FIXME The colorHex property does not exist on TimelineStateChronicleConfig objects, so this is always undefined.
                    colorHex: modelObject.colorHex,
                    timelineLegend: modelObject.varName,
                    startTime: 0,
                    duration: 360000,
                }
            });
        }
    }

    /** @param {Identifier} identifier */
    get(identifier) {
        const keyArray = identifier.key.split('::');

        // TODO what about processes?
        if (keyArray[0] === 'actions' || keyArray[0] === 'actionsType') {
            return this.getAction(identifier);
        } else if (keyArray[0] === 'stateChronicles' || keyArray[0] === 'stateChroniclesType') {
            return this.getStateChronicle(identifier);
        }

        // return Promise.reject(); // FIXED Never throw exceptions without messages.
        return Promise.reject(new Error("Expected only actions or chronicles."));
    }
}
