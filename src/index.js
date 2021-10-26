import { createApp } from 'vue';
import StartScreen from './startScreen/StartScreen.vue';

function initializeApp() {
    const element = document.querySelector('#app');
    createApp(StartScreen).mount(element)
}

document.addEventListener('DOMContentLoaded', initializeApp);
