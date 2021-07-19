
export default class ApresObjectProvider {
    constructor(dataset) {
        this.dataset = dataset;
    }
    get(identifier) {
        const activityProcType = identifier.key.split('-')[1];
        const modelObject = this.dataset.actionTypes[activityProcType];

        return Promise.resolve({
            identifier,
            name: activityProcType,
            cssClass: 'icon-activity',
            type: `apres.activity.${activityProcType}`,
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