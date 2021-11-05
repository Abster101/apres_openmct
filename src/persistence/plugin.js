import LocalStorageProvider from './localStorage/LocalStorageProvider';
const PERSISTENCE_SPACE = 'mct';

export default function CouchPlugin(options) {
    return function install(openmct) {
        const localStorageProvider = new LocalStorageProvider(PERSISTENCE_SPACE, openmct);
        openmct.objects.addProvider(PERSISTENCE_SPACE, localStorageProvider);
    };
}
