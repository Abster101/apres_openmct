import { createApp } from 'vue';

export default class ChroniclesViewProvider{
    constructor(openmct) {
        this.openmct = openmct
        this.name = 'chronicle';
        this.key = 'apres.chronicle.view';
        this.priority = 1;
    }

    canView(domainObject) {
        return domainObject.type === 'apres.chronicle.type';
    }

    canEdit(domainObject) {
        return domainObject.type === 'apres.chronicle.type';
    }

    view(domainObject, objectPath, isEditing) {
        /** @type {import('vue').App<Element>} */
        let vueApp;

        return {
            show: (element) => {
                const TodoSomeComponent = {}

                vueApp = createApp(TodoSomeComponent)
                    .provide('openmct', this.openmct)
                    .provide('domainObject', domainObject)
                    .provide('objectPath', objectPath)
                
                vueApp.mount(element)
            },
            destroy: () => {
                vueApp.unmount();
            }
        }
    }
}
