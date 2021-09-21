
export default class ApresObjectProvider {
    constructor(actionTypes) {
        this.actionTypes = actionTypes;

        this.getActionDefinitions = this.getActionDefinitions.bind(this);
        this.getActionTypesComposition = this.getActionTypesComposition.bind(this);
        this.getAction = this.getAction.bind(this);

        this.actionDefinitions = this.getActionDefinitions();
    }

    getActionDefinitions() {
        const definitions = {};

        this.actionTypes.modelConfig.forEach(action => {
            definitions[action.actProcType] = action;
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
                            duration: 360000,
                            type: "integer",
                            unit: 'seconds'
                        }
                    },
                    duration: 360000,
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
    get(identifier) {
        const keyArray = identifier.key.split('::');

        if (keyArray[0] === 'actions' || keyArray[0] === 'actionsType') {
            return this.getAction(identifier);
        } else if (keyArray[0] === 'stateChronicles') {
            return this.getStateChronicle(identifier);
        }

        return Promise.reject();
    }
}