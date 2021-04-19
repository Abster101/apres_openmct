import Vue from 'vue';
import activityComponent from './components/activity.vue';

export default class activityViewProvider {
    constructor() {
        this.name = 'activity';
        this.key = 'apres.activity.view';
        this.priority = 1;
    }

    canView(domainObject) {
        return domainObject.type === 'apres.activity.type';
    }

    canEdit(domainObject) {
        return domainObject.type === 'apres.activity.type';
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
                        domainObject,
                        objectPath
                    }
                    ,
                    template:
                    `
                        <timeline-component
                          :isEditing="isEditing"
                        >
                        </timeline-component>
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
