import { DatasetCompositionProvider } from './compositionProviders';
import ApresObjectProvider from './ApresObjectProvider';
import DatasetCache from './DatasetCache';

export default function () {
    return function plugin (openmct) {
        const datasetCache = new DatasetCache(openmct);

        const datasetTypeKey = 'apres.dataset.type';
        const datasetTypeDefinition = {
            name: 'Apres Dataset',
            description: 'Configure apres actions and state chronicles.',
            creatable: true,
            cssClass: 'icon-dataset',
            initialize: (domainObject) => {
                domainObject.version = 1;
                domainObject.composition = [];

                return domainObject;
            },
            form: [
                {
                    name: 'Action Types',
                    key: 'actionTypesURL',
                    control: 'textfield',
                    cssClass: 'l-input-lg'
                },
                {
                    name: 'State Chronicles Types',
                    key: 'stateChroniclesUrl',
                    control: 'textfield',
                    cssClass: 'l-input-lg'
                }
            ]
        };
        const activitySourceTypeKey = 'apres.action.source';
        const activitySourceType = {
            name: 'Activities',
            cssClass: 'icon-folder'
        }

        openmct.types.addType(datasetTypeKey, datasetTypeDefinition);
        openmct.types.addType(activitySourceTypeKey, activitySourceType);

        openmct.composition.addProvider(new DatasetCompositionProvider(datasetCache));

        openmct.objects.addProvider('apres', new ApresObjectProvider(datasetCache));
    }
}