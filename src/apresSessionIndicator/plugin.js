import Vue from 'vue';
import SessionIndicator from './components/SessionIndicator.vue';

const plugin = () => {
    return (openmct) => {
        let component = new Vue ({
            components: {
                SessionIndicator: SessionIndicator
            },
            provide: {
                openmct
            },
            template: '<SessionIndicator></SessionIndicator>'
        });

        let indicator = {
            element: component.$mount().$el
        };

        openmct.indicators.add(indicator);
    }
}
export default plugin;
