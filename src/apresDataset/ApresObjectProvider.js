
export default class ApresObjectProvider {
    /** @type {PlanninProjectConfiguration} */
    planningProjectConfig

    /** @param {PlanninProjectConfiguration} planningProjectConfig */
    constructor(planningProjectConfig) {
        this.planningProjectConfig = planningProjectConfig;

        this.getActionDefinitions = this.getActionDefinitions.bind(this);
        this.getActionTypesComposition = this.getActionTypesComposition.bind(this);
        this.getAction = this.getAction.bind(this);

        this.getStateChronicleDefinitions = this.getStateChronicleDefinitions.bind(this);
        this.getStateChronicleTypesComposition = this.getStateChronicleTypesComposition.bind(this);
        this.getStateChronicle = this.getStateChronicle.bind(this);

        this.actionDefinitions = this.getActionDefinitions();
        this.stateChronicleDefinitions = this.getStateChronicleDefinitions();
    }

    /** @returns {Record<string, TimelineModelConfig>} */
    getActionDefinitions() {
        /** @type {Record<string, TimelineModelConfig>} */
        const definitions = {};

        this.planningProjectConfig.modelConfig.forEach(action => {
            definitions[action.actProcType] = action;
        });

        return definitions;
    }

    /** @returns {Record<string, TimelineStateChronicleConfig>} */
    getStateChronicleDefinitions(){
        /** @type {Record<string, TimelineStateChronicleConfig>} */
        const definitions = {};

        this.planningProjectConfig.stateChronicleConfig.forEach(stateChronicle => {
            definitions[stateChronicle.varName] = stateChronicle;
        });

        return definitions;
    }

    /** @returns {string[]} */
    getActionTypesComposition(identifier) {
        /** @type {string[]} */
        const composition = [];

        this.planningProjectConfig.modelConfig.forEach(action => {
            composition.push(`apres:actionsType::${action.actProcType}::${identifier.key}`);
        });

        return composition;
    }

    /** @returns {string[]} */
    getStateChronicleTypesComposition(identifier) {
        /** @type {string[]} */
        const composition = [];

        // FIXME The activityTypes property is not defined in this class, and this class doesn't not inherit from any class.
        this.activityTypes.stateChronicleConfig.forEach(stateChronicle => {
            composition.push(`apres:stateChroniclesType::${stateChronicle.varName}::${identifier.key}`);
        });

        return composition;
    }

    /** @param {Identifier} identifier */
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
            const modelObject = this.actionDefinitions[proctype];
            const location = `${identifier.namespace}:${keyArray.slice(2).join('::')}`;

            const actionObject = {
                identifier,
                name: proctype,
                cssClass: 'icon-activity',
                type: 'apres.action.type',
                location: location,
                configuration: {
                    name: proctype,
                    type: proctype,
                    colorHex: modelObject.colorHex,
                    timelineLegend: modelObject.timelineLegend,
                    startTime: 0,
                    parameters: {
                        drillDur: {
                            duration: 3600000,
                            type: "integer",
                            unit: 'seconds'
                        }
                    },
                    duration: 3600000,
                    objectStyles: {
                        staticStyle: {
                            style: {
                                backgroundColor: modelObject.colorHex,
                                border: `1px solid ${modelObject.colorHex}`,
                                color: '#aaaaaa'
                            }
                        }
                    }
                }
            }

            return Promise.resolve(actionObject);
        }
    }

    /** @param {Identifier} identifier */
    getStateChronicle(identifier){
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

            if (modelObject.colorHex) debugger

            return Promise.resolve({
                identifier,
                name: varName,
                cssClass: 'icon-activity',
                type: `apres.stateChronicle.${varName}`,
                location: location,
                configuration: {
                    stateColors: modelObject.stateColors,
                    stateVal: "idle",
                    colorHex: modelObject.colorHex, // FIXME The colorHex property does not exist on modelObject objects, so this is always undefined.
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

        if (keyArray[0] === 'actions' || keyArray[0] === 'actionsType') {
            return this.getAction(identifier);
        } else if (keyArray[0] === 'stateChronicles' || keyArray[0] === 'stateChroniclesType') {
            return this.getStateChronicle(identifier);
        }

        return Promise.reject();
    }
}
