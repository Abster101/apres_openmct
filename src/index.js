import Vue from 'vue';
import StartScreen from './startScreen/startScreen.vue';
import openmct from 'openmct';
import apresTimeline from './timeline/plugin'
import apresActivities from './apresActivities/plugin';
import apresDataset from './apresDataset/plugin';
import apresStateChronicle from './apresStateChronicle/plugin';
import { activityTypes } from '../config/action_types';

function initializeApp() {
    const element = document.querySelector('#app');

    const appComponent = new Vue({
        el: element,
        components: {
            StartScreen
        },
        template: '<StartScreen />'
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
