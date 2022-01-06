import Vue from 'vue';
import TimelineComponent from './components/timeline.vue';

export default class TimelineViewProvider{
    constructor(openmct, projectJSON) {
        this._openmct = openmct;

        this.projectJSON = projectJSON;
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

        const view =  {
            show: (element) => {
                component = new Vue({
                    el: element,
                    components: {
                        TimelineComponent
                    },
                    data() {
                        return {
                            isEditing,
                            domainObject
                        }
                    },
                    provide: {
                        openmct: this._openmct,
                        initialProjectJSON: this.projectJSON,
                        objectPath,
                    },
                    template: ` <timeline-component
                                    ref="timelineComponent"
                                    :isEditing="isEditing"
                                    :domainObject="domainObject"
                                /> `
                });
            },
            onEditModeChange: (isEditing) => {
                component.isEditing = isEditing;
            },
            getViewContext() {
                if (component) {
                    let ref = component.$refs.timelineComponent;

                    return ref && ref.getViewContext();
                } else {
                    return {
                        type: 'timeline-component'
                    };
                }
            },
            destroy() {
                component.$destroy();
            }
        }

        return view;
    }
};
