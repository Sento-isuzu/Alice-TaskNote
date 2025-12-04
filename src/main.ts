import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import './style.css';

// import VMdEditor from '@kangc/v-md-editor';
// import '@kangc/v-md-editor/lib/style/base-editor.css';
// import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
// import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

// VMdEditor.use(vuepressTheme);

const app = createApp(App);

app.use(router);
app.use(ElementPlus);

for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, comp as any);
}

// app.component('VMdEditor', VMdEditor); //
app.mount('#app');
