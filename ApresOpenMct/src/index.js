import Vue from 'vue';
import StartScreen from './startScreen/startScreen.vue';

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
