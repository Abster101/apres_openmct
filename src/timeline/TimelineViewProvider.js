import {createApp} from 'vue';
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

        const vue = () => {
            return component.$refs.timelineComponent
        }

        const view =  {
            type: 'apres-timeline',
            show: (/** @type {HTMLElement} */element) => {
                element.style.setProperty('overflow-y', 'auto')

                vueApp = createApp({
                    components: {
                        ApresTimeline
                    },
                    data() {
                        return {
                            isEditing,
                            domainObject
                        }
                    },
                    provide: {
                        openmct: this._openmct,
                        objectPath
                    },
                    template: ` <apres-timeline
                                    ref="timelineComponent"
                                    :isEditing="isEditing"
                                    :domainObject="domainObject"
                                /> `
                });
                
                component = vueApp.mount(element)
            },
            onEditModeChange: (isEditing) => {
                component.isEditing = isEditing;
            },
            destroy() {
                vueApp.unmount();
            },
            
            // The following methods proxy to the Vue component {{

            centerTimeline() {
                vue()?.setTimeBoundsFromConfiguration()
            },
            zoomIn() {
                vue()?.zoomIn()
            },
            zoomOut() {
                vue()?.zoomOut()
            },
            importTimeline() {
                vue()?.importTimeline()
            },
                    
            // }}
        }

        return view;
    }
};
