const timelineUtil = {
    getProjectJsonFromTimelineObject(timelineObject) {
        const projectObject = {
            $schema: './PlanningProjectSchema.json',
            projectInfo: timelineObject.configuration.projectInfo,
            activityPlan: {
                actions: [],
                planStart: timelineObject.configuration.startTime,
                planEnd: timelineObject.configuration.endTime,
            },
        }

        Object.entries(timelineObject.configuration.activities).forEach(([uuid, action]) => {
            const actionObject = {
                uuid,
                actionName: action.name,
                actionStart: new Date(action.startTime).toJSON().split('.')[0] + 'Z',
                actionEnd: new Date(action.endTime).toJSON().split('.')[0] + 'Z',
                actionType: action.type,
            }

            projectObject.activityPlan.actions.push(actionObject)
        })

        return projectObject
    },

    /**
    @param {TimelineAction} actionJSON
    @param {TimelineModelConfig} config
    */
    getActionConfig(
        /*actionParrameterTypes,*/ actionJSON,
        config = {
            colorHex: '#4f6ffe',
            timelineLegend: 'Default',
            actProcType: 'not used here',
            textHexColor: 'not used here',
        },
    ) {
        let colorHex = config.colorHex || '#4f6ffe'
        let timelineLegend = config.timelineLegend || 'Default'
        const startTime = Date.parse(actionJSON.actionStart)
        const endTime = Date.parse(actionJSON.actionEnd)

        const configuration = {
            uuid: actionJSON.uuid,
            name: actionJSON.name,
            note: actionJSON.note,
            type: actionJSON.actionType,
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
                        color: '#aaaaaa',
                    },
                },
            },
        }

        return configuration
    },

    getChroniclesConfig(chronicleJSON, config = {}, projectEndTime) {
        let timelineLegend = config.variable || 'Default'
        let maxNumeric
        let minNumeric

        chronicleJSON.episodes.forEach((episode, index) => {
            const episodeStartTime = Date.parse(episode.time)

            if (!isNaN(episode.value)) {
                const parsedValue = parseFloat(episode.value)

                episode.colorHex = config.colorHex ? config.colorHex : '#000000'
                episode.textColorHex = config.colorHex ? config.colorHex : '#000000'

                if (!maxNumeric) {
                    maxNumeric = parsedValue
                } else {
                    if (maxNumeric < parsedValue) {
                        maxNumeric = parsedValue
                    }
                }

                if (!minNumeric) {
                    minNumeric = parsedValue
                } else {
                    if (minNumeric > parsedValue) {
                        minNumeric = parsedValue
                    }
                }
            } else {
                const episodeConfig = config.stateColors?.filter(state => {
                    return state.stateVal === episode.value
                })

                episode.colorHex = episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].colorHex : '#000000'
                episode.textColorHex =
                    episodeConfig && episodeConfig.length > 0 ? episodeConfig[0].textColorHex : '#000000'
            }

            if (index < chronicleJSON.episodes.length - 1) {
                const nextEpisodeStartTime = Date.parse(chronicleJSON.episodes[index + 1].time)

                episode.duration = nextEpisodeStartTime - episodeStartTime
            } else {
                const endTime = Date.parse(projectEndTime)

                episode.duration = endTime - episodeStartTime
            }
        })

        const configuration = {
            name: chronicleJSON.variable,
            timelineLegend: timelineLegend,
            episodes: chronicleJSON.episodes,
        }

        if (maxNumeric && minNumeric) {
            if (config.minBound) {
                minNumeric = parseFloat(config.minBound)
            }

            if (config.maxBound) {
                maxNumeric = parseFloat(config.maxBound)
            }

            configuration.endPoints = {
                min: minNumeric,
                max: maxNumeric,
            }
        }

        if (config.minLimit || config.maxLimit) {
            configuration.limits = {}

            if (config.minLimit) {
                configuration.limits.minLimit = parseFloat(config.minLimit)
            }

            if (config.maxLimit) {
                configuration.limits.maxLimit = parseFloat(config.minLimit)
            }
        }

        return configuration
    },

    /** @param {PlanningProjectJson['configuration']} configuration */
    processConfiguration(configuration) {
        /** @type {Record<string, TimelineModelConfig>} */
        const configObject = {}

        configuration.modelConfig.forEach(model => {
            configObject[model.actProcType] = model
        })

        return configObject
    },

    /** @param {PlanningProjectJson['configuration']} configuration */
    processChronicleConfiguration(configuration) {
        /** @type {Record<string, TimelineNumericChronicleConfig | TimelineStateChronicleConfig>} */
        const configObject = {}

        configuration.numericChronicleConfig.forEach(state => {
            configObject[state.varName] = state
        })

        configuration.stateChronicleConfig.forEach(state => {
            configObject[state.varName] = state
        })

        return configObject
    },

    /**
    @param {PlanningProjectJson} projectJSON
    @returns {TimelineDomainObject}
    */
    getTimelineDomainObject(projectJSON) {
        const timelineName = projectJSON.planningProject.projectInfo.projRef
        const notes = projectJSON.planningProject.projectInfo.note

        /** @type {TimelineConfig} */
        const domainObjectConfiguration = {
            startTime: projectJSON.planningProject.activityPlan.planStart,
            endTime: projectJSON.planningProject.activityPlan.planEnd,
            activities: {},
            chronicles: [],

            // This line is wrong, or I have a new/older JSON schema file.
            // violations: projectJSON.planningProject.simulationInfo?.violations,

            // In the schema I have, simulationInfo is inside of activityPlan.
            violations: projectJSON.planningProject.activityPlan.simulationInfo?.violations,

            projectInfo: projectJSON.planningProject.projectInfo,
        }

        const configuration = timelineUtil.processConfiguration(projectJSON.configuration)

        const chronicleConfiguration = timelineUtil.processChronicleConfiguration(projectJSON.configuration)

        /** @type {TimelineDomainObject} */
        const domainObject = {
            configuration: domainObjectConfiguration,
            identifier: {
                key: 'apres.timeline'

                // TODO Why does Timeline Vue component add an empty "namespace"
                // property here instead the empty "namespace" property being created
                // here?
                // Also is "namespace" ever not empty?
            },
            composition: [],
            location: 'mine',
            modified: Date.now(),
            created: Date.now(),
            name: timelineName,
            type: 'apres.timeline.type',
            notes,
        }

        window.obj1 = domainObject

        const actions = projectJSON.planningProject.activityPlan.actions

        actions.forEach(action => {
            const actionConfig = timelineUtil.getActionConfig(
                /*actionParrameterTypes,*/ action,
                configuration[action.actionType],
            )
            domainObject.configuration.activities[action.uuid] = actionConfig
        })

        // projectJSON.planningProject.simulationInfo?.chronicles?.forEach((chronicle) => {
        projectJSON.planningProject.activityPlan.simulationInfo?.chronicles?.forEach(chronicle => {
            const projectEndTime = projectJSON.planningProject.activityPlan.planEnd
            const chronicleConfig = timelineUtil.getChroniclesConfig(
                chronicle,
                chronicleConfiguration[chronicle.variable],
                projectEndTime,
            )

            domainObject.configuration.chronicles.push(chronicleConfig)
        })

        return domainObject
    },
}

export default timelineUtil
