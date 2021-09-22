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
    getApresActionsDataset() {
        return {
            composition: [],
            location: 'mine', // Root object
            modified: Date.now(),
            persisted: Date.now(),
            type: 'apres.dataset.type',
            actionTypes: true,
            identifier: {
                key: 'apres.actions.dataset',
                namespace: ''
            },
            name: 'APRES Actions'
        }
    },
    getMctLocalStorageObject(projectJSON) {
        const apresTimelineObject = domainObjectUtil.getApresTimelineObject(projectJSON);
        const apresActionsDataset = domainObjectUtil.getApresActionsDataset();
        const rootObject = domainObjectUtil.getRootObject([apresTimelineObject.identifier.key, apresActionsDataset.identifier.key]);

        return {
            [apresTimelineObject.identifier.key]: apresTimelineObject,
            [apresActionsDataset.identifier.key]: apresActionsDataset,
            mine: rootObject
        }
    }
}

export default domainObjectUtil;