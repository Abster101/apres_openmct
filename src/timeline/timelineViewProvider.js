import Vue from 'vue';
import TimelineComponent from './components/timeline.vue';

export default class TimelineViewProvider{
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

        return {
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
                        objectPath
                    },
                    template: ` <timeline-component
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
            }
        }
    }
};
