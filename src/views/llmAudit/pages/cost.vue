<template>
  <div class="cost-page">
    <!-- 两本账概览 -->
    <div class="two-books-overview">
      <div class="overview-card">
        <div class="overview-header">
          <div class="overview-title">运行时预估成本</div>
          <div class="overview-subtitle">用于路由排序、预算、异常预警、日常经营观察</div>
          <el-tag type="info" size="small">非财务最终口径</el-tag>
        </div>
        <div class="overview-content">
          <div class="metric-item">
            <div class="metric-label">今日预估费用</div>
            <div class="metric-value">¥{{ report.budget.dailyUsed.toFixed(2) }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">本月预估费用</div>
            <div class="metric-value">¥{{ fmtNum(report.budget.monthlyUsed) }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">预算使用率</div>
            <div class="metric-value">{{ Math.round(report.budget.dailyPercent * 100) }}%</div>
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-header">
          <div class="overview-title">月度实际结算成本</div>
          <div class="overview-subtitle">用于财务对账、产品损益、客户毛利、锁账报表</div>
          <el-tag type="success" size="small">以供应商实际账单为准</el-tag>
        </div>
        <div class="overview-content">
          <div class="metric-item">
            <div class="metric-label">本月实际费用</div>
            <div class="metric-value">¥{{ fmtNum(report.budget.monthlyUsed * 1.15) }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">账单匹配率</div>
            <div class="metric-value">98.5%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">分摊完成率</div>
            <div class="metric-value">100%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预算卡片 -->
    <div class="budget-grid">
      <div class="budget-card">
        <div class="bc-head">
          <span>今日预算</span>
          <el-tag size="small" :type="report.budget.dailyPercent >= 0.95 ? 'danger' : report.budget.dailyPercent >= 0.8 ? 'warning' : 'success'">
            {{ Math.round(report.budget.dailyPercent * 100) }}%
          </el-tag>
        </div>
        <div class="bc-value">{{ report.budget.dailyUsed }} / ¥{{ report.budget.daily }}</div>
        <el-progress :percentage="Math.round(report.budget.dailyPercent * 100)" :show-text="false"
                     :stroke-width="10" :color="report.budget.dailyPercent >= 0.95 ? '#f53f3f' : '#165dff'" />
        <div class="bc-foot">预算¥{{ report.budget.daily }} · 已用今日</div>
      </div>

      <div class="budget-card">
        <div class="bc-head">
          <span>本月预算</span>
          <el-tag size="small" :type="report.budget.monthlyPercent >= 0.95 ? 'danger' : report.budget.monthlyPercent >= 0.8 ? 'warning' : 'success'">
            {{ Math.round(report.budget.monthlyPercent * 100) }}%
          </el-tag>
        </div>
        <div class="bc-value">{{ fmtNum(report.budget.monthlyUsed) }} / ¥{{ fmtNum(report.budget.monthly) }}</div>
        <el-progress :percentage="Math.round(report.budget.monthlyPercent * 100)" :show-text="false"
                     :stroke-width="10" :color="report.budget.monthlyPercent >= 0.95 ? '#f53f3f' : '#ff7d00'" />
        <div class="bc-foot">本月预算¥{{ fmtNum(report.budget.monthly) }}</div>
      </div>

      <div class="budget-card budget-card--save">
        <div class="bc-head">
          <span>本月预估节省</span>
          <el-tag size="small" type="success">+6.2%</el-tag>
        </div>
        <div class="bc-value ok">¥{{ fmtNum(report.budget.monthly - report.budget.monthlyUsed) }}</div>
        <div class="bc-save-note">基于 Flash 系列替换 Pro 的降本策略测算</div>
      </div>
    </div>

    <!-- 账单桶与分摊 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">账单桶与分摊算法</span>
        <span class="panel-sub">供应商账单按最细粒度分摊</span>
      </div>
      <div class="bill-bucket-info">
        <div class="bucket-formula">
          <div class="formula-title">分摊公式</div>
          <div class="formula-content">
            <div class="formula-item">
              <div class="formula-label">实际成本(i, b) = 账单桶实付金额(b) × 有效 token(i, b) ÷ 全部有效 token(b)</div>
            </div>
          </div>
        </div>
        <div class="bucket-examples">
          <div class="example-item">
            <div class="example-title">账单桶维度</div>
            <div class="example-content">账期 × provider × 供应商账号 × 模型 × 计费项目 × 价格时段</div>
          </div>
          <div class="example-item">
            <div class="example-title">计费项目</div>
            <div class="example-content">输入 token、输出 token、缓存 token、批量推理、推理费用等</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月度费用趋势 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">近6个月费用趋势</span>
        <span class="panel-sub">单位：元</span>
      </div>
      <div class="line-area">
        <div class="line-y-axis">
          <span>45k</span><span>30k</span><span>15k</span><span>0</span>
        </div>
        <div class="line-chart">
          <div class="line-grid-line" v-for="i in 4" :key="i" :style="{ top: ((i - 1) * 25) + '%' }"></div>
          <svg class="line-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
            <polyline :points="linePoints" fill="none" stroke="#165dff" stroke-width="2" />
            <circle v-for="(p, i) in lineCoords" :key="i" :cx="p.x" :cy="p.y" r="4" fill="#fff" stroke="#165dff" stroke-width="2">
              <title>{{ p.date }}: ¥{{ p.cost }}</title>
            </circle>
          </svg>
          <div class="line-x-axis">
            <span v-for="m in report.costTrend()" :key="m.date">{{ m.date }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 维度切换报表 -->
    <div class="cost-tabs">
      <div v-for="t in tabs" :key="t.key" class="cost-tab" :class="{ active: costTab === t.key }" @click="costTab = t.key">
        {{ t.label }}
      </div>
    </div>

    <div class="panel" v-if="costTab === 'business'">
      <el-table :data="report.byBusiness" stripe>
        <el-table-column label="业务线" min-width="120">
          <template #default="{ row }">
            <span class="biz-tag">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用(¥)" sortable align="right">
          <template #default="{ row }">¥{{ row.cost }}</template>
        </el-table-column>
        <el-table-column prop="calls" label="调用量" sortable align="right" />
        <el-table-column label="占比" min-width="160">
          <template #default="{ row }">
            <div class="mini-track"><div class="mini-fill" :style="{ width: percent(row.cost, bizCostTotal) + '%' }"></div></div>
          </template>
        </el-table-column>
        <el-table-column label="成本/千token" width="120" align="right">
          <template #default="{ row }">¥{{ ((row.cost / row.tokens) * 1000).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <div class="panel" v-else-if="costTab === 'provider'">
      <el-table :data="report.byProvider" stripe>
        <el-table-column prop="name" label="供应商" min-width="130" />
        <el-table-column prop="cost" label="费用(¥)" sortable align="right">
          <template #default="{ row }">¥{{ row.cost }}</template>
        </el-table-column>
        <el-table-column prop="tokens" label="Token" sortable align="right" />
        <el-table-column prop="successRate" label="成功率" sortable align="right">
          <template #default="{ row }">{{ row.successRate }}%</template>
        </el-table-column>
        <el-table-column prop="avgLatency" label="平均延迟(ms)" sortable align="right" />
      </el-table>
    </div>

    <div class="panel" v-else>
      <el-table :data="report.byModel" stripe>
        <el-table-column prop="name" label="模型" min-width="150" />
        <el-table-column prop="providerName" label="服务商" width="110" />
        <el-table-column label="系列" width="80">
          <template #default="{ row }">
            <el-tag :type="row.series === 'Pro' ? 'danger' : 'success'" size="small">{{ row.series }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用(¥)" sortable align="right">
          <template #default="{ row }">¥{{ row.cost }}</template>
        </el-table-column>
        <el-table-column label="综合单价(¥/1k)" width="120" align="right">
          <template #default="{ row }">{{ ((row.priceIn + row.priceOut) / 2).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="性价比说明" min-width="200">
          <template #default="{ row }">
            <el-tag v-if="row.series === 'Flash'" type="success" size="small" effect="plain">低成本优先推荐</el-tag>
            <el-tag v-else type="warning" size="small" effect="plain">高质量场景专用</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="panel export-bar">
      <span>需要对账或审计时，可导出成本明细作为凭证：</span>
      <el-button size="small" type="primary" plain @click="exportData">导出费用报表 (Excel)</el-button>
      <el-button size="small" plain @click="exportData">导出明细 (CSV)</el-button>
    </div>
  </div>
</template>

<script>
import { costReport } from '../mock.js'

export default {
  name: 'llmAuditCost',
  data() {
    return {
      report: costReport,
      costTab: 'business',
      tabs: [
        { key: 'business', label: '按业务线' },
        { key: 'provider', label: '按供应商' },
        { key: 'model', label: '按模型' },
      ],
    }
  },
  computed: {
    bizCostTotal() {
      return this.report.byBusiness.reduce((s, x) => s + x.cost, 0)
    },
    lineData() {
      return this.report.costTrend()
    },
    lineMax() {
      return Math.max(...this.lineData.map((x) => x.cost), 1)
    },
    lineCoords() {
      const w = 600, h = 200
      return this.lineData.map((item, i) => ({
        x: (w / (this.lineData.length - 1)) * i,
        y: h - (item.cost / this.lineMax) * (h - 20) - 10,
        date: item.date,
        cost: item.cost,
      }))
    },
    linePoints() {
      return this.lineCoords.map((p) => `${p.x},${p.y}`).join(' ')
    },
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    percent(v, total) {
      if (!total) return 0
      return Math.round((v / total) * 100)
    },
    exportData() {
      this.$message.success('导出任务已创建，完成后将在右上角通知')
    },
  },
}
</script>

<style scoped lang="scss">
.cost-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 两本账概览 */
.two-books-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.overview-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &-header {
    margin-bottom: 16px;
  }
  &-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 4px;
  }
  &-subtitle {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 8px;
  }
}
.overview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f2f3f5;
  &:last-child {
    border-bottom: none;
  }
  .metric-label {
    font-size: 14px;
    color: #4e5969;
  }
  .metric-value {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }
}

.budget-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.budget-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.budget-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  &-value {
    font-size: 24px;
    font-weight: 700;
    color: #1d2129;
    margin-bottom: 10px;
    font-variant-numeric: tabular-nums;
  }
  &-foot {
    font-size: 12px;
    color: #86909c;
  }
  &--save {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;
    .bc-value {
      color: #0369a1;
    }
    .bc-save-note {
      color: #0369a1;
      font-size: 11px;
      margin-top: 6px;
    }
  }
}

/* 账单桶信息 */
.bill-bucket-info {
  padding: 16px 0;
}
.bucket-formula {
  margin-bottom: 20px;
  .formula-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 8px;
  }
  .formula-content {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 12px;
    font-size: 13px;
    color: #4e5969;
    line-height: 1.6;
  }
}
.bucket-examples {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.example-item {
  .example-title {
    font-size: 13px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 6px;
  }
  .example-content {
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
  }
}
.budget-card {
  .bc-value {
    font-size: 26px;
    font-weight: 700;
    color: #1d2129;
    margin: 10px 0 12px;
    &.ok { color: #00b42a; }
  }
  .bc-foot {
    margin-top: 10px;
    font-size: 12px;
    color: #c9cdd4;
  }
  &.budget-card--save {
    background: linear-gradient(135deg, #00b42a, #23c3430f);
    border: 1px solid #e8f5ec;
    .bc-save-note {
      font-size: 12px;
      color: #86909c;
      margin-top: 6px;
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
    align-items: baseline;
    margin-bottom: 14px;
    .panel-title { font-size: 14px; font-weight: 600; color: #1d2129; }
    .panel-sub { margin-left: auto; font-size: 12px; color: #c9cdd4; }
  }
}
/* 折线图 */
.line-area {
  display: flex;
  gap: 8px;
  height: 220px;
}
.line-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 11px;
  color: #86909c;
}
.line-chart {
  flex: 1;
  position: relative;
}
.line-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed #e5e6eb;
}
.line-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.line-x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #86909c;
}
.cost-tabs {
  display: flex;
  gap: 8px;
  .cost-tab {
    padding: 8px 16px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #e5e6eb;
    font-size: 13px;
    color: #4e5969;
    cursor: pointer;
    &.active,
    &:hover {
      border-color: #165dff;
      color: #165dff;
    }
  }
}
.biz-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  background: #e8f3ff;
  color: #165dff;
  font-size: 12px;
}
.mini-track {
  height: 6px;
  background: #f2f3f5;
  border-radius: 3px;
  overflow: hidden;
  .mini-fill { height: 100%; background: #165dff; border-radius: 3px; }
}
.export-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #86909c;
}
</style>