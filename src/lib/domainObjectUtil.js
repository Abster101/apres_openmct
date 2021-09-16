import timelineUtil from './timelineUtil';

const domainObjectUtil = {
    getRootObject(composition) {
        return {
            composition,
            location: "ROOT",
            modified: Date.now(),
            name: "My Items",
            persisted: Date.now(),
            type: "folder"
        }
    },
    getApresTimelineObject(projectJSON) {
        return timelineUtil.getTimelineDomainObject(projectJSON);
    },
    getMctLocalStorageObject(projectJSON) {
        const apresTimelineObject = domainObjectUtil.getApresTimelineObject(projectJSON);
        const rootObject = domainObjectUtil.getRootObject([apresTimelineObject.identifier.key]);

        return {
            [apresTimelineObject.identifier.key]: apresTimelineObject,
            mine: rootObject
        }
    }
}

export default domainObjectUtil;