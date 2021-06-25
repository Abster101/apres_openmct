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
                            timelineLegend: modelObject.varName,
                            stateVal: modelObject.stateColors[0].stateVal,
                            colorHex: modelObject.stateColors[0].colorHex,
                            textColorHex: modelObject.stateColors[0].textColorHex,
                            stateVal1: modelObject.stateColors[1].stateVal,
                            colorHex1: modelObject.stateColors[1].colorHex,
                            textColorHex1: modelObject.stateColors[1].textColorHex,
                            startTime: 0,
                            duration: 360000,
                            objectStyles: {
                                staticStyle: {
                                    style: {
                                        backgroundColor: modelObject.stateColors[0].colorHex,
                                        border: `1px solid ${modelObject.stateColors[0].colorHex}`,
                                        color: modelObject.stateColors[0].textColorHex,
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
