import LocalStoragePersistenceProvider from './LocalStoragePersistenceProvider';
const NAMESPACE = '';
const PERSISTENCE_SPACE = 'mct';

export default function CouchPlugin(options) {
    return function install(openmct) {
        const localStorageProvider = new LocalStoragePersistenceProvider(PERSISTENCE_SPACE);
        openmct.objects.addProvider(PERSISTENCE_SPACE, localStorageProvider);
    };
}