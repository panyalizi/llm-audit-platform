# 统一大模型API调用统计审计平台

独立于犇犇AI工单系统的 Demo 项目，用于演示大模型API调用统计审计产品的核心页面。

## 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:5188/#/llmAudit/workbench`

## 页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/llmAudit/workbench` | 工作台 | 今日概览、趋势、告警 |
| `/llmAudit/usage` | 用量统计 | 公司级(公司TOP/产品TOP双向钻取)、业务层、技术层 |
| `/llmAudit/logs` | 调用明细 | 检索 + 审计JSON详情 |
| `/llmAudit/cost` | 成本中心 | 预算、费用趋势、报表 |
| `/llmAudit/openRouter` | OpenRouter治理 | 服务商健康度、路由策略、模型性价比 |
| `/llmAudit/audit` | 审计中心 | 脱敏规则、审计检索、保留策略 |

## 技术栈

Vue3 + Vite + Element Plus + Vue Router，数据全部为本地 Mock。
