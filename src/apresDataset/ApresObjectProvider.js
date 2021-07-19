import { activityTypes } from '../../config/action_types';

export default class ApresObjectProvider {
    constructor(datasetCache) {
        this.datasetCache = datasetCache;

        this.getActionDefinitions = this.getActionDefinitions.bind(this);
        this.getActionTypesComposition = this.getActionTypesComposition.bind(this);
        this.getAction = this.getAction.bind(this);

        this.getStateChronicleDefinitions = this.getStateChronicleDefinitions.bind(this);
        this.getStateChronicleComposition = this.getStateChronicleComposition.bind(this);
        this.getStateChronicle = this.getStateChronicle.bind(this);

        this.actionDefinitions = this.getActionDefinitions();
        this.stateChronicleDefinitions = this.getStateChronicleDefinitions();
    }

    getActionDefinitions() {
        const definitions = {};

        activityTypes.modelConfig.forEach(action => {
            definitions[action.actProcType] = action;
        });

        return definitions;
    }

    getStateChronicleDefinitions(){
        const definitions = {};

        activityTypes.stateChronicleConfig.forEach(action => {
            definitions[action.stateColors.stateVal] = action;
        });

        return definitions;
    }
    getActionTypesComposition(identifier) {
        const composition = [];

        activityTypes.modelConfig.forEach(action => {
            composition.push(`apres:actionsType::${action.actProcType}::${identifier.key}`);
        });

        return composition;
    }
    getStateChronicleComposition(identifier) {
        const composition = [];

        activityTypes.stateChronicleConfig.forEach(action => {
            composition.push(`apres:actionsType::${action.stateColors.stateVal}::${identifier.key}`);
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
                type: `apres.activity.${proctype}`,
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
    getStateChronicle(){
        const keyArray = identifier.key.split('::');
        console.log(keyArray);
        if (keyArray[1] === 'source') {
            return Promise.resolve({
                identifier,
                name: 'StateChron',
                type: 'apres.stateChronicles.source',
                location: keyArray[2],
                configuration: {
                    actionTypes: this.stateChronicleDefinitions
                },
                composition: this.getStateChronicleComposition(identifier)
            });
        } else {
            const prototype = keyArray[1];
            const modelObject = this.stateChronicleDefinitions[prototype];
            const location = `${identifier.namespace}:${keyArray.slice(2).join('::')}`;

            return Promise.resolve({
                identifier,
                name: prototype,
                cssClass: 'icon-activity',
                type: `apres.stateChronicle.${prototype}`,
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
                                color: '#762020'
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
