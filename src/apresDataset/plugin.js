import ApresDatasetCompositionProvider from './apresDatasetCompositionProvider';
import ApresObjectProvider from './ApresObjectProvider';
import Dataset from './Dataset';

export default function () {
    return function plugin (openmct) {
        const dataset = new Dataset(openmct);

        const typeKey = 'apres.dataset.type';
        const typeDef = {
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
        }

        openmct.types.addType(typeKey, typeDef);
        openmct.composition.addProvider(new ApresDatasetCompositionProvider(dataset));
        openmct.objects.addProvider('apres', new ApresObjectProvider(dataset));
    }
}