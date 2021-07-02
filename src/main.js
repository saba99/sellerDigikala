import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios);
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './assets/font-awesome.min.css';
import './assets/app.css';
import './assets/admin.css';

import 'jquery-ui';
require('jquery-ui/ui/widgets/sortable');
require('jquery-ui/ui/disable-selection');
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'popper.js';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('pagination', require('laravel-vue-pagination'));
Vue.use(BootstrapVue)

Vue.use(IconsPlugin)
Vue.prototype.$siteUrl = 'http://127.0.0.1:8000';
Vue.prototype.$siteName = 'دیجی آنلاین';
Vue.prototype.$base_url = '';
Vue.config.productionTip = false

window.$ = require('jquery');

Vue.component('loading', require('./components/Loading').default);
Vue.component('Breadcrumb', require('./components/Breadcrumb').default);
Vue.component('account-status', require('./components/AccountStatus').default);
Vue.component('server-error-message', require('./components/ServerErrorMessage').default);



new Vue({
  router,
  render: h => h(App),
}).$mount('#app')