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
        <div class="stat-card-label">今日预估费用(¥)</div>
        <div class="stat-card-value">{{ workbench.today.todayCost.toFixed(2) }}</div>
        <div class="stat-card-foot warn">已达日预算 59%</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">今日成功率</div>
        <div class="stat-card-value ok">{{ workbench.today.successRate }}%</div>
        <div class="stat-card-foot">P95延迟 1.2s</div>
      </div>
    </div>

    <!-- 监控指标卡片 -->
    <div class="monitor-grid">
      <!-- 稳定性指标 -->
      <div class="monitor-card">
        <div class="monitor-card-header">
          <div class="monitor-card-title">稳定性指标</div>
          <div class="monitor-card-status">
            <el-tag type="success" size="small">正常</el-tag>
          </div>
        </div>
        <div class="monitor-grid-content">
          <div class="monitor-item">
            <div class="monitor-label">成功率</div>
            <div class="monitor-value">{{ workbench.monitor.stability.successRate }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">重试率</div>
            <div class="monitor-value">{{ workbench.monitor.stability.retryRate }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">降级率</div>
            <div class="monitor-value">{{ workbench.monitor.stability.fallbackRate }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">错误率</div>
            <div class="monitor-value">{{ workbench.monitor.stability.errorRate }}%</div>
          </div>
          <div class="monitor-latency">
            <div class="monitor-latency-item">
              <div class="monitor-label">P50延迟</div>
              <div class="monitor-value">{{ workbench.monitor.stability.p50Latency }}ms</div>
            </div>
            <div class="monitor-latency-item">
              <div class="monitor-label">P95延迟</div>
              <div class="monitor-value">{{ workbench.monitor.stability.p95Latency }}ms</div>
            </div>
            <div class="monitor-latency-item">
              <div class="monitor-label">P99延迟</div>
              <div class="monitor-value">{{ workbench.monitor.stability.p99Latency }}ms</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 路由合规性 -->
      <div class="monitor-card">
        <div class="monitor-card-header">
          <div class="monitor-card-title">路由合规性</div>
          <div class="monitor-card-status">
            <el-tag type="success" size="small">合规</el-tag>
          </div>
        </div>
        <div class="monitor-grid-content">
          <div class="monitor-item">
            <div class="monitor-label">总调用量</div>
            <div class="monitor-value">{{ fmtNum(workbench.monitor.routing.totalCalls) }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">合规调用量</div>
            <div class="monitor-value">{{ fmtNum(workbench.monitor.routing.compliantCalls) }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">合规率</div>
            <div class="monitor-value">{{ workbench.monitor.routing.complianceRate }}%</div>
          </div>
          <div class="monitor-violations" v-if="workbench.monitor.routing.violatedRoutes.length > 0">
            <div class="monitor-label">违规路由</div>
            <div class="violation-list">
              <div v-for="violation in workbench.monitor.routing.violatedRoutes" :key="violation.route" class="violation-item">
                <div class="violation-route">{{ violation.route }}</div>
                <div class="violation-info">{{ violation.violation }} ({{ violation.count }}次)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输出质量 -->
      <div class="monitor-card">
        <div class="monitor-card-header">
          <div class="monitor-card-title">输出质量</div>
          <div class="monitor-card-status">
            <el-tag type="success" size="small">良好</el-tag>
          </div>
        </div>
        <div class="monitor-grid-content">
          <div class="monitor-item">
            <div class="monitor-label">平均评分</div>
            <div class="monitor-value">{{ workbench.monitor.quality.avgScore }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">满意度</div>
            <div class="monitor-value">{{ workbench.monitor.quality.satisfaction }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">连贯性</div>
            <div class="monitor-value">{{ workbench.monitor.quality.coherence }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">准确性</div>
            <div class="monitor-value">{{ workbench.monitor.quality.accuracy }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">相关性</div>
            <div class="monitor-value">{{ workbench.monitor.quality.relevance }}%</div>
          </div>
        </div>
      </div>

      <!-- 实时监控 -->
      <div class="monitor-card">
        <div class="monitor-card-header">
          <div class="monitor-card-title">实时监控</div>
          <div class="monitor-card-status">
            <el-tag type="info" size="small">运行中</el-tag>
          </div>
        </div>
        <div class="monitor-grid-content">
          <div class="monitor-item">
            <div class="monitor-label">当前调用量</div>
            <div class="monitor-value">{{ workbench.monitor.realtime.currentCalls }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">活跃用户</div>
            <div class="monitor-value">{{ workbench.monitor.realtime.activeUsers }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">队列深度</div>
            <div class="monitor-value">{{ workbench.monitor.realtime.queueDepth }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">系统负载</div>
            <div class="monitor-value">{{ (workbench.monitor.realtime.systemLoad * 100).toFixed(0) }}%</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">缓存命中率</div>
            <div class="monitor-value">{{ workbench.monitor.realtime.cacheHitRate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中部：趋势分析 -->
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

      <!-- 趋势分析 -->
      <div class="panel wb-trend-analysis">
        <div class="panel-head">
          <span class="panel-title">趋势分析</span>
          <el-radio-group v-model="analysisType" size="small">
            <el-radio-button label="latency">延迟趋势</el-radio-button>
            <el-radio-button label="success">成功率</el-radio-button>
            <el-radio-button label="errors">错误趋势</el-radio-button>
          </el-radio-group>
        </div>
        <div class="trend-chart">
          <div class="trend-line" v-if="analysisType === 'latency'">
            <div class="trend-point" v-for="(v, i) in workbench.monitor.trends.latency" :key="i" :style="{ left: (i * 16.67) + '%', bottom: (v / 15 * 100) + '%' }"></div>
          </div>
          <div class="trend-line" v-if="analysisType === 'success'">
            <div class="trend-point" v-for="(v, i) in workbench.monitor.trends.success" :key="i" :style="{ left: (i * 16.67) + '%', bottom: ((100 - v) / 15 * 100) + '%' }"></div>
          </div>
          <div class="trend-line" v-if="analysisType === 'errors'">
            <div class="trend-point" v-for="(v, i) in workbench.monitor.trends.errors" :key="i" :style="{ left: (i * 16.67) + '%', bottom: (v / 15 * 100) + '%' }"></div>
          </div>
        </div>
        <div class="trend-axis">
          <span>7天前</span><span>5天前</span><span>3天前</span><span>今天</span>
        </div>
      </div>
    </div>

    <!-- 底部：告警 + 周对比 -->
    <div class="wb-row wb-row-2">
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
      analysisType: 'latency',
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

/* 监控指标网格 */
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.monitor-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &-header {
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
  &-status {
    font-size: 12px;
  }
}
.monitor-grid-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.monitor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .monitor-label {
    font-size: 12px;
    color: #86909c;
  }
  .monitor-value {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }
}
.monitor-latency {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  .monitor-latency-item {
    flex: 1;
    .monitor-label {
      font-size: 11px;
      color: #86909c;
      margin-bottom: 4px;
    }
    .monitor-value {
      font-size: 14px;
      font-weight: 600;
      color: #1d2129;
    }
  }
}
.monitor-violations {
  .monitor-label {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 8px;
  }
  .violation-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .violation-item {
    padding: 6px 8px;
    background: #f7f8fa;
    border-radius: 4px;
    border-left: 3px solid #ff7d00;
  }
  .violation-route {
    font-size: 12px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 2px;
  }
  .violation-info {
    font-size: 11px;
    color: #86909c;
  }
}

/* 趋势分析 */
.wb-trend-analysis {
  .trend-chart {
    height: 180px;
    position: relative;
    background: linear-gradient(180deg, #f7f8fa 0%, #f2f3f5 100%);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .trend-line {
    position: relative;
    height: 100%;
    display: flex;
    align-items: flex-end;
  }
  .trend-point {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4f7cff;
    transform: translateX(-50%);
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg, #4f7cff 0%, rgba(79, 124, 255, 0.3) 100%);
    }
  }
  .trend-axis {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #c9cdd4;
  }
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