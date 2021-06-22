
export class DatasetCompositionProvider {
    constructor(datasetCache) {
        this.datasetCache = datasetCache;
    }

    appliesTo(domainObject) {
        return domainObject.type === 'apres.dataset.type';
    }

    load(domainObject) {
        const composition = [];

        if (domainObject.actionTypesURL) {
            composition.push(`apres:actions.source.${domainObject.identifier.key}`);
        }

        if (domainObject.stateChroniclesURL) {
            composition.push(`apres:stateChronicles.source.${domainObject.identifier.key}`);
        }

        return Promise.resolve(composition);
    }
}
