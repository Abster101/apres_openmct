import chroniclesViewProvider from "./chroniclesViewProvider";

export default function (activityTypes) {
    return function install (openmct) {
        let models = activityTypes.stateChronicleConfig;
        if (models && Array.isArray(models)) {
            models.forEach(modelObject => {


                let typeDef = {
                    name: modelObject.varName,
                    cssClass: 'icon-plot-overlay',
                    creatable: true,
                    initialize: function (domainObject) {
                        domainObject.configuration = {
                            stateVal: modelObject.stateVal,
                            colorHex: modelObject.colorHex,
                            textColorHex: modelObject.textColorHex,
                            startTime: 0,
                            parameters: {
                                drillDur: {
                                    duration: 3600,
                                    type: "integer",
                                    unit: 'seconds'
                                },
                            },
                            duration: 3600,
                            objectStyles: {
                                staticStyle: {
                                    style: {
                                        backgroundColor: modelObject.colorHex,
                                        border: `1px solid ${modelObject.colorHex}`,
                                        color: modelObject.textColorHex,
                                    }
                                }
                            }
                        };
                    },
                };
                let activityKey = `apres.activity.${typeDef.name}`;

                openmct.types.addType(activityKey, typeDef);
            });
        }

        openmct.objectViews.addProvider(new chroniclesViewProvider(openmct));
    }
}
