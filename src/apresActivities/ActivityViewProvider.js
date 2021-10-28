import { createApp, reactive } from 'vue';
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

        let props = reactive({ isEditing: { value: isEditing }, domainObject })

        return {
            show: (element) => {
                vueApp = createApp(ActivityView, props)
                    .provide('openmct', this.openmct)
                    .provide('objectPath', objectPath)
                
                vueApp.mount(element)
            },
            onEditModeChange: (isEditing) => {
                props.isEditing.value = isEditing
            },
            destroy: () => {
                vueApp.unmount();
            }
        }
    }
}
