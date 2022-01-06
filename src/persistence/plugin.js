import LocalStorageProvider from './localStorage/LocalStorageProvider';
const PERSISTENCE_SPACE = 'mct';

export default function plugin(projectJSON) {
    return function install(openmct) {
        const localStorageProvider = new LocalStorageProvider(PERSISTENCE_SPACE, openmct, projectJSON);
        openmct.objects.addProvider(PERSISTENCE_SPACE, localStorageProvider);
    };
}
