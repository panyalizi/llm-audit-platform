<template>
  <div class="usage-page">
    <!-- 维度切换 -->
    <div class="usage-tabs">
      <div
        v-for="t in tabs"
        :key="t.key"
        class="usage-tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </div>
      <div class="usage-tabs-right">
        <el-date-picker v-model="dateRange" type="daterange" size="small" range-separator="~"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </div>
    </div>

    <!-- 公司级统计 -->
    <template v-if="activeTab === 'company'">
      <div class="stat-grid">
        <div class="stat-card"><div class="sc-label">接入公司数</div><div class="sc-value">{{ companyStats.length }}</div></div>
        <div class="stat-card"><div class="sc-label">产品总数</div><div class="sc-value">{{ allProductCount }}</div></div>
        <div class="stat-card"><div class="sc-label">总调用量</div><div class="sc-value">{{ fmtNum(companyTotal.calls) }}</div></div>
        <div class="stat-card"><div class="sc-label">总费用(¥)</div><div class="sc-value">{{ fmtNum(companyTotal.cost) }}</div></div>
      </div>

      <!-- 公司/产品 维度切换 -->
      <div class="dim-tabs">
        <div
          :class="['dim-tab', { active: dimMode === 'company' }]"
          @click="dimMode = 'company'"
        >按公司 / 租户 TOP</div>
        <div
          :class="['dim-tab', { active: dimMode === 'product' }]"
          @click="dimMode = 'product'"
        >按产品 TOP</div>
      </div>

      <!-- ============ 按公司/租户 TOP：公司 → 内嵌产品 ============ -->
      <div v-if="dimMode === 'company'" class="company-top-card">
        <div class="ctc-head">
          <span class="ctc-title">🏆 公司调用 TOP 排行</span>
          <span class="ctc-sub">公司 / 租户维度 · 点击展开查看公司内各产品调用</span>
        </div>
        <div class="company-top-list">
          <div
            v-for="(c, idx) in companyStats"
            :key="c.companyId"
            class="company-top-item"
            :class="{ 'top-1': idx === 0, 'top-2': idx === 1, 'top-3': idx === 2 }"
            @click="toggleCompany(c.companyId)"
          >
            <span class="cti-rank">{{ idx + 1 }}</span>
            <span class="cti-name">{{ c.companyName }}</span>
            <span class="cti-tenant">{{ c.companyId }}</span>
            <span class="cti-calls">{{ fmtNum(c.calls) }} 次 · {{ c.children.length }}个产品</span>
            <span class="cti-cost">¥{{ fmtNum(c.cost) }}</span>
            <span class="cti-progress"><div class="cti-fill" :style="{ width: percent(c.cost, companyTotal.cost) + '%' }"></div></span>
            <i class="cti-arrow" :class="{ open: expandedCompany === c.companyId }">▾</i>
          </div>
        </div>

        <!-- 展开的公司内产品明细 -->
        <div v-if="expandedCompany" class="company-detail">
          <div class="company-detail-title">
            {{ currentCompany?.companyName }}（{{ expandedCompany }}）· 公司内各产品调用
          </div>
          <el-table :data="currentCompany?.children || []" size="small" stripe>
            <el-table-column prop="productName" label="产品" min-width="140" />
            <el-table-column prop="businessKey" label="业务线" width="100">
              <template #default="{ row }">{{ businessName(row.businessKey) }}</template>
            </el-table-column>
            <el-table-column prop="calls" label="调用量" sortable align="right">
              <template #default="{ row }">{{ fmtNum(row.calls) }}</template>
            </el-table-column>
            <el-table-column prop="tokens" label="Token" sortable align="right">
              <template #default="{ row }">{{ fmtNum(row.tokens) }}</template>
            </el-table-column>
            <el-table-column prop="cost" label="费用(¥)" sortable align="right">
              <template #default="{ row }">¥{{ row.cost }}</template>
            </el-table-column>
            <el-table-column prop="successRate" label="成功率" sortable align="right">
              <template #default="{ row }">{{ row.successRate }}%</template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- ============ 按产品 TOP：产品 → 内嵌公司用量 ============ -->
      <div v-else class="company-top-card">
        <div class="ctc-head">
          <span class="ctc-title">🏆 产品调用 TOP 排行</span>
          <span class="ctc-sub">产品维度 · 点击展开查看使用该产品的各公司用量</span>
        </div>
        <div class="company-top-list">
          <div
            v-for="(p, idx) in productTop"
            :key="p.productId"
            class="company-top-item"
            :class="{ 'top-1': idx === 0, 'top-2': idx === 1, 'top-3': idx === 2 }"
            @click="toggleProduct(p.productId)"
          >
            <span class="cti-rank">{{ idx + 1 }}</span>
            <span class="cti-name">{{ p.productName }}</span>
            <span class="cti-tenant">{{ p.businessName }}</span>
            <span class="cti-calls">{{ fmtNum(p.calls) }} 次 · {{ p.companyCount }}家公司</span>
            <span class="cti-cost">¥{{ fmtNum(p.cost) }}</span>
            <span class="cti-progress"><div class="cti-fill" :style="{ width: percent(p.cost, productTotal.cost) + '%' }"></div></span>
            <i class="cti-arrow" :class="{ open: expandedProduct === p.productId }">▾</i>
          </div>
        </div>

        <!-- 展开的产品内公司用量 -->
        <div v-if="expandedProduct" class="company-detail">
          <div class="company-detail-title">
            {{ currentProduct?.productName }} · 使用该产品的公司用量
          </div>
          <el-table :data="currentProduct ? currentProduct.companies : []" size="small" stripe>
            <el-table-column prop="companyName" label="公司 / 租户" min-width="160" />
            <el-table-column prop="calls" label="调用量" sortable align="right">
              <template #default="{ row }">{{ fmtNum(row.calls) }}</template>
            </el-table-column>
            <el-table-column prop="tokens" label="Token" sortable align="right">
              <template #default="{ row }">{{ fmtNum(row.tokens) }}</template>
            </el-table-column>
            <el-table-column prop="cost" label="费用(¥)" sortable align="right">
              <template #default="{ row }">¥{{ row.cost }}</template>
            </el-table-column>
            <el-table-column label="占该产品比例" min-width="160">
              <template #default="{ row }">
                <div class="mini-track"><div class="mini-fill" :style="{ width: percent(row.cost, productTotal.cost) + '%' }"></div></div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 业务层统计 -->
    <template v-if="activeTab === 'business'">
      <div class="stat-grid">
        <div class="stat-card"><div class="sc-label">业务线数</div><div class="sc-value">{{ businessLineCount }}</div></div>
        <div class="stat-card"><div class="sc-label">归属产品数</div><div class="sc-value">{{ businessStats.length + 2 }}</div></div>
        <div class="stat-card"><div class="sc-label">总调用量</div><div class="sc-value">{{ fmtNum(businessTotal.calls) }}</div></div>
        <div class="stat-card"><div class="sc-label">总费用(¥)</div><div class="sc-value">{{ fmtNum(businessTotal.cost) }}</div></div>
      </div>
      <div class="panel">
        <el-table :data="businessStats" stripe>
          <el-table-column label="业务线" min-width="120">
            <template #default="{ row }">
              <span class="biz-tag" :style="{ background: colorOf(row.key) + '1a', color: colorOf(row.key) }">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="费用(¥)" sortable align="right">
            <template #default="{ row }">¥{{ row.cost }}</template>
          </el-table-column>
          <el-table-column prop="calls" label="调用量" sortable align="right" />
          <el-table-column prop="tokens" label="Token" sortable align="right" />
          <el-table-column prop="successRate" label="成功率" sortable align="right">
            <template #default="{ row }">{{ row.successRate }}%</template>
          </el-table-column>
          <el-table-column prop="avgLatency" label="平均延迟(ms)" sortable align="right">
            <template #default="{ row }">{{ row.avgLatency }}</template>
          </el-table-column>
          <el-table-column label="成本占比" min-width="140">
            <template #default="{ row }">
              <div class="mini-track">
                <div class="mini-fill" :style="{ width: percent(row.cost, businessTotal.cost) + '%', background: colorOf(row.key) }"></div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 技术层-服务商 -->
    <template v-else-if="activeTab === 'provider'">
      <div class="stat-grid">
        <div class="stat-card"><div class="sc-label">服务商数</div><div class="sc-value">{{ providerStats.length }}</div></div>
        <div class="stat-card"><div class="sc-label">总调用量</div><div class="sc-value">{{ fmtNum(providerTotal.calls) }}</div></div>
        <div class="stat-card"><div class="sc-label">总Token</div><div class="sc-value">{{ fmtNum(providerTotal.tokens) }}</div></div>
        <div class="stat-card"><div class="sc-label">总费用(¥)</div><div class="sc-value">{{ fmtNum(providerTotal.cost) }}</div></div>
      </div>
      <div class="panel">
        <el-table :data="providerStats" stripe>
          <el-table-column label="大模型公司" min-width="140">
            <template #default="{ row }">
              <span class="p-tag">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="calls" label="调用量" sortable align="right" />
          <el-table-column prop="tokens" label="Token" sortable align="right" />
          <el-table-column prop="cost" label="费用(¥)" sortable align="right">
            <template #default="{ row }">¥{{ row.cost }}</template>
          </el-table-column>
          <el-table-column prop="successRate" label="成功率" sortable align="right">
            <template #default="{ row }">{{ row.successRate }}%</template>
          </el-table-column>
          <el-table-column prop="avgLatency" label="平均延迟(ms)" sortable align="right">
            <template #default="{ row }">{{ row.avgLatency }}</template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 技术层-模型 -->
    <template v-else-if="activeTab === 'model'">
      <div class="stat-grid">
        <div class="stat-card"><div class="sc-label">模型数</div><div class="sc-value">{{ modelStats.length }}</div></div>
        <div class="stat-card"><div class="sc-label">Pro系列费用占比</div><div class="sc-value">{{ proCostPercent }}%</div></div>
        <div class="stat-card"><div class="sc-label">Flash系列费用占比</div><div class="sc-value">{{ flashCostPercent }}%</div></div>
        <div class="stat-card"><div class="sc-label">平均选型成本(¥/1k tok)</div><div class="sc-value">{{ modelAvgCost }}</div></div>
      </div>
      <div class="panel">
        <el-table :data="modelStats" stripe>
          <el-table-column label="模型" min-width="160" prop="name" />
          <el-table-column label="服务商" width="110" prop="providerName" />
          <el-table-column label="系列" width="80">
            <template #default="{ row }">
              <el-tag :type="row.series === 'Pro' ? 'danger' : 'success'" size="small">{{ row.series }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="价格 (¥/1k)" width="130" align="right">
            <template #default="{ row }">进{{ row.priceIn }} / 出{{ row.priceOut }}</template>
          </el-table-column>
          <el-table-column prop="calls" label="调用量" sortable align="right" />
          <el-table-column prop="tokens" label="Token" sortable align="right" />
          <el-table-column prop="cost" label="费用(¥)" sortable align="right">
            <template #default="{ row }">¥{{ row.cost }}</template>
          </el-table-column>
          <el-table-column prop="successRate" label="成功率" sortable align="right">
            <template #default="{ row }">{{ row.successRate }}%</template>
          </el-table-column>
          <el-table-column prop="avgLatency" label="延迟(ms)" sortable align="right" width="100">
            <template #default="{ row }">{{ row.avgLatency }}</template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 技术层-API -->
    <template v-else-if="activeTab === 'api'">
      <div class="stat-grid">
        <div class="stat-card"><div class="sc-label">API类型数</div><div class="sc-value">{{ apiStats.length }}</div></div>
        <div class="stat-card"><div class="sc-label">总调用量</div><div class="sc-value">{{ fmtNum(apiTotal.calls) }}</div></div>
        <div class="stat-card"><div class="sc-label">总Token</div><div class="sc-value">{{ fmtNum(apiTotal.tokens) }}</div></div>
        <div class="stat-card"><div class="sc-label">总费用(¥)</div><div class="sc-value">{{ fmtNum(apiTotal.cost) }}</div></div>
      </div>
      <div class="panel">
        <el-table :data="apiStats" stripe>
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="name" label="API 类型" min-width="200" />
          <el-table-column prop="calls" label="调用量" sortable align="right" />
          <el-table-column prop="tokens" label="Token" sortable align="right" />
          <el-table-column prop="cost" label="费用(¥)" sortable align="right">
            <template #default="{ row }">¥{{ row.cost }}</template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script>
import { businessStats, providerStats, modelStats, apiStats, businessLines, companyStats } from '../mock.js'

export default {
  name: 'llmAuditUsage',
  data() {
    return {
      activeTab: 'company',
      dateRange: null,
      expandedCompany: '',
      expandedProduct: '',
      dimMode: 'company',
      tabs: [
        { key: 'company', label: '公司级' },
        { key: 'business', label: '业务层统计' },
        { key: 'provider', label: '技术层 · 大模型公司' },
        { key: 'model', label: '技术层 · 模型' },
        { key: 'api', label: '技术层 · API' },
      ],
      businessStats,
      providerStats,
      modelStats,
      apiStats,
      businessLines,
      companyStats,
    }
  },
  computed: {
    companyTotal() {
      return this.companyStats.reduce((acc, x) => ({ calls: acc.calls + x.calls, tokens: acc.tokens + x.tokens, cost: acc.cost + x.cost }), { calls: 0, tokens: 0, cost: 0 })
    },
    currentCompany() {
      return this.companyStats.find((c) => c.companyId === this.expandedCompany) || null
    },
    allProductCount() {
      const set = new Set()
      this.companyStats.forEach((c) => c.children.forEach((p) => set.add(p.productName)))
      return set.size
    },
    productTop() {
      // 将各公司 children 聚合到产品维度，每个产品内嵌使用它的公司用量
      const map = {}
      this.companyStats.forEach((c) => {
        c.children.forEach((p) => {
          if (!map[p.productName]) {
            map[p.productName] = {
              productId: p.productId,
              productName: p.productName,
              businessKey: p.businessKey,
              calls: 0,
              tokens: 0,
              cost: 0,
              companies: [],
            }
          }
          map[p.productName].calls += p.calls
          map[p.productName].tokens += p.tokens
          map[p.productName].cost += p.cost
          map[p.productName].companies.push({
            companyId: c.companyId,
            companyName: c.companyName,
            calls: p.calls,
            tokens: p.tokens,
            cost: p.cost,
          })
        })
      })
      const list = Object.values(map)
      list.forEach((p) => {
        p.companyCount = p.companies.length
        p.businessName = this.businessName(p.businessKey)
        p.companies.sort((a, b) => b.cost - a.cost)
      })
      list.sort((a, b) => b.cost - a.cost)
      return list
    },
    productTotal() {
      return this.productTop.reduce((acc, x) => ({ calls: acc.calls + x.calls, cost: acc.cost + x.cost }), { calls: 0, cost: 0 })
    },
    currentProduct() {
      return this.productTop.find((p) => p.productId === this.expandedProduct) || null
    },
    businessLineCount() {
      return this.businessLines.length
    },
    businessTotal() {
      return this.businessStats.reduce((acc, x) => ({ calls: acc.calls + x.calls, cost: acc.cost + x.cost }), { calls: 0, cost: 0 })
    },
    providerTotal() {
      return this.providerStats.reduce((acc, x) => ({ calls: acc.calls + x.calls, tokens: acc.tokens + x.tokens, cost: acc.cost + x.cost }), { calls: 0, tokens: 0, cost: 0 })
    },
    apiTotal() {
      return this.apiStats.reduce((acc, x) => ({ calls: acc.calls + x.calls, tokens: acc.tokens + x.tokens, cost: acc.cost + x.cost }), { calls: 0, tokens: 0, cost: 0 })
    },
    proCostPercent() {
      const pro = this.modelStats.filter((m) => m.series === 'Pro').reduce((s, m) => s + m.cost, 0)
      return Math.round((pro / this.businessTotal.cost) * 100)
    },
    flashCostPercent() {
      return 100 - this.proCostPercent
    },
    modelAvgCost() {
      const total = this.modelStats.reduce((s, m) => s + (m.priceIn + m.priceOut) / 2, 0)
      return (total / this.modelStats.length).toFixed(2)
    },
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    percent(v, total) {
      if (!total) return 0
      return Math.min(100, Math.round((v / total) * 100))
    },
    colorOf(key) {
      const b = this.businessLines.find((x) => x.key === key)
      return b ? b.color : '#5470c6'
    },
    toggleCompany(id) {
      this.expandedCompany = this.expandedCompany === id ? '' : id
    },
    toggleProduct(id) {
      this.expandedProduct = this.expandedProduct === id ? '' : id
    },
    businessName(key) {
      const b = this.businessLines.find((x) => x.key === key)
      return b ? b.name : key
    },
  },
}
</script>

<style scoped lang="scss">
.usage-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.usage-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  &-right { margin-left: auto; }
  .usage-tab {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    color: #4e5969;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { color: #165dff; }
    &.active {
      background: #165dff;
      color: #fff;
      font-weight: 600;
    }
  }
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  .sc-label { font-size: 12px; color: #86909c; }
  .sc-value { font-size: 24px; font-weight: 700; color: #1d2129; margin-top: 8px; }
}
.panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.biz-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.p-tag {
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
}
.mini-fill {
  height: 100%;
  border-radius: 3px;
}

/* 维度切换(公司/产品) */
.dim-tabs {
  display: flex;
  gap: 10px;
  .dim-tab {
    padding: 7px 16px;
    border-radius: 6px;
    background: #fff;
    border: 1px solid #e5e6eb;
    font-size: 13px;
    color: #4e5969;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      border-color: #165dff;
      color: #165dff;
    }
    &.active {
      background: #165dff;
      border-color: #165dff;
      color: #fff;
      font-weight: 600;
    }
  }
}

/* 公司级 TOP */
.company-top-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  .ctc-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 12px;
    .ctc-title {
      font-size: 14px;
      font-weight: 600;
      color: #1d2129;
    }
    .ctc-sub {
      font-size: 12px;
      color: #86909c;
    }
  }
  .company-top-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .company-top-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f7f8fa;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    &:hover {
      background: #eef2ff;
    }
    &.top-1 {
      border-left-color: #f59e0b;
      background: linear-gradient(90deg, #fef3e2, #fff);
    }
    &.top-2 {
      border-left-color: #94a3b8;
    }
    &.top-3 {
      border-left-color: #c98a5e;
    }
    .cti-rank {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #e5e6eb;
      color: #86909c;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    &.top-1 .cti-rank {
      background: #f59e0b;
      color: #fff;
    }
    &.top-2 .cti-rank {
      background: #94a3b8;
      color: #fff;
    }
    &.top-3 .cti-rank {
      background: #c98a5e;
      color: #fff;
    }
    .cti-name {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #1d2129;
    }
    .cti-calls {
      font-size: 12px;
      color: #4e5969;
      min-width: 150px;
    }
    .cti-tenant {
      font-size: 11px;
      color: #c9cdd4;
      min-width: 80px;
    }
    .cti-cost {
      font-size: 12px;
      color: #ff7d00;
      font-weight: 600;
      min-width: 90px;
      text-align: right;
    }
    .cti-progress {
      width: 140px;
      height: 6px;
      border-radius: 3px;
      background: #e5e6eb;
      overflow: hidden;
      .cti-fill {
        height: 100%;
        border-radius: 3px;
        background: linear-gradient(90deg, #4f7cff, #6c5ce7);
      }
    }
    .cti-arrow {
      color: #c9cdd4;
      font-style: normal;
      transition: transform 0.2s;
      &.open {
        transform: rotate(180deg);
      }
    }
  }
  .company-detail {
    margin-top: 14px;
    border-top: 1px dashed #e5e6eb;
    padding-top: 12px;
    .company-detail-title {
      font-size: 13px;
      font-weight: 600;
      color: #165dff;
      margin-bottom: 10px;
    }
  }
}
</style>