import Vue from 'vue';
import activityComponent from './components/activity.vue';

export default class activityViewProvider {
    constructor() {
        this.name = 'activity';
        this.key = 'apres.activityList.view';
        this.priority = 1;
    }

    canView(domainObject) {
        return domainObject.type === 'apres.activityList.type';
    }

    canEdit(domainObject) {
        return domainObject.type === 'apres.activityList.type';
    }

    view(domainObject, objectPath, isEditing) {
        let component;

        return {
            show: (element) => {
                component = new Vue({
                    el: element,
                    components: {
                        activityComponent: activityComponent
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
                    }
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
