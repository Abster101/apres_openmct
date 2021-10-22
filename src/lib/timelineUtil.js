const timelineUtil = {
    getActionConfig(actionJSON, config = {}) {
        let colorHex = config.colorHex || '#4f6ffe';
        let timelineLegend = config.timelineLegend || 'Default';
        const startTime = Date.parse(actionJSON.actionStart);
        const endTime = Date.parse(actionJSON.actionEnd);

        const configuration = {
            uuid: actionJSON.uuid,
            name: actionJSON.actionName,
            colorHex: colorHex,
            timelineLegend: timelineLegend,
            startTime: actionJSON.actionStart,
            parameters: actionJSON.parameters,
            endTime: actionJSON.actionEnd,
            duration: endTime - startTime,
            objectStyles: {
                staticStyle: {
                    style: {
                        backgroundColor: colorHex,
                        border: `1px solid ${colorHex}`,
                        color: '#aaaaaa'
                    }
                }
            }
        };

        return configuration;
    },
    getChroniclesConfig(chronicleJSON, config = {}, projectEndTime) {
        let timelineLegend = config.variable || 'Default';
        let maxNumeric;
        let minNumeric; 

        chronicleJSON.episodes.forEach((episode, index) => {
            const episodeStartTime = Date.parse(episode.time);
            const episodeConfig = config.stateColors?.filter((state) => {
                return state.stateVal === episode.value;
            });

            if (!isNaN(episode.value)) {
                const parsedValue = parseFloat(episode.value);

                episode.colorHex = config.colorHex ? config.colorHex : '#000000';
                episode.textColorHex =  config.colorHex ? config.colorHex : '#000000';
                
                if(!maxNumeric){
                    maxNumeric = parsedValue;
                } else {
                    if (maxNumeric < parsedValue) {
                        maxNumeric = parsedValue;
                    }
                }

                if (!minNumeric) {
                    minNumeric = parsedValue;
                } else {
                    if(minNumeric > parsedValue){
                        minNumeric = parsedValue;
                    }
                }
            } else {
                episode.colorHex = episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].colorHex : '#000000';
                episode.textColorHex = episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].textColorHex  : '#000000';
            }

            if (index < chronicleJSON.episodes.length - 1) {
                const nextEpisodeStartTime = Date.parse(chronicleJSON.episodes[index + 1].time);

                episode.duration = nextEpisodeStartTime - episodeStartTime;
            } else {
                const endTime = Date.parse(projectEndTime);

                episode.duration = endTime - episodeStartTime;
            }
        });

        const configuration = {
            name: chronicleJSON.variable,
            timelineLegend: timelineLegend,
            episodes: chronicleJSON.episodes,
        };

        if (maxNumeric && minNumeric) {
            if (config.resourceLimits?.minLimit) {
                minNumeric = parseFloat(config.resourceLimits.minLimit);
            }
            
            if (config.resourceLimits?.maxLimit) {
                maxNumeric = parseFloat(config.resourceLimits.maxLimit);
            }

            configuration.endPoints = {
                min: minNumeric,
                max: maxNumeric,
            }
        }

        return configuration;
    },
    processConfiguration(configuration) {
        const configObject = {};

        configuration.modelConfig.forEach((model) => {
            configObject[model.actProcType] = model;
        });

        return configObject;
    },
    processChronicleConfiguration(configuration) {
        const configObject = {};

        configuration.numericChronicleConfig.forEach((state) => {
            configObject[state.varName] = state;
        });

        configuration.stateChronicleConfig.forEach((state) => {
            configObject[state.varName] = state;
        });

        for (const prop in configObject) {
            const limits = configuration.resourceLimits.filter((limit) => {
                if (prop === limit.variable) {
                    return limit;
                }
            });

            if (limits.length > 0) {
                configObject[prop].resourceLimits = limits[0];
            }
        }

        return configObject;
    },
    getTimelineDomainObject(projectJSON) {
        const timelineName = projectJSON.interfaceModel.description;
        const domainObjectConfiguration = {
            startTime: projectJSON.planningProject.activityPlan.planStart,
            endTime: projectJSON.planningProject.activityPlan.planEnd,
            activities: {},
            chronicles: [],
            violations: projectJSON.planningProject.simulationInfo?.violations,
        };

        const configuration = timelineUtil.processConfiguration(projectJSON.configuration);
        const chronicleConfiguration = timelineUtil.processChronicleConfiguration(projectJSON.configuration);
        const domainObject = {
            configuration: domainObjectConfiguration,
            identifier: {
                key: 'test'
            },
            composition: [],
            location: 'mine',
            modified: Date.now(),
            created: Date.now(),
            name: timelineName,
            type: 'apres.timeline.type'
        };

        projectJSON.planningProject.activityPlan.actions.forEach((action) => {
            const actionConfig = timelineUtil.getActionConfig(action, configuration[action.actionType]);
            domainObject.configuration.activities[action.uuid] = actionConfig;
        });

        projectJSON.planningProject.simulationInfo?.chronicles?.forEach((chronicle) => {
            const projectEndTime = projectJSON.planningProject.activityPlan.planEnd;
            const chronicleConfig = timelineUtil.getChroniclesConfig(chronicle, chronicleConfiguration[chronicle.variable], projectEndTime);

            domainObject.configuration.chronicles.push(chronicleConfig);
        });

        return domainObject;
    }
}

export default timelineUtil;