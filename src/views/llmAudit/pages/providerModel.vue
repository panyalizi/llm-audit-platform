<template>
  <div class="pm-page">
    <div class="pm-hero">
      <div class="pm-hero-left">
        <div class="pm-hero-kicker">设计示例 · 平台级统一收口</div>
        <div class="pm-hero-title">供应商模型管理：一次接入，全平台复用</div>
        <div class="pm-hero-desc">
          供应商接入、模型注册、密钥托管、上下线审核统一在本页收口。
          <b>产品不再关心用哪家厂商、走什么协议</b>，只面向网关的模型列表。
        </div>
      </div>
      <div class="pm-hero-right">
        <div class="ah-metric"><b>密钥不外泄</b><span>厂商凭证锁在密钥库，客户端只拿产品 Key</span></div>
        <div class="ah-metric"><b>协议可适配</b><span>私有协议由网关适配层统一转换为 OpenAI 兼容</span></div>
      </div>
    </div>

    <div class="pm-tabs">
      <div
        v-for="t in tabs"
        :key="t.key"
        class="pm-tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </div>
    </div>

    <!-- ========== 总览 ========== -->
    <template v-if="activeTab === 'overview'">
      <div class="stat-grid">
        <div v-for="item in demo.stats" :key="item.label" class="stat-card">
          <div class="stat-card-label">{{ item.label }}</div>
          <div class="stat-card-value">{{ item.value }}</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">供应商健康度</span>
          <span class="panel-sub">成功率 ≥ 99.5% 且延迟 &lt; 600ms 为健康；余额低于阈值标黄</span>
        </div>
        <div class="pm-provider-grid">
          <div
            v-for="p in demo.providers"
            :key="p.key"
            class="pm-provider-card"
            :class="`pm-${p.status}`"
          >
            <div class="pm-pc-head">
              <span class="pm-pc-name" :style="{ color: p.color }">● {{ p.name }}</span>
              <el-tag size="small" :type="p.status === 'online' ? 'success' : 'warning'">
                {{ p.status === 'online' ? '健康' : '需关注' }}
              </el-tag>
            </div>
            <div class="pm-pc-metrics">
              <div class="pm-pc-m"><span>延迟</span><b>{{ p.latency }}ms</b></div>
              <div class="pm-pc-m"><span>成功率</span><b>{{ p.successRate }}%</b></div>
              <div class="pm-pc-m"><span>7日调用</span><b>{{ fmtNum(p.calls7d) }}</b></div>
            </div>
            <div class="pm-pc-balance" :class="{ warn: p.balanceWarn }">
              账户余额 ¥{{ fmtNum(p.balance) }}
              <span v-if="p.balanceWarn">· 低于预警线 ¥500</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pm-row">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">模型状态分布</span>
            <span class="panel-sub">按注册表口径统计</span>
          </div>
          <div class="pm-status-bars">
            <div v-for="s in statusSummary" :key="s.status" class="pm-sm-item">
              <div class="pm-sm-label">
                <span>{{ sLabel(s.status) }}</span>
                <b>{{ s.count }} 个</b>
              </div>
              <div class="pm-sm-track">
                <div class="pm-sm-fill" :style="{ width: s.pct + '%', background: sColor(s.status) }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">上下线审核流</span>
            <el-button link type="primary" @click="activeTab = 'models'">模型管理</el-button>
          </div>
          <div v-for="r in demo.reviews" :key="r.id" class="pm-review">
            <div class="pm-review-main">
              <div class="pm-review-name">
                {{ r.modelName }} <span class="pm-review-arrow">→</span> {{ r.action }}
              </div>
              <div class="pm-review-meta">{{ r.applicant }} 申请 · {{ r.providerName }} · {{ r.time }}</div>
            </div>
            <el-tag size="small" :type="r.status === 'pending' ? 'warning' : 'success'">
              {{ r.status === 'pending' ? '待审核' : '已通过' }}
            </el-tag>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 供应商管理 ========== -->
    <template v-if="activeTab === 'providers'">
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">供应商接入</span>
          <span class="panel-sub">密钥托管 + 连接检查 + 阈值预警</span>
          <el-button type="primary" size="small" @click="openProvider()">新增供应商</el-button>
        </div>
        <div class="toolbar">
          <el-input v-model="pQuery.keyword" placeholder="搜索供应商名称" size="small" clearable style="width: 200px" />
          <el-select v-model="pQuery.region" placeholder="区域" size="small" clearable style="width: 130px">
            <el-option label="中国大陆" value="中国大陆" />
            <el-option label="海外" value="海外" />
          </el-select>
          <el-select v-model="pQuery.status" placeholder="状态" size="small" clearable style="width: 130px">
            <el-option label="健康" value="online" />
            <el-option label="需关注" value="warn" />
          </el-select>
        </div>
        <el-table :data="filteredProviders" stripe size="small">
          <el-table-column label="供应商" min-width="130">
            <template #default="{ row }">
              <span class="pm-name" :style="{ color: row.color }">● {{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="region" label="区域" width="90" />
          <el-table-column prop="protocol" label="协议" width="110" />
          <el-table-column label="Base URL" min-width="220">
            <template #default="{ row }">
              <span class="pm-code">{{ row.baseUrl }}</span>
            </template>
          </el-table-column>
          <el-table-column label="密钥" width="150">
            <template #default="{ row }">
              <span class="pm-code">{{ row.credential }}</span>
            </template>
          </el-table-column>
          <el-table-column label="密钥到期" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="expireWarn(row.credentialExpires) ? 'danger' : 'info'">
                {{ row.credentialExpires.slice(0, 10) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="余额(¥)" width="100" align="right">
            <template #default="{ row }">
              <span :class="{ 'pm-warn-text': row.balanceWarn }">{{ fmtNum(row.balance) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="健康度" width="110">
            <template #default="{ row }">
              <div class="pm-latency">
                <span>{{ row.latency }}ms</span>
                <span class="pm-latency-sep">/</span>
                <span>{{ row.successRate }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="lastCheck" label="最近检查" width="90" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'online' ? 'success' : 'warning'">
                {{ row.status === 'online' ? '健康' : '需关注' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openProvider(row)">编辑</el-button>
              <el-button link @click="toggleProvider(row)">
                {{ row.status === 'online' ? '停用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- ========== 模型管理 ========== -->
    <template v-if="activeTab === 'models'">
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">模型注册表</span>
          <span class="panel-sub">注册后即可路由、配额、审计，全平台复用</span>
          <el-button type="primary" size="small" @click="openModel()">注册新模型</el-button>
        </div>
        <div class="toolbar">
          <el-input v-model="mQuery.keyword" placeholder="搜索模型名称" size="small" clearable style="width: 200px" />
          <el-select v-model="mQuery.provider" placeholder="供应商" size="small" clearable style="width: 140px">
            <el-option v-for="p in demo.providers" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
          <el-select v-model="mQuery.apiType" placeholder="协议类型" size="small" clearable style="width: 130px">
            <el-option v-for="a in apiTypes" :key="a.key" :label="a.name" :value="a.key" />
          </el-select>
          <el-select v-model="mQuery.status" placeholder="状态" size="small" clearable style="width: 120px">
            <el-option label="在线" value="online" />
            <el-option label="待上线" value="pending" />
            <el-option label="已停用" value="offline" />
          </el-select>
        </div>
        <el-table :data="filteredModels" stripe size="small">
          <el-table-column label="模型" min-width="170">
            <template #default="{ row }">
              <span>{{ row.name }}</span>
              <el-tag v-if="row.apiType !== 'chat'" size="small" effect="plain" class="pm-api-tag">
                {{ apiTypeName(row.apiType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="供应商" width="110">
            <template #default="{ row }">{{ providerName(row.providerKey) }}</template>
          </el-table-column>
          <el-table-column label="系列" width="80">
            <template #default="{ row }">
              <el-tag :type="row.series === 'Pro' ? 'danger' : 'success'" size="small">{{ row.series }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="单价(¥/1k tok)" width="120" align="right">
            <template #default="{ row }">进{{ row.priceIn }} 出{{ row.priceOut }}</template>
          </el-table-column>
          <el-table-column label="上下文" width="80" align="right">
            <template #default="{ row }">{{ row.contextWindow }}k</template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="80" />
          <el-table-column prop="applyAt" label="申请时间" width="100" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="statusTagType(row.status)">{{ sLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openModel(row)">编辑</el-button>
              <el-button v-if="row.status !== 'offline'" link type="danger" @click="toggleModel(row)">
                {{ row.status === 'pending' ? '下线' : '停用' }}
              </el-button>
              <el-button v-else link type="success" @click="toggleModel(row)">重新上线</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- ========== 接入规范 ========== -->
    <template v-if="activeTab === 'access'">
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">统一接入流程</span>
          <span class="panel-sub">一次接入，全平台复用</span>
        </div>
        <div class="solve-list">
          <div v-for="(s, i) in demo.onboard" :key="s.title" class="solve-item">
            <span class="solve-idx">{{ i + 1 }}</span>
            <div>
              <strong>{{ s.title }}</strong>
              <p>{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">接入规范 · 本平台口径</span>
        </div>
        <el-table :data="demo.accessSpec" stripe size="small">
          <el-table-column prop="item" label="规范项" width="110" />
          <el-table-column prop="spec" label="约定" min-width="320" />
          <el-table-column prop="note" label="说明" min-width="220" />
        </el-table>
      </div>
    </template>

    <!-- 供应商编辑弹窗 -->
    <el-dialog v-model="pDialog" :title="pForm.name ? '编辑供应商' : '新增供应商'" width="520px">
      <el-form :model="pForm" label-width="96px" size="small">
        <el-form-item label="供应商名称">
          <el-input v-model="pForm.name" placeholder="如：百度 / 阿里云" />
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="pForm.region" style="width: 100%">
            <el-option label="中国大陆" value="中国大陆" />
            <el-option label="海外" value="海外" />
          </el-select>
        </el-form-item>
        <el-form-item label="Base URL">
          <el-input v-model="pForm.baseUrl" placeholder="https://api.example.com/v1" />
        </el-form-item>
        <el-form-item label="协议">
          <el-select v-model="pForm.protocol" style="width: 100%">
            <el-option label="OpenAI 兼容" value="OpenAI 兼容" />
            <el-option label="原生 SDK" value="原生 SDK" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥">
          <el-input v-model="pForm.credential" placeholder="sk-****" />
        </el-form-item>
        <el-form-item label="密钥到期">
          <el-date-picker v-model="pForm.credentialExpires" type="date" value-format="YYYY-MM-DD"
            style="width: 100%" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="pDialog = false">取消</el-button>
        <el-button size="small" type="primary" @click="saveProvider">保存</el-button>
      </template>
    </el-dialog>

    <!-- 模型编辑弹窗 -->
    <el-dialog v-model="mDialog" :title="mForm.name ? '编辑模型' : '注册新模型'" width="520px">
      <el-form :model="mForm" label-width="96px" size="small">
        <el-form-item label="模型名称">
          <el-input v-model="mForm.name" placeholder="如：DeepSeek Chat" />
        </el-form-item>
        <el-form-item label="所属供应商">
          <el-select v-model="mForm.providerKey" style="width: 100%">
            <el-option v-for="p in demo.providers" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="协议类型">
          <el-select v-model="mForm.apiType" style="width: 100%">
            <el-option v-for="a in apiTypes" :key="a.key" :label="a.name" :value="a.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="系列">
          <el-radio-group v-model="mForm.series">
            <el-radio-button label="Pro">Pro</el-radio-button>
            <el-radio-button label="Flash">Flash</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="进/出单价">
          <div class="pm-price-row">
            <el-input-number v-model="mForm.priceIn" :min="0" :precision="1" style="width: 130px" />
            <span>/</span>
            <el-input-number v-model="mForm.priceOut" :min="0" :precision="1" style="width: 130px" />
            <span>¥ / 1k tok</span>
          </div>
        </el-form-item>
        <el-form-item label="上下文">
          <el-input-number v-model="mForm.contextWindow" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="mForm.owner" placeholder="申请负责人" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="mForm.status">
            <el-radio-button label="online">在线</el-radio-button>
            <el-radio-button label="pending">待上线</el-radio-button>
            <el-radio-button label="offline">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="mDialog = false">取消</el-button>
        <el-button size="small" type="primary" @click="saveModel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { providerModelDemo, apiTypes } from '../mock.js'

const emptyProvider = () => ({
  key: '',
  name: '',
  color: '#165dff',
  region: '中国大陆',
  baseUrl: '',
  protocol: 'OpenAI 兼容',
  credential: '',
  credentialExpires: '2027-01-01',
  lastCheck: '--',
  latency: 0,
  successRate: 0,
  calls7d: 0,
  balance: 0,
  balanceWarn: false,
  status: 'online',
})

const emptyModel = () => ({
  key: '',
  name: '',
  providerKey: 'deepseek',
  apiType: 'chat',
  series: 'Flash',
  priceIn: 1,
  priceOut: 2,
  contextWindow: 128,
  maxOutput: 8,
  owner: '',
  applyAt: '',
  status: 'pending',
})

export default {
  name: 'llmAuditProviderModel',
  data() {
    return {
      demo: providerModelDemo,
      apiTypes,
      activeTab: 'overview',
      tabs: [
        { key: 'overview', label: '总览' },
        { key: 'providers', label: '供应商管理' },
        { key: 'models', label: '模型管理' },
        { key: 'access', label: '接入规范' },
      ],
      pQuery: { keyword: '', region: '', status: '' },
      mQuery: { keyword: '', provider: '', apiType: '', status: '' },
      pDialog: false,
      pForm: emptyProvider(),
      mDialog: false,
      mForm: emptyModel(),
    }
  },
  computed: {
    statusSummary() {
      const total = this.demo.models.length || 1
      return ['online', 'pending', 'offline'].map((status) => {
        const count = this.demo.models.filter((m) => m.status === status).length
        return { status, count, pct: Math.round((count / total) * 100) }
      })
    },
    filteredProviders() {
      return this.demo.providers.filter((p) => {
        if (this.pQuery.keyword && !p.name.includes(this.pQuery.keyword)) return false
        if (this.pQuery.region && p.region !== this.pQuery.region) return false
        if (this.pQuery.status && p.status !== this.pQuery.status) return false
        return true
      })
    },
    filteredModels() {
      return this.demo.models.filter((m) => {
        if (this.mQuery.keyword && !m.name.includes(this.mQuery.keyword)) return false
        if (this.mQuery.provider && m.providerKey !== this.mQuery.provider) return false
        if (this.mQuery.apiType && m.apiType !== this.mQuery.apiType) return false
        if (this.mQuery.status && m.status !== this.mQuery.status) return false
        return true
      })
    },
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    providerName(key) {
      const p = this.demo.providers.find((x) => x.key === key)
      return p ? p.name : key
    },
    apiTypeName(key) {
      const a = this.apiTypes.find((x) => x.key === key)
      return a ? a.name.split('(')[0].trim() : key
    },
    sLabel(s) {
      return { online: '在线', pending: '待上线', offline: '已停用' }[s] || s
    },
    sColor(s) {
      return { online: '#00b42a', pending: '#ff7d00', offline: '#c9cdd4' }[s] || '#165dff'
    },
    statusTagType(s) {
      return { online: 'success', pending: 'warning', offline: 'info' }[s] || 'info'
    },
    expireWarn(date) {
      const t = new Date(date)
      return new Date() > new Date(t.getTime() - 60 * 86400000)
    },
    toggleProvider(row) {
      row.status = row.status === 'online' ? 'offline' : 'online'
      this.$message.success(row.status === 'online' ? '已启用' : '已停用（示例，未接后端）')
    },
    openProvider(row) {
      this.pForm = row ? { ...row } : emptyProvider()
      this.pDialog = true
    },
    saveProvider() {
      if (!this.pForm.name) {
        this.$message.warning('请填写供应商名称')
        return
      }
      if (!this.pForm.key) {
        this.pForm.key = `provider_${Date.now()}`
        this.pForm.color = '#165dff'
        this.demo.providers.unshift({ ...this.pForm })
        this.$message.success('已新增（示例，未接后端）')
      } else {
        const idx = this.demo.providers.findIndex((p) => p.key === this.pForm.key)
        this.demo.providers.splice(idx, 1, { ...this.pForm })
        this.$message.success('已更新（示例，未接后端）')
      }
      this.pDialog = false
    },
    toggleModel(row) {
      row.status = row.status === 'online' || row.status === 'pending' ? 'offline' : 'online'
      this.$message.success(this.sLabel(row.status) + '（示例，未接后端）')
    },
    openModel(row) {
      this.mForm = row ? { ...row } : emptyModel()
      this.mDialog = true
    },
    saveModel() {
      if (!this.mForm.name) {
        this.$message.warning('请填写模型名称')
        return
      }
      const now = new Date()
      const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      if (!this.mForm.key) {
        this.mForm.key = `model_${Date.now()}`
        this.mForm.applyAt = d.slice(5)
        this.demo.models.unshift({ ...this.mForm })
        this.$message.success('已注册（示例，未接后端）')
      } else {
        const idx = this.demo.models.findIndex((m) => m.key === this.mForm.key)
        this.demo.models.splice(idx, 1, { ...this.mForm })
        this.$message.success('已更新（示例，未接后端）')
      }
      this.mDialog = false
    },
  },
}
</script>

<style scoped lang="scss">
.pm-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pm-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: linear-gradient(120deg, #18223c, #2b3d63);
  border-radius: 12px;
  padding: 24px 28px;
  color: #fff;
  &-kicker {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 6px;
  }
  &-title { font-size: 20px; font-weight: 700; }
  &-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 10px;
    line-height: 1.6;
    max-width: 640px;
    b { color: #fff; font-weight: 600; }
  }
  &-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    .ah-metric {
      text-align: right;
      b { display: block; font-size: 15px; }
      span { font-size: 11px; color: rgba(255, 255, 255, 0.55); }
    }
  }
}
.pm-tabs {
  display: flex;
  gap: 8px;
}
.pm-tab {
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
  &.active {
    background: #e8f3ff;
    font-weight: 600;
  }
}
.panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  .panel-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    .panel-title { font-size: 14px; font-weight: 600; color: #1d2129; }
    .panel-sub { margin-left: auto; font-size: 12px; color: #c9cdd4; }
  }
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  &-label { font-size: 12px; color: #86909c; }
  &-value {
    margin-top: 8px;
    font-size: 22px;
    font-weight: 700;
    color: #1d2129;
    font-variant-numeric: tabular-nums;
  }
}
.pm-provider-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.pm-provider-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #e5e6eb;
  border-top: 3px solid transparent;
  &.pm-online { border-top-color: #00b42a; }
  &.pm-warn { border-top-color: #ff7d00; }
  .pm-pc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .pm-pc-name { font-size: 14px; font-weight: 600; }
  }
  .pm-pc-metrics {
    display: flex;
    gap: 14px;
    .pm-pc-m {
      span { display: block; font-size: 11px; color: #86909c; }
      b { font-size: 14px; color: #1d2129; }
    }
  }
  .pm-pc-balance {
    margin-top: 10px;
    font-size: 12px;
    color: #4e5969;
    &.warn { color: #ff7d00; font-weight: 600; }
  }
}
.pm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pm-status-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pm-sm-item {
  .pm-sm-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #4e5969;
    margin-bottom: 6px;
    b { color: #1d2129; }
  }
  .pm-sm-track {
    height: 8px;
    background: #f2f3f5;
    border-radius: 4px;
    overflow: hidden;
    .pm-sm-fill { height: 100%; border-radius: 4px; }
  }
}
.pm-review {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #eef0f3;
  &:last-child { border-bottom: none; }
  .pm-review-name {
    font-size: 13px;
    color: #1d2129;
    .pm-review-arrow { color: #c9cdd4; margin: 0 4px; }
  }
  .pm-review-meta { font-size: 11px; color: #86909c; margin-top: 2px; }
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.pm-name { font-weight: 600; }
.pm-code {
  font-family: ui-monospace, Menlo, monospace;
  font-size: 12px;
  color: #4e5969;
}
.pm-warn-text { color: #ff7d00; font-weight: 600; }
.pm-latency {
  .pm-latency-sep { color: #c9cdd4; margin: 0 4px; }
}
.pm-api-tag { margin-left: 6px; }
.pm-price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86909c;
  font-size: 12px;
}
.solve-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.solve-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  .solve-idx {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e8f3ff;
    color: #165dff;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  strong { font-size: 13px; color: #1d2129; }
  p { margin: 4px 0 0; font-size: 12px; color: #86909c; line-height: 1.6; }
}
</style>