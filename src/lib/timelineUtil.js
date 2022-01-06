import lodash from 'lodash';

const PSEUDO_ACTION = "Pseudo_Action";

const timelineUtil = {
    /** 
     * @param {TimelineDomainObject} timelineObject
     * @param {PlanningProject=} planningProject
     */
    getProjectJsonFromTimelineObject(timelineObject, planningProject) {
        if (!planningProject) {
            planningProject = {
                $schema: '../../../Schemas/PlanningProject.schema.json',
                projectInfo: timelineObject.configuration.projectInfo,
            };
        } else {
            planningProject = lodash.cloneDeep(planningProject);
        }

        planningProject.activityPlan = {
            actions: [],
            processes: [],
            planStart: timelineObject.configuration.startTime,
            planEnd: timelineObject.configuration.endTime
        };

        if (timelineObject.configuration.violations || timelineObject.configuration.chronicles) {
            const simulationInfo = {}
            
            if (timelineObject.configuration.violations) {
                simulationInfo.violations = timelineObject.configuration.violations;
            }

            if (timelineObject.configuration.chronicles) {
                const stateChronicles = [];
                const numericChronicles = [];

                for (const chronicle of timelineObject.configuration.chronicles) {
                    const episodes = [];

                    for (const episode of chronicle.episodes) {
                        const episodeObj = {
                            time: episode.time,
                            value: episode.value,
                        }

                        episodes.push(episodeObj);
                    }

                    const chronicleObject = {
                        variable: chronicle.name,
                        episodes: episodes,
                    };

                    if (chronicle.chronicleType === 'state') {
                        stateChronicles.push(chronicleObject);
                    } else if (chronicle.chronicleType === 'numeric') {
                        numericChronicles.push(chronicleObject);
                    }
                }
                
                if (stateChronicles.length > 0) {
                    simulationInfo.stateChronicles = stateChronicles;
                }

                if (numericChronicles.length > 0) {
                    simulationInfo.numericChronicles = numericChronicles;
                }
            }
            
            if(Object.getOwnPropertyNames(simulationInfo).length !== 0){
                planningProject.simulationInfo = simulationInfo;
            }
        }

        Object.entries(timelineObject.configuration.activities).forEach(([uuid, action]) => {
            const parameters = action.parameters ?? []

            // This moves parameter values from action objects into their parameter arrays.
            // TODO: Instead of this, the activity inspector should save values
            // directly into the parameters array instead of directly on action
            // domain objects.
            for (const paramType of action.actionTypeObject?.parameters ?? []) {
                // If there is no parameter value, skip
                if (!(paramType.name in action)) continue

                const param = {
                    name: paramType.name,
                    value: action[paramType.name],
                }

                const index = parameters.findIndex(p => p.name)

                if (index >= 0) parameters[index] = param
                else parameters.push(param)
            }

            /** @type {PlanningProjectActivity} */
            const actionObject = {
                uuid,
                // name: action.name,
                actionName: action.name || "",
                actionStart: new Date(action.startTime).toJSON(),
                actionEnd: new Date(action.endTime).toJSON(),
                actionType: action.type,
                parameters,
                note: action.note,
            }

            planningProject.activityPlan.actions.push(actionObject);
        });
        

        Object.entries(timelineObject.configuration.processes || []).forEach(([uuid, process]) => {
            const processObject = {
                uuid,
                processName: process.name,
                processStart: process.startTime,
                processEnd: process.endTime,
                processType: process.type,
            }

            planningProject.activityPlan.processes.push(processObject);
        });

        return planningProject;
    },
    /**
    @param {TODO} processJSON
    @param {TimelineModelConfig} config
    */
    getProcessConfig(processJSON, config) {
        let colorHex = config.colorHex || '#4f6ffe';
        let timelineLegend = config.timelineLegend || 'Default';
        const startTime = Date.parse(processJSON.processStart);
        const endTime = Date.parse(processJSON.processEnd);

        const configuration = {
            uuid: processJSON.uuid,
            name: processJSON.processName,
            note: processJSON.note,
            type: processJSON.processType,
            colorHex: colorHex,
            timelineLegend: timelineLegend,
            startTime: processJSON.processStart,
            parameters: processJSON.parameters,
            endTime: processJSON.processEnd,
            duration: endTime - startTime,
            objectStyles: {
                staticStyle: {
                    style: {
                        backgroundColor: colorHex,
                        border: `1px solid ${colorHex}`,
                        color: 'white'
                    }
                }
            }
        };

        return configuration;
    },
    /** @param {string=} duration */
    getDuration(duration) {
        if (duration && Number(duration)) {
            return Number(duration) * 1000;
        }

        return 3600000;
    },
    /**
    @param {PlanningProjectActivity} activityJSON
    @param {Partial<TimelineModelConfig>} config
    @param {ActivityType=} activityType
    @returns {ActivityConfig}
    */
    getActionConfig(activityJSON, config, activityType) {
        const colorHex = config.colorHex || '#4f6ffe';
        const timelineLegend = config.timelineLegend || 'Default';

        // This should be the plan start time, but the value here does not
        // matter because ApresObjectProvider.getAction sets the result
        // startTime to null to signal for timeline.vue to set a default value
        // of plan start.
        const defaultStart = 0

        let duration = 0 // milliseconds
        let startTime = ""
        let endTime = ""

        // If an activity is not being created, but is being processed from the
        // backend here, then start time and end time will already exist, in
        // which case the activity's duration is implicit from that.
        if (activityJSON.actionStart) {
            startTime = activityJSON.actionStart;
            endTime = activityJSON.actionEnd;
            duration = Date.parse(endTime) - Date.parse(startTime)
        }
        // Otherwise use default values.
        else {
            duration = this.getDuration(activityType?.duration)
            startTime = activityJSON.actionStart || new Date(defaultStart).toISOString();
            endTime = activityJSON.actionEnd || new Date(defaultStart + duration).toISOString();
        }


        /** @type {ActivityConfig} */
        const actionConfig = {
            uuid: activityJSON.uuid,
            name: activityJSON.actionName 
                // @ts-ignore Older workspaces have "name" instead of "actionName"
                ?? activityJSON.name,
            note: activityJSON.note,
            type: activityJSON.actionType,
            actionTypeObject: activityType,
            colorHex: colorHex,
            timelineLegend: timelineLegend,
            // startTime should be a date string, or null (see special case in ApresObjectProvider.getAction).
            startTime,
            parameters: activityJSON.parameters || [],
            endTime,
            duration,
            objectStyles: {
                staticStyle: {
                    style: {
                        backgroundColor: colorHex,
                        border: `1px solid ${colorHex}`,
                        color: 'white'
                    }
                }
            }
        };

        return actionConfig;
    },
    /**
    Returns an incomplete ActionConfig object.
    @param {Partial<PlanningProjectActivity>} activityJSON
    @param {Partial<TimelineModelConfig>} config
    @param {ActivityType=} activityType
    @returns {Partial<ActivityConfig>}
    */
    getPartialActionConfig(activityJSON, config, activityType) {
        /** @type {Partial<ActivityConfig>} */
        // @ts-ignore Small hack, type checker complains that the object is
        // incomplete (which is what we want).
        return this.getActionConfig(activityJSON, config, activityType)
    },
    /**
    @param {ActivityConfig} activityConfig
    @param {string=} location
    @param {Identifier=} identifier
    @returns {ActivityDomainObject}
    */
    // TODO Can indentifier.namespace be empty?
    getActivityDomainObject(activityConfig, location = "", identifier = {namespace: "", key: activityConfig.uuid}) {
        return {
            // name: actionConfig.actionName, // FIXED `actionName` is not an existing property on `TimelineAction`, but `name` is
            name: activityConfig.name,
            type: 'apres.action.type',
            identifier,
            cssClass: 'icon-activity',
            location,
            configuration: activityConfig
        };
    },
    getStateChroniclesConfig(chronicleJSON, config = {}, projectEndTime) {
        let timelineLegend = config.variable || 'Default';

        chronicleJSON.episodes.forEach((episode, index) => {
            const episodeStartTime = Date.parse(episode.time);

            const episodeConfig = config.stateColors?.filter((state) => {
                return state.stateVal === episode.value;
            });
            
            episode.colorHex = episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].colorHex : '#000000';
            episode.textColorHex = episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].textColorHex  : '#000000';

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
            chronicleType: "state",
            timelineLegend: timelineLegend,
            episodes: chronicleJSON.episodes,
        };

        return configuration;
    },
    getNumericChroniclesConfig(chronicleJSON, config = {}, projectEndTime) {
        let timelineLegend = config.variable || 'Default';
        let maxNumeric;
        let minNumeric;

        chronicleJSON.episodes.forEach((episode, index) => {
            const episodeStartTime = Date.parse(episode.time);

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
    
            if (index < chronicleJSON.episodes.length - 1) {
                const nextEpisodeStartTime = Date.parse(chronicleJSON.episodes[index + 1].time);

                episode.duration = nextEpisodeStartTime - episodeStartTime;
            } else {
                const endTime = Date.parse(projectEndTime);

                episode.duration = endTime - episodeStartTime;
            }
        });

        if (config.minBound) {
            minNumeric = parseFloat(config.minBound);
        }
        
        if (config.maxBound) {
            maxNumeric = parseFloat(config.maxBound);
        }

        const configuration = {
            name: chronicleJSON.variable,
            chronicleType: "numeric",
            timelineLegend: timelineLegend,
            episodes: chronicleJSON.episodes,
            endPoints: {
                min: minNumeric,
                max: maxNumeric,
            },
        };

        if (config.minLimit || config.maxLimit) {
            configuration.limits = {};

            if (config.minLimit) {
                configuration.limits.minLimit = parseFloat(config.minLimit);
            }

            if (config.maxLimit) {
                configuration.limits.maxLimit = parseFloat(config.minLimit);
            }
        }

        return configuration;
    },

    /** @param {PlanningProjectJson['configuration']} configuration */
    processConfiguration(configuration) {
        /** @type {Record<string, TimelineModelConfig>} */
        const configObject = {};

        configuration.modelConfig.forEach((model) => {
            configObject[model.actProcType] = model;
        });

        return configObject;
    },
    processStateChronicleConfiguration(configuration) {
        const configObject = {};

        configuration.stateChronicleConfig.forEach((state) => {
            configObject[state.varName] = state;
        });

        return configObject;
    },
    processNumericChronicleConfiguration(configuration) {
        const configObject = {};

        configuration.numericChronicleConfig.forEach((state) => {
            configObject[state.varName] = state;
        });

        return configObject;
    },

    /**
    @param {PlanningProjectJson} projectJSON
    @param {string} typeName
    @returns {ActivityType | undefined}
    */
    getActionTypeObject(projectJSON, typeName) {
        for (const type of projectJSON.interfaceModel.actionTypes) {
            if (typeName === type.name) return type
        }

        return undefined
    },

    /**
    @param {PlanningProjectJson} projectJSON
    @returns {TimelineDomainObject}
    */
    getTimelineDomainObject(projectJSON) {
        const timelineName = projectJSON.planningProject.projectInfo.projRef;
        const notes = projectJSON.planningProject.projectInfo.note;

        /** @type {TimelineConfig} */
        const domainObjectConfiguration = {
            startTime: projectJSON.planningProject.activityPlan.planStart,
            endTime: projectJSON.planningProject.activityPlan.planEnd,
            activities: {},
            processes: {},
            chronicles: [],

            // This line is wrong, or I have a new/older JSON schema file.
            violations: projectJSON.planningProject.simulationInfo?.violations,
            // In the schema I have, simulationInfo is inside of activityPlan.
            // violations: projectJSON.planningProject.activityPlan.simulationInfo?.violations,

            projectInfo: projectJSON.planningProject.projectInfo
        };

        const configuration = timelineUtil.processConfiguration(projectJSON.configuration);
        const stateChronicleConfiguration = timelineUtil.processStateChronicleConfiguration(projectJSON.configuration);
        const numericChronicleConfiguration = timelineUtil.processNumericChronicleConfiguration(projectJSON.configuration);

        const domainObject = {
            configuration: domainObjectConfiguration,
            identifier: {
                key: 'apres.timeline',
                namespace: ''
            },
            composition: [],
            location: 'mine',
            modified: Date.now(),
            created: Date.now(),
            name: timelineName,
            type: 'apres.timeline.type',
            notes
        };

        const actions = projectJSON.planningProject.activityPlan?.actions;

        if (!actions) throw new Error('Expected actions to exist.')

        actions.forEach(action => {
            // Dont add pseudo action to timeline.
            if (action.actionType === PSEUDO_ACTION) {
                return;
            }

            const actionType = timelineUtil.getActionTypeObject(projectJSON, action.actionType)
            if (!actionType) console.warn("TODO: All actions should have a type.");

            const actionConfig = timelineUtil.getActionConfig(action, configuration[action.actionType], actionType);
            domainObject.configuration.activities[action.uuid] = actionConfig;
        });

        const processes = projectJSON.planningProject.activityPlan.processes;

        if (processes) {
            processes.forEach((process) => {
                const processConfig = timelineUtil.getProcessConfig(process, configuration[process.processType]);
                domainObject.configuration.processes[processConfig.uuid] = processConfig;
            });
        }

        projectJSON.planningProject.simulationInfo?.stateChronicles?.forEach((chronicle) => {
            const projectEndTime = projectJSON.planningProject.activityPlan.planEnd;
            const chronicleConfig = timelineUtil.getStateChroniclesConfig(chronicle, stateChronicleConfiguration[chronicle.variable], projectEndTime);

            domainObject.configuration.chronicles.push(chronicleConfig);
        });

        projectJSON.planningProject.simulationInfo?.numericChronicles?.forEach((chronicle) => {
            const projectEndTime = projectJSON.planningProject.activityPlan.planEnd;
            const chronicleConfig = timelineUtil.getNumericChroniclesConfig(chronicle, numericChronicleConfiguration[chronicle.variable], projectEndTime);

            domainObject.configuration.chronicles.push(chronicleConfig);
        });

        return domainObject;
    }
}

export default timelineUtil;
