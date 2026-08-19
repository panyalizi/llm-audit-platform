<template>
  <div class="wb-page">
    <!-- 顶部概览卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card-label">今日调用量</div>
        <div class="stat-card-value">{{ fmtNum(workbench.today.calls) }}</div>
        <div class="stat-card-foot up">较昨日 +8.3%</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">今日Token</div>
        <div class="stat-card-value">{{ fmtNum(workbench.today.todayTokens) }}</div>
        <div class="stat-card-foot up">较昨日 +6.1%</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">今日费用(¥)</div>
        <div class="stat-card-value">{{ workbench.today.todayCost.toFixed(2) }}</div>
        <div class="stat-card-foot warn">已达日预算 59%</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">今日成功率</div>
        <div class="stat-card-value ok">{{ workbench.today.successRate }}%</div>
        <div class="stat-card-foot">P95延迟 1.2s</div>
      </div>
    </div>

    <!-- 中部：趋势 + 业务成本结构 -->
    <div class="wb-row">
      <!-- 今日调用趋势(小时) -->
      <div class="panel wb-trend-panel">
        <div class="panel-head">
          <span class="panel-title">今日调用趋势（按小时）</span>
          <el-radio-group v-model="trendType" size="small">
            <el-radio-button label="calls">调用量</el-radio-button>
            <el-radio-button label="tokens">Token</el-radio-button>
          </el-radio-group>
        </div>
        <div class="bar-chart">
          <div
            v-for="(v, i) in trendData"
            :key="i"
            class="bar-col"
            :style="{ height: barH(v) + '%' }"
          >
            <span class="bar-val">{{ fmtShort(v) }}</span>
          </div>
        </div>
        <div class="bar-axis">
          <span>00时</span><span>06时</span><span>12时</span><span>18时</span><span>24时</span>
        </div>
      </div>

      <!-- 费用按业务线分布 -->
      <div class="panel wb-split-panel">
        <div class="panel-head">
          <span class="panel-title">今日费用占比 · 业务层</span>
          <el-button link type="primary" @click="$router.push('/llmAudit/usage')">详情</el-button>
        </div>
        <div class="hbar-list">
          <div v-for="item in workbench.costSplitByBusiness" :key="item.key" class="hbar-item">
            <div class="hbar-meta">
              <span>{{ item.name }}</span>
              <span>{{ item.value }}%</span>
            </div>
            <div class="hbar-track">
              <div class="hbar-fill" :style="{ width: item.value + '%', background: colorOf(item.key) }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：模型热度 + 告警 + 周对比 -->
    <div class="wb-row wb-row-2">
      <!-- 热门模型 -->
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">今日热门模型</span>
          <el-button link type="primary" @click="$router.push('/llmAudit/openRouter')">模型治理</el-button>
        </div>
        <el-table :data="workbench.hitModel" size="small">
          <el-table-column label="模型" prop="name" min-width="130" />
          <el-table-column label="调用量" width="90" align="right">
            <template #default="{ row }">{{ fmtNum(row.calls) }}</template>
          </el-table-column>
          <el-table-column label="今日费用(¥)" width="110" align="right">
            <template #default="{ row }">{{ row.cost }}</template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 实时告警 -->
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">待关注告警</span>
          <el-button link type="primary">全部</el-button>
        </div>
        <div class="alert-list">
          <div v-for="(a, i) in workbench.alerts" :key="i" class="alert-item">
            <i :class="['dot', 'dot--' + a.level]"></i>
            <div class="alert-body">
              <p>{{ a.text }}</p>
              <span>{{ a.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近3周对比 -->
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">近3周调用对比</span>
          <el-button link type="primary" @click="$router.push('/llmAudit/usage')">趋势</el-button>
        </div>
        <div class="week-list">
          <div v-for="w in workbench.trendByWeek" :key="w.week" class="week-item">
            <span class="week-name">{{ w.week }}</span>
            <span class="week-calls">{{ fmtNum(w.calls) }} 次</span>
            <span class="week-cost">¥{{ fmtNum(w.cost) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { workbench, businessLines } from '../mock.js'

export default {
  name: 'llmAuditWorkbench',
  data() {
    return {
      workbench,
      businessLines,
      trendType: 'calls',
    }
  },
  computed: {
    trendData() {
      return this.trendType === 'calls' ? this.workbench.today.callTrend : this.workbench.today.tokenTrend
    },
    trendMax() {
      return Math.max(...this.trendData, 1)
    },
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    fmtShort(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
      if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
      return String(n)
    },
    barH(v) {
      return Math.max(6, Math.round((v / this.trendMax) * 100))
    },
    colorOf(key) {
      const b = this.businessLines.find((x) => x.key === key)
      return b ? b.color : '#5470c6'
    },
  },
}
</script>

<style scoped lang="scss">
.wb-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &-label {
    font-size: 13px;
    color: #86909c;
  }
  &-value {
    margin: 10px 0 6px;
    font-size: 28px;
    font-weight: 700;
    color: #1d2129;
    font-variant-numeric: tabular-nums;
    &.ok { color: #00b42a; }
  }
  &-foot {
    font-size: 12px;
    color: #86909c;
    &.up { color: #f53f3f; }
    &.warn { color: #ff7d00; }
  }
}
.wb-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}
.wb-row-2 {
  grid-template-columns: 1fr 1fr 1fr;
}
.panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  &-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
  }
}

/* 柱状图 */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 180px;
  padding: 6px 4px 0;
}
.bar-col {
  flex: 1;
  background: linear-gradient(180deg, #4f7cff, #6c5ce7);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 6px;
  transition: height 0.3s;
  &:hover { opacity: 0.85; }
}
.bar-val {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #86909c;
  white-space: nowrap;
}
.bar-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #c9cdd4;
}

/* 横向条形 */
.hbar-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hbar-item {
  .hbar-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #4e5969;
    margin-bottom: 6px;
  }
  .hbar-track {
    height: 8px;
    border-radius: 4px;
    background: #f2f3f5;
    overflow: hidden;
  }
  .hbar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }
}

/* 告警列表 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.alert-item {
  display: flex;
  gap: 10px;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;
    &--warning { background: #ff7d00; }
    &--danger { background: #f53f3f; }
    &--info { background: #165dff; }
  }
  .alert-body {
    p {
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
      margin: 0;
    }
    span {
      font-size: 11px;
      color: #c9cdd4;
    }
  }
}

/* 周对比 */
.week-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.week-item {
  display: flex;
  align-items: center;
  gap: 8px;
  .week-name { width: 110px; font-size: 12px; color: #4e5969; flex-shrink: 0; }
  .week-calls { flex: 1; font-size: 13px; color: #1d2129; font-weight: 600; }
  .week-cost { font-size: 12px; color: #ff7d00; }
}
</style>