import ActivityInspector from "./components/ActivityInspector.vue";
import { createApp } from 'vue';

export default class ActivityInspectorViewProvider{
    constructor(openmct, actionAttributes) {
        this.openmct = openmct
        this.actionAttributes = actionAttributes
        this.key = 'apres.activity.inspector';
        this.name = 'Activity Inspector View';
    }
    canView(selection) {
        if (selection.length === 0 || selection[0].length === 0) {
            return false;
        }
        let parent = selection[0].length > 1 && selection[0][1].context.item;
        let object = selection[0][0].context.layoutItem;

        return parent
            && parent.type === 'apres.timeline.type'
            && object
            && object.type === 'apres.activity.type'
    }
    view(selection) {
        /** @type {import("vue").App<Element>} */
        let vueApp;

        return {
            show: (element) => {
                vueApp = createApp(ActivityInspector, {
                    actionObject: selection[0][0].context.layoutItem,
                    parentDomainObject: selection[0][1].context.item,
                })
                    .provide('openmct', this.openmct)
                    .provide('actionAttributes', this.actionAttributes)
                
                vueApp.mount(element)
            },
            destroy() {
                vueApp.unmount();
            }
        };
    }
    priority() {
        return 1;
    }
}