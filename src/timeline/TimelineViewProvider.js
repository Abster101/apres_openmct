import {createApp, reactive} from 'vue';
import ApresTimeline from './components/ApresTimeline.vue';

export default class TimelineViewProvider {
    constructor(openmct) {
        this._openmct = openmct;

        this.name = 'Timeline';
        this.key = 'apres.timeline.view';
        this.priority = 1;
    }

    canView(domainObject) {
        return domainObject.type === 'apres.timeline.type';
    }

    canEdit(domainObject) {
        return domainObject.type === 'apres.timeline.type';
    }

    view(domainObject, objectPath, isEditing) {
        /** @type {import('vue').App} */
        let vueApp;

        /** @type {import('vue').ComponentPublicInstance} */
        let component;
        
        let props = reactive({ isEditing, domainObject })

        return {
            type: 'apres-timeline',
            show: (/** @type {HTMLElement} */element) => {
                element.style.setProperty('overflow-y', 'auto')
                
                vueApp = createApp(ApresTimeline, props)
                    .provide('openmct', this._openmct)
                    .provide('objectPath', objectPath)
                
                component = vueApp.mount(element)
            },
            onEditModeChange: (isEditing) => {
                props.isEditing = isEditing
            },
            destroy() {
                vueApp.unmount();
            },
            
            // The following methods proxy to the Vue component {{

            centerTimeline() {
                component.setTimeBoundsFromConfiguration()
            },
            zoomIn() {
                component.zoomIn()
            },
            zoomOut() {
                component.zoomOut()
            },
            importTimeline() {
                component.importTimeline()
            },
            saveTimeline() {
                component.saveTimeline()
            },
            deleteTimeline() {
                component.deleteTimeline()
            },
                    
            // }}
        }
    }
};
