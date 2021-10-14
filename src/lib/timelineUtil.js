const timelineUtil = {
    getProjectJsonFromTimelineObject(timelineObject) {
        const projectObject = {
            projectInfo: timelineObject.configuration.projectInfo,
            activityPlan: {
                actions: [],
                planStart: timelineObject.configuration.startTime,
                planEnd: timelineObject.configuration.endTime
            }
        };

        Object.entries(timelineObject.configuration.activities).forEach(([uuid, action]) => {
            const actionObject = {
                uuid,
                actionName: action.name,
                actionStart: action.startTime,
                actionEnd: action.endTime,
                actionType: action.type,
            }

            projectObject.activityPlan.actions.push(actionObject);
        });

        return projectObject;
    },
    getActionConfig(actionJSON, config = {}) {
        let colorHex = config.colorHex || '#4f6ffe';
        let timelineLegend = config.timelineLegend || 'Default';
        const startTime = Date.parse(actionJSON.actionStart);
        const endTime = Date.parse(actionJSON.actionEnd);

        const configuration = {
            uuid: actionJSON.uuid,
            name: actionJSON.actionName,
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
                        color: '#aaaaaa'
                    }
                }
            }
        };

        return configuration;
    },
    processConfiguration(configuration) {
        const configObject = {};

        configuration.modelConfig.forEach((model) => {
            configObject[model.actProcType] = model;
        });

        return configObject;
    },
    getTimelineDomainObject(projectJSON) {
        const timelineName = projectJSON.interfaceModel.description;
        const domainObjectConfiguration = {
            startTime: projectJSON.planningProject.activityPlan.planStart,
            endTime: projectJSON.planningProject.activityPlan.planEnd,
            activities: {},
            violations: projectJSON.planningProject.simulationInfo?.violations,
            projectInfo: projectJSON.planningProject.projectInfo
        };
        const configuration = timelineUtil.processConfiguration(projectJSON.configuration);
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

        return domainObject;
    }
}

export default timelineUtil;