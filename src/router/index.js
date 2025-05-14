import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/',
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
            component: () => import('../views/UserView.vue')
        },
        {
            path: '/create',
            name: 'create',
            component: () => import('../views/CreateEventView.vue')
        },
        {
            path: '/event',
            name: 'event',
            component: () => import('../views/EventView.vue')
        },
    ]
})

export default router