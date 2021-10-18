import { createApp } from 'vue';
import ActivityView from './components/ActivityView.vue';

export default class ActivityViewProvider {
    constructor(openmct) {
        this.name = 'activity';
        this.key = 'apres.activity.view';
        this.priority = 1;
        this.openmct = openmct;
    }

    canView(domainObject) {
        return domainObject.type === 'apres.action';
    }

    view(domainObject, objectPath, isEditing) {
        /** @type {import('vue').App<Element>} */
        let vueApp;

        /** @type {import('vue').ComponentPublicInstance} */
        let component;

        return {
            show: (element) => {
                vueApp = createApp({
                    components: {
                        ActivityView
                    },
                    data() {
                        return {
                            isEditing,
                            domainObject
                        }
                    },
                    provide: {
                        openmct: this.openmct,
                        objectPath
                    },
                    template:
                        `
                        <activity-view
                            :isEditing="isEditing"
                            :domainObject="domainObject"
                        />
                        `
                });
                
                component = vueApp.mount(element)
            },
            onEditModeChange: (isEditing) => {
                component.isEditing = isEditing;
            },
            destroy: () => {
                vueApp.unmount();
            }
        }
    }
}
