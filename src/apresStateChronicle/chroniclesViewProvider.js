//import chroniclesView from "./components/chroniclesView";
//import state_types from "../../config/state_types";
import Vue from 'vue';

export default class chroniclesViewProvider{
        constructor() {
        this.name = 'chronicle';
        this.key = 'apres.chronicle.view';
        this.priority = 1;
    }

    canView (domainObject) {
        return domainObject.type === 'apres.chronicle.type';
    }

    canEdit (domainObject) {
        return domainObject.type === 'apres.chronicle.type';
    }

    view (domainObject, objectPath, isEditing) {
        let component;

        return {
            show: (element) => {
                component = new Vue({
                    el: element,
                    components: {

                    },data () {
                        return {
                            isEditing: isEditing
                        }
                    },
                    provide: {
                        openmct,
                        domainObject,
                        objectPath
                    },
                });
            },
            destroy: () => {
                component.$destroy();
            }
        }
    }
}
