import Vue from 'vue';
import openmct from 'openmct';
import timelineComponent from './components/timeline.vue';
import activityComponent from "./components/activity.vue";
import chroniclesComponent from './components/chronicles.vue';

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
                        timelineComponent: timelineComponent,
                        activityComponent: activityComponent,
                        chroniclesComponent: chroniclesComponent

                    },
                    data() {
                        return {
                            isEditing: isEditing
                        }
                    },
                    provide: {
                        openmct,
                        domainObject,
                        objectPath
                    },
                    template: ` <timeline-component
                                    :isEditing="isEditing"
                                >
                                </timeline-component>`
                });
            },
            onEditModeChange: (isEditing) => {
                component.isEditing = isEditing;
            },
            destroy: () => {
                component.$destroy();
            }
        }
    }
};
