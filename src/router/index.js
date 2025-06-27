import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/auth/login.vue'
import Register from '@/pages/auth/register.vue'
import Dashboard from '@/pages/dashboard/index.vue'
import Profile from '@/pages/profile/index.vue'
import EditProfile from '@/pages/profile/edit.vue'
import Predict from "@/pages/prediction/index.vue"
import History from '@/pages/history/index.vue'
import { supabase } from '@/lib/supabase'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
    {
    path: '/profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
     {
    path: '/profile/edit',
    component: EditProfile,
    meta: { requiresAuth: true }
  },
      {
    path: '/predict',
    component: Predict,
    meta: { requiresAuth: true }
  },
       {
    path: '/history',
    component: History,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (to.meta.requiresAuth && !user) next('/login')
  else next()
})

export default router
