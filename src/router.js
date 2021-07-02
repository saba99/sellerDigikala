import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter);
const baseUrl = '';
import Admin from './components/Admin.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Index from './components/Index.vue'
import Orders from './components/Orders.vue'
import SaleStatistics from './components/SaleStatistics.vue'
import Payments from './components/Payments.vue'
import AddProduct from './components/AddProduct.vue'
import ProductList from './components/ProductList.vue'
import UpdateProduct from './components/UpdateProduct.vue';
import addProductWarranty from './components/addProductWarranty.vue';
import ProductWarranty from './components/ProductWarranty.vue';
import UpdateProductWarranty from './components/UpdateProductWarranty.vue';
import Items from './components/Items.vue';
import Gallery from './components/Gallery.vue';
import AddPackage from './components/AddPackage';
import Package from './components/Package.vue';
import PackageContent from './components/PackageContent.vue';
import InventoryLists from './components/InventoryLists.vue';
import Profile from './components/Profile.vue';
Vue.config.productionTip = false

function check_login(next) {
    const expire_in = localStorage.getItem('expire_in');
    const time = Math.floor((new Date().getTime() / 1000));
    if (expire_in > time) {
        // router.push(baseUrl + '/');
        return next();
    }
    else {
        return next();
    }
} function check_auth(next) {
    const expire_in = localStorage.getItem('expire_in');
    const time = Math.floor((new Date().getTime() / 1000));
    if (expire_in > time) {
        return next();

    }
    else {
        router.push(baseUrl + '/login');
    }
}
const routes = [
    {
        path: baseUrl + '/', component: Admin, children: [
            {
                path: '/', component: Index, name: 'index',
            }
        ],
        beforeEnter: (to, from, next) => {
            check_auth(next)
        }
    },
    {
        path: baseUrl + '/orders', component: Admin, children: [
            {
                path: '/', component: Orders,
            },
            {
                path: 'sale_statistics', component: SaleStatistics,
            },
            {
                path: 'payments', component: Payments,
            }
        ],
        beforeEnter: (to, from, next) => {
            check_login(next)
        }
    }, {
        path: baseUrl + '/products', component: Admin, children: [
            {
                path: '/', component: ProductList, name: 'ProductList'
            },
            {
                path: 'add', component: AddProduct,
            },
            {
                path: ':id/edit', component: UpdateProduct, name: 'UpdateProduct',
            },
            {
                path: ':id/items', component: Items, name: 'Items',
            },
            {
                path: ':id/gallery', component: Gallery, name: 'Gallery',
            },
            {
                path: 'warranty/:id', component: ProductWarranty, name: 'ProductWarranty',
            },
            {
                path: 'warranty/add/:id', component: addProductWarranty, name: 'addProductWarranty',
            },
            {
                path: 'warranty/:product_id/edit/:id', component: UpdateProductWarranty, name: 'UpdateProductWarranty',
            }
        ],
        beforeEnter: (to, from, next) => {
            check_auth(next)
        }
    }, {
        path: baseUrl + '/package', component: Admin, children: [
            {
                path: '/', component: Package, name: 'Package'
            },
            {
                path: 'add', component: AddPackage,
            },
            {
                path: 'show/:id', component: PackageContent, name: 'PackageContent'
            },
            {
                path: 'inventory', component: InventoryLists
            }
        ],
        beforeEnter: (to, from, next) => {
            check_auth(next)
        }
    }, {
        path: baseUrl + '/setting', component: Admin, children: [
            {
                path: 'profile', component: Profile,
            }
        ],
        beforeEnter: (to, from, next) => {
            check_auth(next)
        }
    },
    {
        path: '/login', component: Login, name: 'login', beforeEnter: (to, from, next) => {
            check_login(next)
        }
    },
    {
        path: '/register', component: Register, beforeEnter: (to, from, next) => {
            check_login(next)
        }
    }
];

const router = new VueRouter({
    mode: 'history',
    routes
})
export default router;
