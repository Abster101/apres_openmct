import Vue from 'vue';
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
        let component;

        let vue = () => {
            return component.$refs.timelineComponent
        }

        const view =  {
            type: 'apres-timeline',
            show: (element) => {
                component = new Vue({
                    el: element,
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
            },
            onEditModeChange: (isEditing) => {
                component.isEditing = isEditing;
            },
            destroy() {
                component.$destroy();
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
