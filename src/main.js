import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core';
import xmlhiglight from 'highlight.js/lib/languages/xml';
import hljsVuePlugin from "@highlightjs/vue-plugin";

hljs.registerLanguage('xml', xmlhiglight);

createApp(App).use(hljsVuePlugin).mount('#app')
