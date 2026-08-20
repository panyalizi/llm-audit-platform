<template>
  <div class="tl-page">
    <div class="tl-hero">
      <div class="tl-hero-left">
        <div class="tl-hero-kicker">设计示例 · 接到本平台</div>
        <div class="tl-hero-title">配额网关：调用之前先看还剩多少Token</div>
        <div class="tl-hero-desc">
          调用真实大模型之前，先按
          <b>业务线预算 → 产品额度 → 周期用量</b> 拦一拦，不够就不让调用。
        </div>
      </div>
      <div class="tl-hero-right">
        <div class="ah-metric"><b>事前拦截</b><span>对应工作台 / 成本中心的事后统计</span></div>
        <div class="ah-metric"><b>假卡号</b><span>产品只拿平台 Key，厂商密钥不外泄</span></div>
      </div>
    </div>

    <div class="tl-tabs">
      <div
        v-for="t in tabs"
        :key="t.key"
        class="tl-tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </div>
    </div>

    <!-- ========== 概念导览 ========== -->
    <template v-if="activeTab === 'intro'">
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">管理员怎么管</span>
        </div>
        <div class="solve-list">
          <div v-for="(s, i) in solutions" :key="s.title" class="solve-item">
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
          <span class="panel-title">TokenLimit 概念 → 本平台口径</span>
        </div>
        <el-table :data="mapping" stripe size="small">
          <el-table-column prop="tl" label="TokenLimit" width="180" />
          <el-table-column prop="here" label="本平台" min-width="160" />
          <el-table-column prop="example" label="示例" min-width="220" />
        </el-table>
      </div>
    </template>

    <!-- ========== 全局概览（Console Dashboard） ========== -->
    <template v-if="activeTab === 'dashboard'">
      <div class="stat-grid">
        <div v-for="item in demo.stats" :key="item.label" class="stat-card">
          <div class="stat-card-label">{{ item.label }}</div>
          <div class="stat-card-value">{{ fmtStat(item) }}</div>
        </div>
      </div>
      <div class="stat-grid stat-grid-3">
        <div
          v-for="item in demo.costStats"
          :key="item.label"
          class="stat-card"
          :class="{ 'stat-card--save': item.highlight }"
        >
          <div class="stat-card-label">{{ item.label }}</div>
          <div class="stat-card-value" :class="{ ok: item.highlight }">{{ item.value }}</div>
        </div>
      </div>

      <div class="wb-row">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">近 7 天 Token 消耗趋势</span>
            <span class="panel-sub">数据来自工作台 mock</span>
          </div>
          <div class="bar-chart">
            <div
              v-for="(item, i) in demo.trend"
              :key="i"
              class="bar-col"
              :style="{ height: barH(item.value) + '%' }"
            >
              <span class="bar-val">{{ fmtShort(item.value) }}</span>
            </div>
          </div>
          <div class="bar-axis">
            <span v-for="item in demo.trend" :key="item.date">{{ item.date.slice(5) }}</span>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">高消耗业务线 Top 5</span>
            <el-button link type="primary" @click="$router.push('/llmAudit/usage')">用量统计</el-button>
          </div>
          <el-table :data="demo.topTeams" size="small">
            <el-table-column prop="name" label="业务线" />
            <el-table-column label="Token" align="right">
              <template #default="{ row }">{{ fmtNum(row.tokens) }}</template>
            </el-table-column>
            <el-table-column label="调用" align="right">
              <template #default="{ row }">{{ fmtNum(row.calls) }}</template>
            </el-table-column>
            <el-table-column label="费用(¥)" align="right">
              <template #default="{ row }">{{ Number(row.cost).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- ========== 配额治理 ========== -->
    <template v-if="activeTab === 'quota'">
      <div class="wb-row quota-overview-row">
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">产品额度 · {{ demo.overview.productName }}</span>
            <el-tag size="small" type="warning">个人优先，再团队</el-tag>
          </div>
          <div class="quota-nums">
            <span>已用 {{ fmtNum(demo.overview.personalUsed) }}</span>
            <span>限额 {{ fmtNum(demo.overview.personalQuota) }} Token / 日</span>
          </div>
          <el-progress
            :percentage="personalPercent"
            :stroke-width="12"
            :color="progressColor(personalPercent)"
          />
          <p class="quota-note">软阈值 80% 黄灯，100% 硬拦截。当前 {{ personalPercent }}%。</p>
        </div>
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">业务线预算 · {{ demo.overview.businessName }}</span>
            <el-tag size="small">TEAM · COST · DAY</el-tag>
          </div>
          <div class="quota-nums">
            <span>已用 ¥{{ demo.overview.teamUsed }}</span>
            <span>限额 ¥{{ demo.overview.teamQuota }} / 日</span>
          </div>
          <el-progress
            :percentage="teamPercent"
            :stroke-width="12"
            :color="progressColor(teamPercent)"  
          />
          <p class="quota-note">对应成本中心「今日预算」：先拦再调用，而不是花完再看报表。</p>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">责任链拦截（调用前）</span>
          <span class="panel-sub">任一环节拒绝即 429，不转发厂商</span>
        </div>
        <div class="chain">
          <div
            v-for="(step, i) in demo.chain"
            :key="step.key"
            class="chain-node"
            :class="'chain-' + (simResult.hit === step.key ? simResult.status : 'idle')"
          >
            <div class="chain-title">{{ i + 1 }}. {{ step.title }}</div>
            <div class="chain-code">{{ step.tokenlimit }}</div>
            <p>{{ step.desc }}</p>
          </div>
        </div>
        <div class="sim-bar">
          <el-select v-model="sim.productId" size="small" style="width: 180px">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
          <el-input-number v-model="sim.tokens" size="small" :min="1000" :max="500000" :step="5000" />
          <span class="sim-hint">预估 Token</span>
          <el-button type="primary" size="small" @click="runSim">模拟一次调用</el-button>
          <span v-if="simResult.message" :class="['sim-msg', simResult.status]">{{ simResult.message }}</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">Quota 配额规则</span>
          <span class="panel-sub">按业务线 / 产品设置 Token、费用、请求数限制</span>
          <el-button type="primary" size="small" @click="openDialog()">新建规则</el-button>
        </div>
        <div class="toolbar">
          <el-select v-model="query.targetType" placeholder="对象" size="small" clearable style="width: 120px">
            <el-option label="业务线 TEAM" value="TEAM" />
            <el-option label="产品 USER" value="USER" />
          </el-select>
          <el-select v-model="query.limitType" placeholder="限额类型" size="small" clearable style="width: 130px">
            <el-option label="Token" value="TOKEN" />
            <el-option label="费用" value="COST" />
            <el-option label="请求数" value="REQUEST_COUNT" />
          </el-select>
          <el-select v-model="query.period" placeholder="周期" size="small" clearable style="width: 110px">
            <el-option v-for="p in periods" :key="p.v" :label="p.l" :value="p.v" />
          </el-select>
        </div>
        <el-table :data="filteredRules" stripe size="small">
          <el-table-column prop="ruleCode" label="规则编码" min-width="170" />
          <el-table-column label="对象" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="row.targetType === 'TEAM' ? '' : 'success'">
                {{ row.targetType === 'TEAM' ? '业务线' : '产品' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="targetName" label="名称" width="110" />
          <el-table-column label="模型" width="110">
            <template #default="{ row }">{{ modelName(row.model) || '全部' }}</template>
          </el-table-column>
          <el-table-column label="类型" width="90">
            <template #default="{ row }">{{ limitText(row.limitType) }}</template>
          </el-table-column>
          <el-table-column label="限额 / 已用" min-width="180">
            <template #default="{ row }">
              <div class="mini-meta">{{ formatLimit(row.used, row.limitType) }} / {{ formatLimit(row.limitValue, row.limitType) }}</div>
              <div class="mini-track">
                <div class="mini-fill" :style="{ width: usedPercent(row) + '%', background: progressColor(usedPercent(row)) }"></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="周期" width="70">
            <template #default="{ row }">{{ periodText(row.period) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
              <el-button link @click="toggleRule(row)">{{ row.enabled ? '停用' : '启用' }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- ========== Quick Start ========== -->
    <template v-if="activeTab === 'quickstart'">
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">Quick Start</span>
          <span class="panel-sub">客户端只改 Base URL 和 API Key，零改造接入本平台网关</span>
        </div>
        <div class="qs-step">
          <div class="qs-title">步骤 1：选择产品 API Key</div>
          <el-select v-model="qsKey" size="small" style="width: 360px">
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="`${p.name}  ·  ${demo.accessKey.slice(0, 18)}…`"
              :value="p.id"
            />
          </el-select>
          <p class="qs-note">Secret 只在创建时显示一次。这里用演示 Key，真实值不会出现在页面和日志里。</p>
        </div>
        <div class="qs-step">
          <div class="qs-title">步骤 2：Gateway URL</div>
          <el-input :model-value="demo.gatewayUrl + '/v1'" size="small" style="width: 360px" readonly>
            <template #append>
              <el-button @click="copy(demo.gatewayUrl + '/v1')">复制</el-button>
            </template>
          </el-input>
          <p class="qs-note">所有客户端 Base URL 都是这个地址，由网关按产品解析业务线并做配额检查。</p>
        </div>
        <div class="qs-step">
          <div class="qs-title">步骤 3：客户端配置示例</div>
          <el-tabs v-model="qsClient">
            <el-tab-pane label="Cursor" name="cursor" />
            <el-tab-pane label="OpenAI SDK" name="sdk" />
            <el-tab-pane label="cURL" name="curl" />
          </el-tabs>
          <pre class="code-block">{{ qsSnippet }}</pre>
        </div>
      </div>
    </template>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑规则' : '新建规则'" width="520px">
      <el-form :model="form" label-width="96px" size="small">
        <el-form-item label="规则编码">
          <el-input v-model="form.ruleCode" placeholder="Q-BIZ-DAY-TOKEN" />
        </el-form-item>
        <el-form-item label="对象类型">
          <el-radio-group v-model="form.targetType" @change="onTargetTypeChange">
            <el-radio-button label="TEAM">业务线</el-radio-button>
            <el-radio-button label="USER">产品</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="对象">
          <el-select v-model="form.targetCode" style="width: 100%">
            <el-option
              v-for="opt in targetOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="限制类型">
          <el-select v-model="form.limitType" style="width: 100%">
            <el-option label="Token" value="TOKEN" />
            <el-option label="费用" value="COST" />
            <el-option label="请求数" value="REQUEST_COUNT" />
          </el-select>
        </el-form-item>
        <el-form-item label="限额">
          <el-input-number v-model="form.limitValue" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="周期">
          <el-select v-model="form.period" style="width: 100%">
            <el-option v-for="p in periods" :key="p.v" :label="p.l" :value="p.v" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型">
          <el-select v-model="form.model" clearable placeholder="全部模型" style="width: 100%">
            <el-option v-for="m in models" :key="m.key" :label="m.name" :value="m.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { tokenLimitDemo, products, models, businessLines } from '../mock.js'

const emptyForm = () => ({
  id: undefined,
  ruleCode: '',
  targetType: 'TEAM',
  targetCode: 'customer',
  model: '',
  limitType: 'TOKEN',
  limitValue: 100000,
  period: 'DAY',
  enabled: true,
  description: '',
})

export default {
  name: 'llmAuditTokenLimit',
  data() {
    return {
      demo: tokenLimitDemo,
      products,
      models,
      businessLines,
      activeTab: 'intro',
      tabs: [
        { key: 'intro', label: '这是什么' },
        { key: 'dashboard', label: '全局概览' },
        { key: 'quota', label: '配额治理' },
        { key: 'quickstart', label: '快速接入' },
      ],
      solutions: [
        { title: '中间人', desc: '产品不再直连百度 / 通义 / DeepSeek。统一走本平台 /v1，真密钥锁在网关里。' },
        { title: '先看够不够钱再打', desc: '请求发出前用预估 Token 走责任链：业务线余额 → 产品额度 → 周期用量，不够直接拒绝。' },
        { title: '给大家设额度', desc: '可规定「犇犇Agent 每天 20 万 Token」「客户业务线每天 ¥800」，超过就不让用。' },
        { title: '快超了会提醒', desc: '用到 80% 亮黄灯，100% 硬拦截。对应成本中心今日预算 59% 的进度条，但发生在调用前。' },
        { title: '记一本清楚的账', desc: '谁打的、打了多少、花了多少，仍写入现有调用明细 / 审计中心，月底能对账。' },
      ],
      mapping: [
        { tl: 'Team（成本中心 / 预算池）', here: '业务线 / 公司', example: '客户、财务、杭州犇犇网络' },
        { tl: 'User（成本责任人）', here: '产品 / 调用方', example: '犇犇Agent、VOC评价、财务稽核' },
        { tl: 'API Key', here: '产品访问凭证', example: 'tl_ak_xxx，绑定产品 + 业务线' },
        { tl: 'Provider Credential', here: '厂商密钥托管', example: '百度 / 阿里云 Key，不出现在客户端' },
        { tl: 'Quota Rule', here: '配额规则', example: 'TEAM+COST+DAY 或 USER+TOKEN+DAY' },
      ],
      periods: [
        { v: 'HOUR', l: '小时' },
        { v: 'DAY', l: '天' },
        { v: 'WEEK', l: '周' },
        { v: 'MONTH', l: '月' },
        { v: 'TOTAL', l: '总计' },
      ],
      query: { targetType: '', limitType: '', period: '' },
      rules: tokenLimitDemo.quotaRules.map((r) => ({ ...r })),
      dialogVisible: false,
      form: emptyForm(),
      sim: { productId: 'p_benben', tokens: 50000 },
      simResult: { hit: '', status: '', message: '' },
      qsKey: 'p_benben',
      qsClient: 'cursor',
    }
  },
  computed: {
    trendMax() {
      return Math.max(...this.demo.trend.map((t) => t.value), 1)
    },
    personalPercent() {
      const q = this.demo.overview.personalQuota || 1
      return Math.min(100, Math.round((this.demo.overview.personalUsed / q) * 100))
    },
    teamPercent() {
      const q = this.demo.overview.teamQuota || 1
      return Math.min(100, Math.round((this.demo.overview.teamUsed / q) * 100))
    },
    filteredRules() {
      return this.rules.filter((r) => {
        if (this.query.targetType && r.targetType !== this.query.targetType) return false
        if (this.query.limitType && r.limitType !== this.query.limitType) return false
        if (this.query.period && r.period !== this.query.period) return false
        return true
      })
    },
    targetOptions() {
      if (this.form.targetType === 'USER') {
        return this.products.map((p) => ({ value: p.id, label: p.name }))
      }
      return this.businessLines.map((b) => ({ value: b.key, label: b.name }))
    },
    qsSnippet() {
      const base = `${this.demo.gatewayUrl}/v1`
      const key = `${this.demo.accessKey}:sk_tl_********`
      const product = this.products.find((p) => p.id === this.qsKey)
      const name = product ? product.name : '产品'
      if (this.qsClient === 'sdk') {
        return `from openai import OpenAI
# ${name} 走本平台网关，不直连厂商

client = OpenAI(
    base_url="${base}",
    api_key="${key}",
)

resp = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello"}],
    stream=True,
)`
      }
      if (this.qsClient === 'curl') {
        return `curl ${base}/chat/completions \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'`
      }
      return `# Cursor 设置（Settings → Models）
# 选择 OpenAI Compatible，填入 ${name} 的平台凭证：
API Key:  ${key}
Base URL: ${base}
Model:    deepseek-chat（需在该产品允许的模型列表中）`
    },
  },
  methods: {
    fmtNum(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    fmtShort(n) {
      if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
      if (n >= 1000) return (n / 1000).toFixed(0) + 'k'
      return String(n)
    },
    fmtStat(item) {
      return typeof item.value === 'number' && item.value >= 1000 ? this.fmtShort(item.value) : item.value
    },
    barH(v) {
      return Math.max(6, Math.round((v / this.trendMax) * 100))
    },
    progressColor(p) {
      if (p >= 100) return '#f53f3f'
      if (p >= 80) return '#ff7d00'
      return '#165dff'
    },
    usedPercent(row) {
      if (!row.limitValue) return 0
      return Math.min(100, Math.round((row.used / row.limitValue) * 100))
    },
    limitText(t) {
      return { TOKEN: 'Token', COST: '费用', REQUEST_COUNT: '请求数' }[t] || t
    },
    periodText(p) {
      const hit = this.periods.find((x) => x.v === p)
      return hit ? hit.l : p
    },
    formatLimit(v, type) {
      if (type === 'COST') return `¥${this.fmtNum(v)}`
      return this.fmtNum(v)
    },
    modelName(key) {
      const m = this.models.find((x) => x.key === key)
      return m ? m.name : key
    },
    onTargetTypeChange() {
      this.form.targetCode = this.targetOptions[0] ? this.targetOptions[0].value : ''
    },
    openDialog(row) {
      this.form = row ? { ...row } : emptyForm()
      this.dialogVisible = true
    },
    saveRule() {
      if (!this.form.ruleCode) {
        this.$message.warning('请填写规则编码')
        return
      }
      const name = this.targetOptions.find((o) => o.value === this.form.targetCode)
      if (this.form.id) {
        const idx = this.rules.findIndex((r) => r.id === this.form.id)
        this.rules.splice(idx, 1, { ...this.form, targetName: name ? name.label : this.form.targetCode })
        this.$message.success('已更新（示例，未接后端）')
      } else {
        this.rules.unshift({
          ...this.form,
          id: Date.now(),
          used: 0,
          targetName: name ? name.label : this.form.targetCode,
        })
        this.$message.success('已创建（示例，未接后端）')
      }
      this.dialogVisible = false
    },
    toggleRule(row) {
      row.enabled = !row.enabled
      this.$message.success(row.enabled ? '已启用' : '已停用')
    },
    runSim() {
      const product = this.products.find((p) => p.id === this.sim.productId)
      const estCost = Math.round((this.sim.tokens / 1000) * 0.8 * 100) / 100
      const o = this.demo.overview
      const sameTeam = product && product.businessKey === o.businessKey
      if (sameTeam && o.teamUsed + estCost > o.teamQuota) {
        this.simResult = {
          hit: 'team-balance',
          status: 'deny',
          message: `拦截：${this.businessName(product.businessKey)} 日预算不足（预估 ¥${estCost}）`,
        }
        return
      }
      if (product && product.id === o.productId && o.personalUsed + this.sim.tokens > o.personalQuota) {
        this.simResult = {
          hit: 'user-balance',
          status: 'deny',
          message: `拦截：${product.name} 日 Token 额度不足（预估 ${this.fmtNum(this.sim.tokens)}）`,
        }
        return
      }
      this.simResult = {
        hit: 'usage-period',
        status: 'allow',
        message: `放行：预扣 ${this.fmtNum(this.sim.tokens)} Token / ¥${estCost}，结束后按厂商真实值结算`,
      }
    },
    businessName(key) {
      const b = this.businessLines.find((x) => x.key === key)
      return b ? b.name : key
    },
    copy(text) {
      navigator.clipboard?.writeText(text).then(() => this.$message.success('已复制'))
    },
  },
}
</script>

<style scoped lang="scss">
.tl-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tl-hero {
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
      b { display: block; font-size: 16px; }
      span { font-size: 11px; color: rgba(255, 255, 255, 0.55); }
    }
  }
}
.tl-tabs {
  display: flex;
  gap: 8px;
}
.tl-tab {
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
.stat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.stat-grid-3 {
  grid-template-columns: repeat(3, 1fr);
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
    &.ok { color: #00b42a; }
  }
  &--save {
    background: linear-gradient(135deg, #f6ffed, #fff);
    border: 1px solid #e8f5ec;
  }
}
.wb-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}
.quota-overview-row {
  grid-template-columns: 1fr 1fr;
}
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 180px;
  padding: 6px 4px 0;
}
.bar-col {
  flex: 1;
  background: linear-gradient(180deg, #409eff, #79bbff);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 6px;
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
.quota-nums {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 10px;
}
.quota-note {
  margin: 10px 0 0;
  font-size: 12px;
  color: #86909c;
}
.chain {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.chain-node {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 14px;
  .chain-title { font-size: 14px; font-weight: 600; color: #1d2129; }
  .chain-code { font-size: 11px; color: #165dff; margin: 4px 0 8px; font-family: ui-monospace, Menlo, monospace; }
  p { margin: 0; font-size: 12px; color: #86909c; line-height: 1.6; }
  &.chain-deny { border-color: #f53f3f; background: #ffece8; }
  &.chain-allow { border-color: #00b42a; background: #f6ffed; }
}
.sim-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed #e5e6eb;
}
.sim-hint { font-size: 12px; color: #86909c; }
.sim-msg {
  font-size: 13px;
  &.deny { color: #f53f3f; }
  &.allow { color: #00b42a; }
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.mini-meta {
  font-size: 12px;
  color: #4e5969;
  margin-bottom: 4px;
}
.mini-track {
  height: 6px;
  background: #f2f3f5;
  border-radius: 3px;
  overflow: hidden;
  .mini-fill { height: 100%; border-radius: 3px; }
}
.qs-step { margin-bottom: 22px; }
.qs-title { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.qs-note { margin: 8px 0 0; font-size: 12px; color: #86909c; }
.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
  margin: 0;
}
</style>
