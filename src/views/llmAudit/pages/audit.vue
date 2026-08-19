<template>
  <div class="audit-page">
    <!-- 审计能力入口 -->
    <div class="audit-hero">
      <div class="audit-hero-left">
        <div class="audit-hero-title">审计与合规中心</div>
        <div class="audit-hero-desc">
          每次调用自动留痕(输入/输出/Token/耗时/状态)，支持按双层维度检索与脱敏导出，满足合规审查要求。
        </div>
        <div class="audit-hero-tags">
          <span class="aht">● 全量留痕</span>
          <span class="aht">● 数据脱敏</span>
          <span class="aht">● 角色受限</span>
          <span class="aht">● 保留策略</span>
        </div>
      </div>
      <div class="audit-hero-right">
        <div class="ah-metric"><b>{{ fmtNum(totalCalls) }}</b><span>本月审计记录</span></div>
        <div class="ah-metric"><b>{{ fullContentDays }}天</b><span>全量内容保留</span></div>
        <div class="ah-metric"><b>3年</b><span>统计信息保留</span></div>
      </div>
    </div>

    <!-- 脱敏配置 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">脱敏规则配置</span>
        <el-switch v-model="maskEnabled" active-text="全局脱敏" />
      </div>
      <el-table :data="maskRules" stripe>
        <el-table-column prop="name" label="规则" width="140" />
        <el-table-column prop="pattern" label="匹配模式" min-width="260">
          <template #default="{ row }"><code class="mask-code">{{ row.pattern }}</code></template>
        </el-table-column>
        <el-table-column prop="replacement" label="替换为" width="160">
          <template #default="{ row }"><code class="mask-code">{{ row.replacement }}</code></template>
        </el-table-column>
        <el-table-column label="命中后动作" width="130">
          <template #default="{ row }">{{ row.action }}</template>
        </el-table-column>
        <el-table-column label="生效" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 审计检索 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">审计记录检索</span>
        <el-button size="small" type="primary" @click="searchAudit">检索</el-button>
        <el-button size="small" plain @click="exportAudit">导出审计报告</el-button>
      </div>
      <div class="audit-filter-row">
        <el-input v-model="auditFilter.tenant" placeholder="租户ID" size="small" style="width: 180px" clearable />
        <el-select v-model="auditFilter.business" placeholder="业务线" size="small" clearable style="width: 140px">
          <el-option v-for="b in businessLines" :key="b.key" :label="b.name" :value="b.key" />
        </el-select>
        <el-select v-model="auditFilter.product" placeholder="归属产品" size="small" clearable style="width: 160px">
          <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-date-picker v-model="auditFilter.range" type="daterange" size="small" range-separator="~"
                        start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" />
        <el-select v-model="auditFilter.operator" placeholder="操作人" size="small" clearable style="width: 130px">
          <el-option v-for="u in operators" :key="u" :label="u" :value="u" />
        </el-select>
      </div>

      <el-table :data="auditLogs" stripe class="audit-table">
        <el-table-column prop="time" label="时间" width="150" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="action" label="操作" width="220" show-overflow-tooltip />
        <el-table-column prop="tenant" label="租户" width="120" />
        <el-table-column prop="target" label="对象" min-width="140" show-overflow-tooltip />
        <el-table-column label="结果" width="90">
          <template #default="{ row }">
            <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 保留策略 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">数据保留策略</span>
      </div>
      <div class="retention-grid">
        <div class="rt-item" v-for="r in retention" :key="r.label">
          <div class="rt-label">{{ r.label }}</div>
          <div class="rt-value">{{ r.value }}</div>
          <div class="rt-desc">{{ r.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { businessLines, products, callLogs } from '../mock.js'

const auditLogs = [
  { time: '2026-08-18 10:24:11', operator: '王辰', action: '导出审计报表', tenant: 't_1209', target: '成本审计-2026-07月度', result: '成功' },
  { time: '2026-08-18 09:42:08', operator: '李晓', action: '修改脱敏规则-手机号', tenant: '-', target: '脱敏规则', result: '成功' },
  { time: '2026-08-18 08:15:33', operator: '系统', action: '批量清理过期审计数据', tenant: '-', target: '13个月前日志', result: '成功' },
  { time: '2026-08-17 18:02:51', operator: '王辰', action: '查询调用明细', tenant: 't_1209', target: '犇犇Agent-客服模块', result: '成功' },
  { time: '2026-08-17 16:40:20', operator: '系统', action: '触发Key泄露预警', tenant: 't_1001', target: 'sk-****83hi', result: '成功' },
  { time: '2026-08-17 14:11:02', operator: '张伟', action: '导出审计报告-季度', tenant: '全部', target: 'Q2合规审计', result: '成功' },
]

export default {
  name: 'llmAuditAudit',
  data() {
    return {
      businessLines,
      products,
      totalCalls: callLogs.length * 312,
      fullContentDays: 30,
      maskEnabled: true,
      maskRules: [
        { name: '手机号', pattern: '(\\d{3})\\d{4}(\\d{4})', replacement: '$1****$2', action: '打码存储', enabled: true },
        { name: '邮箱', pattern: '(\\w{2})\\w+@', replacement: '$1***@', action: '打码存储', enabled: true },
        { name: '身份证', pattern: '(\\d{4})\\d{10}(\\w{4})', replacement: '$1**********$2', action: '打码存储', enabled: true },
        { name: '银行卡', pattern: '(\\d{4})\\d{8}(\\d{4})', replacement: '$1********$2', action: '打码存储', enabled: true },
      ],
      auditFilter: { tenant: '', business: '', product: '', range: null, operator: '' },
      operators: ['王辰', '李晓', '张伟', '系统'],
      auditLogs,
      retention: [
        { label: '全量内容（含输入/输出）', value: '30天', desc: '到期后自动转成仅Token统计' },
        { label: 'Token与费用统计', value: '3年', desc: '用于成本分析与趋势预测' },
        { label: 'Key操作日志', value: '永久', desc: '用于安全审计与溯源' },
        { label: '审计导出文件', value: '永久', desc: '审计凭证归档' },
      ],
    }
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    searchAudit() {
      this.$message.success('共检索到 1289 条符合条件的审计记录')
    },
    exportAudit() {
      this.$message.success('审计报告导出中，完成后将通知操作人')
    },
  },
}
</script>

<style scoped lang="scss">
.audit-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.audit-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: linear-gradient(120deg, #18223c, #2b3d63);
  border-radius: 12px;
  padding: 24px 28px;
  color: #fff;

  &-left {
    flex: 1;
  }
  &-title { font-size: 20px; font-weight: 700; }
  &-desc { font-size: 13px; color: rgba(255,255,255,0.7); margin: 10px 0 14px; line-height: 1.6; max-width: 640px; }
  &-tags {
    display: flex;
    gap: 16px;
    .aht { font-size: 12px; color: rgba(255,255,255,0.85); }
  }
  &-right {
    display: flex;
    gap: 28px;
    .ah-metric {
      text-align: right;
      b { display: block; font-size: 22px; }
      span { font-size: 11px; color: rgba(255,255,255,0.55); }
    }
  }
}
.panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    .panel-title { font-size: 14px; font-weight: 600; color: #1d2129; }
  }
}
.mask-code {
  background: #f2f3f5;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  color: #4e5969;
}
.audit-filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.audit-table {
  margin-top: 6px;
}
.retention-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.rt-item {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 14px;
  .rt-label { font-size: 12px; color: #86909c; }
  .rt-value { font-size: 20px; font-weight: 700; color: #165dff; margin: 8px 0 6px; }
  .rt-desc { font-size: 11px; color: #c9cdd4; }
}
</style>