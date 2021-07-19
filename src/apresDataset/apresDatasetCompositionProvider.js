import { activityTypes } from '../../config/action_types';

export default class ApresDatasetCompositionProvider {
    constructor(dataset) {
        this.dataset = dataset;
    }

    appliesTo(domainObject) {
        return domainObject.type === 'apres.dataset.type';
    }

    load(domainObject) {
        const composition = [];

        activityTypes.modelConfig.forEach(activity => {
            this.dataset.actionTypes[activity.actProcType] = activity;

            composition.push(`apres:activity-${activity.actProcType}`);
        });

        return Promise.resolve(composition);
    }
}