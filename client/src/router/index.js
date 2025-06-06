import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchResultsView from '../views/SearchResultsView.vue'
import { authStore } from '../stores/authStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/user',
            name: 'user',
            component: () => import('../views/UserView.vue'),
            meta: { requiresAuth: true } // Example: if user page requires login
        },
        {
            path: '/create',
            name: 'create',
            component: () => import('../views/CreateEventView.vue'),
            meta: { requiresAuth: true } // Example
        },
        {
            path: '/event/:id', // Specific event view
            name: 'EventView',
            component: () => import('../views/EventView.vue')
        },
        // Remove generic '/event' if all event views are '/event/:id'
        // {
        //     path: '/event', 
        //     name: 'event', // This might be a list view or could be removed
        //     component: () => import('../views/EventView.vue')
        // },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/admin/AdminView.vue'),
            meta: { requiresAdmin: true } // Keep this for admin dashboard access
        },
        {
            path: '/search',
            name: 'SearchResults',
            component: SearchResultsView
        },
    ]
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    if (requiresAdmin) {
        if (!authStore.isLoggedIn()) {
            next({ name: 'login', query: { redirect: to.fullPath } });
        } else if (!authStore.isAdmin()) {
            next({ name: 'home' }); // Or a 'forbidden' page
        } else {
            next();
        }
    } else if (requiresAuth) {
        if (!authStore.isLoggedIn()) {
            next({ name: 'login', query: { redirect: to.fullPath } });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;