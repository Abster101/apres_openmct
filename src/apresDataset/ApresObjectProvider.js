
export default class ApresObjectProvider {
    constructor(actionTypes) {
        this.actionTypes = actionTypes;

        this.getActionDefinitions = this.getActionDefinitions.bind(this);
        this.getActionTypesComposition = this.getActionTypesComposition.bind(this);
        this.getAction = this.getAction.bind(this);

        this.getStateChronicleDefinitions = this.getStateChronicleDefinitions.bind(this);
        this.getStateChronicleTypesComposition = this.getStateChronicleTypesComposition.bind(this);
        this.getStateChronicle = this.getStateChronicle.bind(this);

        this.actionDefinitions = this.getActionDefinitions();
        this.stateChronicleDefinitions = this.getStateChronicleDefinitions();
    }

    getActionDefinitions() {
        const definitions = {};

        this.actionTypes.modelConfig.forEach(action => {
            definitions[action.actProcType] = action;
        });

        return definitions;
    }

    getStateChronicleDefinitions(){
        const definitions = {};

        activityTypes.stateChronicleConfig.forEach(stateChronicle => {
            definitions[stateChronicle.varName] = stateChronicle;
        });

        return definitions;
    }

    getActionTypesComposition(identifier) {
        const composition = [];

        this.actionTypes.modelConfig.forEach(action => {
            composition.push(`apres:actionsType::${action.actProcType}::${identifier.key}`);
        });

        return composition;
    }
    getStateChronicleTypesComposition(identifier) {
        const composition = [];

        activityTypes.stateChronicleConfig.forEach(stateChronicle => {
            composition.push(`apres:stateChroniclesType::${stateChronicle.varName}::${identifier.key}`);
        });

        return composition;
    }
    getAction(identifier) {
        const keyArray = identifier.key.split('::');

        if (keyArray[1] === 'source') {
            return Promise.resolve({
                identifier,
                name: 'Actions',
                type: 'apres.action.source',
                location: keyArray[2],
                configuration: {
                    actionTypes: this.actionDefinitions
                },
                composition: this.getActionTypesComposition(identifier)
            });
        } else {
            const proctype = keyArray[1];
            const modelObject = this.actionDefinitions[proctype];
            const location = `${identifier.namespace}:${keyArray.slice(2).join('::')}`;

            return Promise.resolve({
                identifier,
                name: proctype,
                cssClass: 'icon-activity',
                type: 'apres.action.type',
                location: location,
                configuration: {
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
            });
        }
    }
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

            return Promise.resolve({
                identifier,
                name: varName,
                cssClass: 'icon-activity',
                type: `apres.stateChronicle.${varName}`,
                location: location,
                configuration: {
                    stateColors: modelObject.stateColors,
                    stateVal: "idle",
                    colorHex: modelObject.colorHex,
                    timelineLegend: modelObject.varName,
                    startTime: 0,
                    duration: 360000,
                }
            });
        }
    }
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
