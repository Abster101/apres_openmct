import {createApp} from 'vue';
import SessionIndicator from './components/SessionIndicator.vue';

const plugin = () => {
    return (openmct) => {
        let vueApp = createApp({
            components: {
                SessionIndicator
            },
            provide: {
                openmct
            },
            template: '<SessionIndicator></SessionIndicator>'
        });

        const div = document.createElement('div')
        vueApp.mount(div)

        let indicator = {
            element: div
        };

        openmct.indicators.add(indicator);
    }
}
export default plugin;
