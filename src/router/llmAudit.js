const llmAudit = [
  {
    path: '/llmAudit',
    name: 'llmAudit',
    component: () => import('@/views/llmAudit/index.vue'),
    redirect: '/llmAudit/workbench',
    children: [
      {
        path: 'workbench',
        name: 'llmAuditWorkbench',
        meta: { title: '工作台' },
        component: () => import('@/views/llmAudit/pages/workbench.vue'),
      },
      {
        path: 'usage',
        name: 'llmAuditUsage',
        meta: { title: '用量统计' },
        component: () => import('@/views/llmAudit/pages/usage.vue'),
      },
      {
        path: 'logs',
        name: 'llmAuditLogs',
        meta: { title: '调用明细' },
        component: () => import('@/views/llmAudit/pages/logs.vue'),
      },
      {
        path: 'cost',
        name: 'llmAuditCost',
        meta: { title: '成本中心' },
        component: () => import('@/views/llmAudit/pages/cost.vue'),
      },
      {
        path: 'openRouter',
        name: 'llmAuditOpenRouter',
        meta: { title: 'OpenRouter数据治理' },
        component: () => import('@/views/llmAudit/pages/openRouter.vue'),
      },
      {
        path: 'audit',
        name: 'llmAuditAudit',
        meta: { title: '审计中心' },
        component: () => import('@/views/llmAudit/pages/audit.vue'),
      },
      {
        path: 'tokenlimit',
        name: 'llmAuditTokenLimit',
        meta: { title: '配额网关' },
        component: () => import('@/views/llmAudit/pages/tokenlimit.vue'),
      },
    ],
  },
]

export default llmAudit
