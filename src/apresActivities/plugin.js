import ActivityViewProvider from './activityViewProvider';
import ActivityInspectorViewProvider from './activityInspectorViewProvider';

export default function (activityTypes) {
    return function install (openmct) {
        let models = activityTypes.modelConfig;

        if (models && Array.isArray(models)) {
            models.forEach(modelObject => {

                let typeDef = {
                    name: modelObject.actProcType,
                    cssClass: 'icon-activity',
                    creatable: true,
                    initialize: function (domainObject) {
                        let configuration = {
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
                            duration: 3600
                        }

                        domainObject.configuration = configuration;
                    },
                    form: [
                        {
                            name: "Start Time",
                            control: "numberfield",
                            cssClass: "l-input-sm l-numeric",
                            key: "startTime",
                            required: true,
                            property: [
                                "configuration",
                                "startTime"
                            ]
                        },
                        {
                            name: "Duration",
                            control: "numberfield",
                            cssClass: "l-input-sm l-numeric",
                            key: "duration",
                            required: true,
                            property: [
                                "configuration",
                                "duration"
                            ]
                        }
                    ]
                };
                let activityKey = `apres.activity.${typeDef.name}`;

                openmct.types.addType(activityKey, typeDef);
            });
        }

        openmct.objectViews.addProvider(new ActivityViewProvider(openmct));
        openmct.inspectorViews.addProvider(ActivityInspectorViewProvider(openmct));
    }
}
