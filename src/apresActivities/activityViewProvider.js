import Vue from 'vue';
import ActivityView from './components/activityView.vue';

export default class ActivityViewProvider {
    constructor(openmct) {
        this.name = 'activity';
        this.key = 'apres.activity.view';
        this.priority = 1;
        this.openmct = openmct;
    }

    canView(domainObject) {
        return domainObject.type.includes('apres.activity');
    }

    view(domainObject, objectPath, isEditing) {
        let component;

        return {
            show: (element) => {
                component = new Vue ({
                    el: element,
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
            },
            onEditModeChange: (isEditing) => {
                component.isEditing = isEditing;
            },
            destroy: () => {
                component.$destroy();
            }
        }
    }
}
