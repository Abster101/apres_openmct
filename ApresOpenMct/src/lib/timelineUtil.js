import cloneDeep from 'lodash/cloneDeep';

const PSEUDO_ACTION = "Pseudo_Action";

const timelineUtil = {
    /** 
     * @param {TimelineDomainObject} timelineObject
     * @param {PlanningProject=} planningProject
     */
    getProjectJsonFromTimelineObject(timelineObject, planningProject) {
        /** @type {PlanningProject} */
        let _planningProject

        const activityPlan = {
            actions: [],
            processes: [],
            planStart: timelineObject.configuration.startTime,
            planEnd: timelineObject.configuration.endTime
        };

        if (!planningProject) {
            _planningProject = {
                $schema: '../../../Schemas/PlanningProject.schema.json',
                projectInfo: timelineObject.configuration.projectInfo,
                activityPlan,
            };
        } else {
            _planningProject = cloneDeep(planningProject);
            _planningProject.activityPlan = activityPlan
        }

        if (timelineObject.configuration.violations || timelineObject.configuration.chronicles) {
            /** @type {SimulationInfo} */
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
                _planningProject.simulationInfo = simulationInfo;
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

            if (!action.startTime) throw new Error('Expected activity.startTime during serialization.')

            /** @type {PlanningProjectAction} */
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

            _planningProject.activityPlan.actions.push(actionObject);
        });
        

        Object.entries(timelineObject.configuration.processes || []).forEach(([uuid, process]) => {
            if (!process.startTime) throw new Error('Expected activity.startTime during serialization.')

            /** @type {PlanningProjectProcess} */
            const processObject = {
                uuid,
                processName: process.name || "",
                processStart: process.startTime,
                processEnd: process.endTime,
                processType: process.type,
            }

            _planningProject.activityPlan.processes.push(processObject);
        });

        return _planningProject;
    },
    /**
    @param {TODO} processJSON
    @param {TimelineModelConfig} config
    @returns {ActivityConfig}
    */
    getProcessConfig(processJSON, config) {
        let colorHex = config.colorHex || '#4f6ffe';
        let timelineLegend = config.timelineLegend || 'Default';
        const startTime = Date.parse(processJSON.processStart);
        const endTime = Date.parse(processJSON.processEnd);

        /** @type {ActivityConfig} */
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
    /** 
    Given a possible default duration value in seconds from an activityType's
    JSON, returns the milliseconds. If the value doesn't exist or is not a
    number, returns a default value of 1 hour in milleseconds.

    @param {string | number =} duration 
    */
    getDuration(duration) {
        if (duration != null && Number(duration)) {
            return Number(duration) * 1000;
        }

        return 3600000;
    },
    /**
    @param {PlanningProjectAction} activityJSON
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
            // activityType.duration might be a formula and not a number
            // value, in which case the next getDuration call will return a
            // hard-coded default duration value that will be used until the
            // user inputs parameter values for the formula.
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
    @param {Partial<PlanningProjectAction>} activityJSON
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
    /**
    @param {Chronicle} chronicleJSON
    @param {Partial<TimelineStateChronicleConfig>} config
    @param {string} projectEndTime
    @returns {TimelineStateChronicle}
    */
    getStateChroniclesConfig(chronicleJSON, config = {}, projectEndTime) {
        let timelineLegend = config.variable || 'Default';
        if (typeof config.variable === 'undefined') console.warn('FIXME: config.variable property does not exist')

        // Map instead of forEach to avoid modifying the original data
        // (otherwise it can cause false expectations in other code that also
        // receives the JSON payload)
        const episodes = chronicleJSON.episodes.map((episode, index) => {
            const episodeStartTime = Date.parse(episode.time);

            const episodeConfig = config.stateColors?.filter((state) => {
                return state.stateVal === episode.value;
            });

            /** @type {TimelineChronicleEpisode} */
            const timelineEpisode = {
                ...episode,
                colorHex: episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].colorHex : '#000000',
                textColorHex: episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].textColorHex  : '#000000',
                duration: 0,
            }

            if (index < chronicleJSON.episodes.length - 1) {
                const nextEpisodeStartTime = Date.parse(chronicleJSON.episodes[index + 1].time);
    
                timelineEpisode.duration = nextEpisodeStartTime - episodeStartTime;
            } else {
                const endTime = Date.parse(projectEndTime);
    
                timelineEpisode.duration = endTime - episodeStartTime;
            }

            return timelineEpisode
        });

        /** @type {TimelineStateChronicle} */
        const configuration = {
            name: chronicleJSON.variable,
            chronicleType: "state",
            timelineLegend,
            episodes,
        };

        return configuration;
    },
    /**
    @param {Chronicle} chronicleJSON
    @param {Partial<TimelineNumericChronicleConfig>} config
    @param {string} projectEndTime
    @returns {TimelineNumericChronicle}
    */
    getNumericChroniclesConfig(chronicleJSON, config = {}, projectEndTime) {
        let timelineLegend = config.variable || 'Default';
        if (typeof config.variable === 'undefined') console.warn('FIXME: config.variable property does not exist')

        /** @type {number | null} */
        let maxNumeric = null;
        /** @type {number | null} */
        let minNumeric = null;

        // Map instead of forEach to avoid modifying the original data
        // (otherwise it can cause false expectations in other code that also
        // receives the JSON payload)
        const episodes = chronicleJSON.episodes.map((episode, index) => {
            const episodeStartTime = Date.parse(episode.time);

            const parsedValue = parseFloat(episode.value);

            /** @type {TimelineChronicleEpisode} */
            const timelineEpisode = {
                ...episode,
                colorHex: config.colorHex ? config.colorHex : '#000000',
                textColorHex:  config.colorHex ? config.colorHex : '#000000',
                duration: 0,
            }
            
            if(maxNumeric === null){
                maxNumeric = parsedValue;
            } else {
                if (maxNumeric < parsedValue) {
                    maxNumeric = parsedValue;
                }
            }

            if (minNumeric === null) {
                minNumeric = parsedValue;
            } else {
                if(minNumeric > parsedValue){
                    minNumeric = parsedValue;
                }
            }
    
            if (index < chronicleJSON.episodes.length - 1) {
                const nextEpisodeStartTime = Date.parse(chronicleJSON.episodes[index + 1].time);

                timelineEpisode.duration = nextEpisodeStartTime - episodeStartTime;
            } else {
                const endTime = Date.parse(projectEndTime);

                timelineEpisode.duration = endTime - episodeStartTime;
            }

            return timelineEpisode
        });

        if (config.minBound) {
            minNumeric = parseFloat(config.minBound);
        }
        
        if (config.maxBound) {
            maxNumeric = parseFloat(config.maxBound);
        }

        if (minNumeric === null || maxNumeric === null)
            throw new Error('Expected min/max numeric values.')

        /** @type {TimelineNumericChronicle} */
        const configuration = {
            name: chronicleJSON.variable,
            chronicleType: "numeric",
            timelineLegend,
            episodes,
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
                configuration.limits.maxLimit = parseFloat(config.maxLimit);
            }
        }

        return configuration;
    },

    /** @param {PlanninProjectConfiguration} configuration */
    processConfiguration(configuration) {
        /** @type {Record<string, TimelineModelConfig>} */
        const configObject = {};

        configuration.modelConfig.forEach((model) => {
            configObject[model.actProcType] = model;
        });

        return configObject;
    },
    /** @param {PlanninProjectConfiguration} configuration */
    processStateChronicleConfiguration(configuration) {
        /** @type {Record<string, TimelineStateChronicleConfig>} */
        const configObject = {};

        configuration.stateChronicleConfig.forEach((state) => {
            configObject[state.varName] = state;
        });

        return configObject;
    },
    /** @param {PlanninProjectConfiguration} configuration */
    processNumericChronicleConfiguration(configuration) {
        /** @type {Record<string, TimelineNumericChronicleConfig>} */
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
        // for (const type of projectJSON.interfaceModel.actionTypes) {
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
            violations: projectJSON.planningProject.simulationInfo?.violations || [],
            projectInfo: projectJSON.planningProject.projectInfo
        };

        const configuration = timelineUtil.processConfiguration(projectJSON.configuration);
        const stateChronicleConfiguration = timelineUtil.processStateChronicleConfiguration(projectJSON.configuration);
        const numericChronicleConfiguration = timelineUtil.processNumericChronicleConfiguration(projectJSON.configuration);

        /** @type {TimelineDomainObject} */
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
                /**
                 *  Note: Process UUID's are not unique per instance, there may be multiple instances with the same
                 *  uuid, thus we have to create a uniqueProcessKey to uniquely identify each instance.
                 */
                const uniqueProcessKey = `${processConfig.uuid}:${processConfig.name}`;

                domainObject.configuration.processes[uniqueProcessKey] = processConfig;
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
