import activityInspector from "./components/activityInspector.vue";
import Vue from 'vue';

export default function ActivityInspectorViewProvider(openmct) {
    return {
        key: 'apres.activity.inspector',
        name: 'Activity Inspector View',
        canView: function (selection) {
            if (selection.length === 0 || selection[0].length === 0) {
                return false;
            }
            let parent = selection[0].length > 1 && selection[0][1].context.item;
            let object = selection[0][0].context.layoutItem;

            return parent
                && parent.type === 'apres.timeline.type'
                && object
                && object.id.includes('apres:actionsType');
        },
        view: function (selection) {
            let component;

            return {
                show: function (element) {
                    component = new Vue({
                        el: element,
                        components: {
                            activityInspector
                        },
                        data() {
                            return {
                                actionObject: selection[0][0].context.layoutItem,
                                parentDomainObject: selection[0][1].context.item
                            }
                        },
                        provide: {
                            openmct
                        },
                        template: `
                            <activity-inspector
                                :actionObject="actionObject"
                                :parentDomainObject="parentDomainObject"
                            />
                        `
                    });
                },
                destroy: function () {
                    if (component) {
                        component.$destroy();
                        component = undefined;
                    }
                }
            };
        },
        priority: function () {
            return 1;
        }
    };
}
