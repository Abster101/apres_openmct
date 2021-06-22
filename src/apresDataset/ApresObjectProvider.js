import { activityTypes } from '../../config/action_types';

export default class ApresObjectProvider {
    constructor(datasetCache) {
        this.datasetCache = datasetCache;

        this.getActionDefinitions = this.getActionDefinitions.bind(this);
        this.getActionTypesComposition = this.getActionTypesComposition.bind(this);
        this.getAction = this.getAction.bind(this);

        this.actionDefinitions = this.getActionDefinitions();
    }

    getActionDefinitions() {
        const definitions = {};

        activityTypes.modelConfig.forEach(action => {
            definitions[action.actProcType] = action;
        });

        return definitions;
    }

    getActionTypesComposition(identifier) {
        const composition = [];

        activityTypes.modelConfig.forEach(action => {
            composition.push(`apres:actions.type.${action.actProcType}.${identifier.key}`);
        });

        return composition;
    }

    getAction(identifier) {
        const keyArray = identifier.key.split('.');

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
            const proctype = keyArray[2];
            const modelObject = this.actionDefinitions[proctype];
            const location = `${identifier.namespace}:${keyArray.slice(3).join('.')}`;

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
                            duration: 3600,
                            type: "integer",
                            unit: 'seconds'
                        }
                    },
                    duration: 3600,
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
        const keyArray = identifier.key.split('.');

        if (keyArray[0] === 'actions') {
            return this.getAction(identifier);
        } else if (keyArray[0] === 'stateChronicles') {
            return this.getStateChronicle(identifier);
        }

        return Promise.reject();
    }
}