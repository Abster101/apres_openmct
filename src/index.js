import { createApp } from 'vue';
import StartScreen from './startScreen/StartScreen.vue';

// TODO are these needed?
// import openmct from 'openmct';
// import apresTimeline from './timeline/plugin'
// import apresActivities from './apresActivities/plugin';
// import apresDataset from './apresDataset/plugin';
// import apresStateChronicle from './apresStateChronicle/plugin';
// import { activityTypes } from '../config/action_types';

function initializeApp() {
    const element = document.querySelector('#app');

    const vueApp = createApp({
        components: {
            StartScreen
        },
        template: '<StartScreen />'
    });

    vueApp.mount(element)
}

document.addEventListener('DOMContentLoaded', initializeApp);
