import { createRouter, createWebHashHistory } from 'vue-router'
import llmAudit from './llmAudit'

const routes = [
  {
    path: '/',
    redirect: '/llmAudit/workbench',
  },
  ...llmAudit,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/llmAudit/workbench',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
