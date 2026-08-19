<template>
  <div class="or-page">
    <!-- 健康度卡片 -->
    <div class="or-health-grid">
      <div
        v-for="p in providers"
        :key="p.key"
        class="or-health-card"
        :class="`level-${healthLevel(p.key)}`"
      >
        <div class="ohc-head">
          <span class="ohc-name" :style="{ color: p.color }">● {{ p.name }}</span>
          <el-tag size="small" :type="healthLevel(p.key) === 'good' ? 'success' : healthLevel(p.key) === 'warn' ? 'warning' : 'danger'">
            {{ healthText(p.key) }}
          </el-tag>
        </div>
        <div class="ohc-metrics">
          <div class="ohc-m"><span>延迟</span><b>{{ p.latency }}ms</b></div>
          <div class="ohc-m"><span>成功率</span><b>{{ p.successRate }}%</b></div>
          <div class="ohc-m"><span>调用量</span><b>{{ fmtNum(p.calls) }}</b></div>
        </div>
      </div>
    </div>

    <!-- 路由策略 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">路由与降级策略</span>
        <el-button size="small" type="primary" plain @click="saveStrategy">保存策略</el-button>
      </div>

      <div class="strategy-config">
        <div class="sc-item">
          <span class="sc-label">路由策略</span>
          <el-radio-group v-model="strategy.mode" size="small">
            <el-radio-button label="cost_first">成本优先</el-radio-button>
            <el-radio-button label="quality_first">质量优先</el-radio-button>
            <el-radio-button label="balance">均衡</el-radio-button>
          </el-radio-group>
        </div>
        <div class="sc-item">
          <span class="sc-label">主模型</span>
          <el-select v-model="strategy.primary" size="small" style="width: 220px">
            <el-option v-for="m in models" :key="m.key" :label="m.name" :value="m.key" />
          </el-select>
        </div>
        <div class="sc-item">
          <span class="sc-label">失败降级链路</span>
          <div class="fallback-chain">
            <div v-for="(fb, i) in strategy.fallback" :key="fb.key" class="fb-node">
              <el-select v-model="fb.key" size="small" style="width: 170px">
                <el-option v-for="m in models" :key="m.key" :label="m.name" :value="m.key" />
              </el-select>
              <i v-if="i < strategy.fallback.length - 1" class="fb-arrow">→</i>
            </div>
          </div>
        </div>
        <div class="sc-item">
          <span class="sc-label">降级触发条件</span>
          <div class="sc-conditions">
            <el-checkbox v-model="strategy.onRateLimit" size="small">厂商限流</el-checkbox>
            <el-checkbox v-model="strategy.onError" size="small">厂商报错</el-checkbox>
            <el-checkbox v-model="strategy.onBudget" size="small">预算超80%</el-checkbox>
            <el-checkbox v-model="strategy.onLatency" size="small">延迟>5s</el-checkbox>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型性价比表 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">模型性价比对比（同任务：『客服意图识别』）</span>
        <span class="panel-sub">基于近7日真实调用统计</span>
      </div>
      <el-table :data="modelStats" stripe>
        <el-table-column prop="name" label="模型" min-width="150" />
        <el-table-column prop="providerName" label="服务商" width="110" />
        <el-table-column label="系列" width="80">
          <template #default="{ row }">
            <el-tag :type="row.series === 'Pro' ? 'danger' : 'success'" size="small">{{ row.series }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="单价(¥/1k tok)" width="120" align="right">
          <template #default="{ row }">进{{ row.priceIn }} 出{{ row.priceOut }}</template>
        </el-table-column>
        <el-table-column prop="avgLatency" label="延迟(ms)" sortable align="right" width="100" />
        <el-table-column prop="successRate" label="成功率" sortable align="right" width="100">
          <template #default="{ row }">{{ row.successRate }}%</template>
        </el-table-column>
        <el-table-column label="单位成效成本" width="140" align="right" sortable :sort-method="(a,b)=>a.cost/a.calls-b.cost/b.calls">
          <template #default="{ row }">¥{{ (row.cost / row.calls).toFixed(3) }}/次</template>
        </el-table-column>
        <el-table-column label="推荐" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.series === 'Flash'" type="success" size="small" effect="plain">通用推荐</el-tag>
            <el-tag v-else type="warning" size="small" effect="plain">复杂场景</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { providers, models, modelStats } from '../mock.js'

const healthMap = {}

export default {
  name: 'llmAuditOpenRouter',
  data() {
    return {
      providers: providers.map((p, i) => ({
        ...p,
        latency: [480, 620, 410, 580, 720, 890, 360][i % 7],
        successRate: [99.6, 99.2, 99.8, 99.4, 99.1, 99.5, 99.7][i % 7],
        calls: 2000 + i * 310,
      })),
      models,
      modelStats,
      strategy: {
        mode: 'cost_first',
        primary: 'doubao-lite',
        fallback: [
          { key: 'deepseek-chat' },
          { key: 'qwen-plus' },
          { key: 'ernie-speed' },
        ],
        onRateLimit: true,
        onError: true,
        onBudget: true,
        onLatency: false,
      },
    }
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    healthLevel(key) {
      const p = this.providers.find((x) => x.key === key)
      if (p.successRate >= 99.5 && p.latency < 600) return 'good'
      if (p.successRate >= 98.5) return 'warn'
      return 'bad'
    },
    healthText(key) {
      const map = { good: '健康', warn: '需关注', bad: '异常' }
      return map[this.healthLevel(key)]
    },
    saveStrategy() {
      this.$message.success('路由策略已保存并灰度生效')
    },
  },
}
</script>

<style scoped lang="scss">
.or-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.or-health-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.or-health-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-top: 3px solid transparent;
  &.level-good { border-top-color: #00b42a; }
  &.level-warn { border-top-color: #ff7d00; }
  &.level-bad { border-top-color: #f53f3f; }
  .ohc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .ohc-name { font-size: 14px; font-weight: 600; }
  }
  .ohc-metrics {
    display: flex;
    gap: 16px;
    .ohc-m {
      span { display: block; font-size: 11px; color: #86909c; }
      b { font-size: 15px; color: #1d2129; }
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
    margin-bottom: 16px;
    .panel-title { font-size: 14px; font-weight: 600; color: #1d2129; }
    .panel-sub { font-size: 12px; color: #c9cdd4; }
  }
}
.strategy-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  .sc-label {
    width: 90px;
    flex-shrink: 0;
    font-size: 13px;
    color: #4e5969;
  }
}
.fallback-chain {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  .fb-node {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .fb-arrow { color: #c9cdd4; }
}
.sc-conditions {
  display: flex;
  gap: 16px;
}
</style>