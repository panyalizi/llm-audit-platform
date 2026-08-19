<template>
  <div class="logs-page">
    <!-- 检索区 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">请求ID</span>
          <el-input v-model="filters.requestId" placeholder="req_xxx" clearable size="small" />
        </div>
        <div class="filter-item">
          <span class="filter-label">业务线</span>
          <el-select v-model="filters.businessId" placeholder="全部" clearable size="small">
            <el-option v-for="b in businessLines" :key="b.key" :label="b.name" :value="b.key" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">归属产品</span>
          <el-select v-model="filters.productId" placeholder="全部" clearable size="small">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">模型</span>
          <el-select v-model="filters.modelKey" placeholder="全部" clearable size="small">
            <el-option v-for="m in models" :key="m.key" :label="m.name" :value="m.key" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select v-model="filters.status" placeholder="全部" clearable size="small">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="限流" value="rate_limited" />
          </el-select>
        </div>
        <div class="filter-item filter-item--date">
          <span class="filter-label">时间</span>
          <el-date-picker v-model="filters.date" type="date" size="small" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </div>
        <div class="filter-actions">
          <el-button size="small" @click="resetFilters">重置</el-button>
          <el-button size="small" type="primary" @click="applyFilters">查询</el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="panel">
      <div class="table-toolbar">
        <span>共 <strong>{{ pagedList.length }}</strong> 条记录</span>
        <span class="toolbar-note">明细受角色脱敏限制，内容默认打码</span>
      </div>
      <el-table :data="pagedList" stripe v-loading="loading">
        <el-table-column label="时间" width="90">
          <template #default="{ row }">{{ row.time }}</template>
        </el-table-column>
        <el-table-column label="业务" width="90">
          <template #default="{ row }">
            <span class="biz-tag" :style="{ background: colorOf(row.businessId) + '1a', color: colorOf(row.businessId) }">{{ row.businessName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="归属产品" min-width="110" show-overflow-tooltip />
        <el-table-column prop="callerProductId" label="调用产品" min-width="150" show-overflow-tooltip />
        <el-table-column label="模型" min-width="150">
          <template #default="{ row }">
            <span>{{ row.model }}</span>
            <el-tag v-if="row.series === 'Pro'" type="danger" size="small" effect="plain">Pro</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Token" width="90" align="right">
          <template #default="{ row }">{{ fmtNum(row.totalTokens) }}</template>
        </el-table-column>
        <el-table-column label="费用(¥)" width="90" align="right">
          <template #default="{ row }">{{ row.cost }}</template>
        </el-table-column>
        <el-table-column label="延迟" width="90" align="right">
          <template #default="{ row }">{{ row.latencyMs }}ms</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'" size="small">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="logs-pager"
        layout="prev, pager, next, total"
        :total="filteredList.length"
        :page-size="pageSize"
        v-model:current-page="page"
      />
    </div>

    <!-- 审计JSON详情 -->
    <el-drawer v-model="detailVisible" title="调用审计详情" size="560px">
      <template v-if="current">
        <div class="detail-sec">
          <div class="detail-title">基本信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="请求ID">{{ current.requestId }}</el-descriptions-item>
            <el-descriptions-item label="TraceID">{{ current.traceId }}</el-descriptions-item>
            <el-descriptions-item label="租户">{{ current.tenantId }}</el-descriptions-item>
            <el-descriptions-item label="时间">{{ current.date }} {{ current.time }}</el-descriptions-item>
            <el-descriptions-item label="业务">{{ current.businessName }}</el-descriptions-item>
            <el-descriptions-item label="归属产品">{{ current.productName }}</el-descriptions-item>
            <el-descriptions-item label="调用产品" :span="2">{{ current.callerProductId }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-sec">
          <div class="detail-title">技术信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="服务商">{{ current.provider }}</el-descriptions-item>
            <el-descriptions-item label="模型">{{ current.model }}</el-descriptions-item>
            <el-descriptions-item label="API类型">{{ current.apiType }}</el-descriptions-item>
            <el-descriptions-item label="延迟">{{ current.latencyMs }}ms</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="current.status === 'success' ? 'success' : 'danger'" size="small">{{ current.statusText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="费用">¥{{ current.cost }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-sec">
          <div class="detail-title">Token 用量</div>
          <el-progress :percentage="Math.round(current.inputTokens / current.totalTokens * 100)" :format="() => `输入 ${fmtNum(current.inputTokens)}`" :stroke-width="14" status="success" />
          <el-progress style="margin-top:10px" :percentage="Math.round(current.outputTokens / current.totalTokens * 100)" :format="() => `输出 ${fmtNum(current.outputTokens)}`" :stroke-width="14" status="warning" />
        </div>

        <div class="detail-sec">
          <div class="detail-title">输入内容（已脱敏）</div>
          <pre class="detail-code">{{ current.prompt }}</pre>
        </div>

        <div class="detail-sec">
          <div class="detail-title">输出内容（已脱敏）</div>
          <pre class="detail-code">{{ current.output }}</pre>
        </div>

        <div class="detail-sec" v-if="current.errorInfo">
          <div class="detail-title">错误信息</div>
          <pre class="detail-code detail-code--err">{{ JSON.stringify(current.errorInfo, null, 2) }}</pre>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { callLogs, businessLines, products, models } from '../mock.js'

export default {
  name: 'llmAuditLogs',
  data() {
    return {
      all: callLogs,
      businessLines,
      products,
      models,
      loading: false,
      page: 1,
      pageSize: 10,
      filters: { requestId: '', businessId: '', productId: '', modelKey: '', status: '', date: '' },
      cachedFilters: null,
      detailVisible: false,
      current: null,
    }
  },
  computed: {
    filteredList() {
      return this.all.filter((r) => this.pass(r))
    },
    pagedList() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredList.slice(start, start + this.pageSize)
    },
  },
  methods: {
    pass(row) {
      const f = this.filters
      if (f.requestId && !row.requestId.includes(f.requestId)) return false
      if (f.businessId && row.businessId !== f.businessId) return false
      if (f.productId && row.productId !== f.productId) return false
      if (f.modelKey && row.modelKey !== f.modelKey) return false
      if (f.status && row.status !== f.status) return false
      if (f.date && row.date !== f.date) return false
      return true
    },
    applyFilters() {
      this.page = 1
      this.loading = true
      setTimeout(() => (this.loading = false), 300)
    },
    resetFilters() {
      this.filters = { requestId: '', businessId: '', productId: '', modelKey: '', status: '', date: '' }
      this.page = 1
    },
    openDetail(row) {
      this.current = row
      this.detailVisible = true
    },
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    colorOf(key) {
      const b = this.businessLines.find((x) => x.key === key)
      return b ? b.color : '#5470c6'
    },
  },
}
</script>

<style scoped lang="scss">
.logs-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  .filter-label {
    font-size: 12px;
    color: #4e5969;
    flex-shrink: 0;
  }
}
.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #4e5969;
  .toolbar-note { font-size: 12px; color: #c9cdd4; }
}
.logs-pager {
  margin-top: 14px;
  justify-content: flex-end;
}
.biz-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.detail-sec {
  margin-bottom: 16px;
  .detail-title {
    font-size: 13px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 8px;
    border-left: 3px solid #165dff;
    padding-left: 8px;
  }
  .detail-code {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    &--err {
      background: #fef3f3;
      color: #f53f3f;
    }
  }
}
</style>