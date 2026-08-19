const businessLines = [
  { key: 'finance', name: '财务', color: '#5470c6' },
  { key: 'customer', name: '客户', color: '#91cc75' },
  { key: 'product', name: '产品', color: '#fac858' },
  { key: 'ops', name: '运营', color: '#ee6666' },
  { key: 'rd', name: '研发', color: '#73c0de' },
]

const products = [
  { id: 'p_tiyan', name: '体验罗盘', businessKey: 'customer' },
  { id: 'p_voc', name: 'VOC评价', businessKey: 'customer' },
  { id: 'p_aiorder', name: 'AI建单', businessKey: 'customer' },
  { id: 'p_benben', name: '犇犇Agent', businessKey: 'customer' },
  { id: 'p_finance', name: '财务稽核', businessKey: 'finance' },
  { id: 'p_content', name: '内容生成', businessKey: 'product' },
  { id: 'p_ops', name: '运营助手', businessKey: 'ops' },
  { id: 'p_rd', name: '研发助手', businessKey: 'rd' },
]

const providers = [
  { key: 'baidu', name: '百度', color: '#2932E1' },
  { key: 'aliyun', name: '阿里云', color: '#FF6A00' },
  { key: 'bytedance', name: '字节豆包', color: '#325AB4' },
  { key: 'tencent', name: '腾讯混元', color: '#0052D9' },
  { key: 'zhipu', name: '智谱GLM', color: '#3859FF' },
  { key: 'moonshot', name: '月之暗面', color: '#171717' },
  { key: 'deepseek', name: 'DeepSeek', color: '#4D6BFE' },
]

const models = [
  { key: 'ernie-4.0', name: '文心ERNIE 4.0', providerKey: 'baidu', priceIn: 9, priceOut: 30, series: 'Pro' },
  { key: 'ernie-speed', name: '文心ERNIE Speed', providerKey: 'baidu', priceIn: 0.8, priceOut: 2, series: 'Flash' },
  { key: 'qwen-max', name: '通义千问MAX', providerKey: 'aliyun', priceIn: 9.5, priceOut: 28, series: 'Pro' },
  { key: 'qwen-plus', name: '通义千问Plus', providerKey: 'aliyun', priceIn: 2, priceOut: 8, series: 'Flash' },
  { key: 'doubao-pro', name: '豆包Pro', providerKey: 'bytedance', priceIn: 5, priceOut: 20, series: 'Pro' },
  { key: 'doubao-lite', name: '豆包Lite', providerKey: 'bytedance', priceIn: 0.3, priceOut: 0.6, series: 'Flash' },
  { key: 'hunyuan-turbo', name: '混元Turbo', providerKey: 'tencent', priceIn: 4, priceOut: 12, series: 'Flash' },
  { key: 'glm-4', name: 'GLM-4', providerKey: 'zhipu', priceIn: 2.5, priceOut: 15, series: 'Pro' },
  { key: 'kimi', name: 'Kimi', providerKey: 'moonshot', priceIn: 12, priceOut: 12, series: 'Pro' },
  { key: 'deepseek-chat', name: 'DeepSeek Chat', providerKey: 'deepseek', priceIn: 0.5, priceOut: 2, series: 'Flash' },
]

const apiTypes = [
  { key: 'chat', name: '对话(chat/completions)' },
  { key: 'embedding', name: '向量(embeddings)' },
  { key: 'image', name: '图像(image)' },
  { key: 'audio', name: '音频(audio)' },
]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function genDailyTrend(days) {
  const list = []
  const now = Date.now()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    list.push({
      date,
      calls: rand(8000, 12000),
      tokens: rand(1200000, 1800000),
      cost: rand(80, 145) * 100,
      successRate: rand(98, 99.9),
    })
  }
  return list
}

function genTrendByWeek() {
  const list = []
  const weeks = [`本周(08-12~08-18)`, `上周(08-05~08-11)`, `前2周(07-29~08-04)`]
  weeks.forEach((w, i) => {
    const factor = [1, 0.87, 0.76][i]
    list.push({
      week: w,
      calls: Math.round(65000 * factor),
      tokens: Math.round(11000000 * factor),
      cost: Math.round(6200 * factor),
    })
  })
  return list
}

const workbench = {
  today: {
    calls: 11320,
    todayTokens: 1680000,
    todayCost: 1186.4,
    successRate: 99.12,
    callTrend: [620, 540, 710, 890, 1030, 990, 1120, 1080, 1210, 1150, 1320, 1280, 1450],
    tokenTrend: [82000, 76000, 95000, 118000, 139000, 132000, 152000, 146000, 168000, 161000, 183000, 178000, 202000],
  },
  usedBudget: 0.62, // 今日预算使用62%
  costSplitByBusiness: [
    { key: 'customer', name: '客户', value: 42 },
    { key: 'finance', name: '财务', value: 23 },
    { key: 'product', name: '产品', value: 18 },
    { key: 'ops', name: '运营', value: 11 },
    { key: 'rd', name: '研发', value: 6 },
  ],
  hitModel: [
    { name: '豆包Lite', calls: 3200, cost: 96 },
    { name: '通义千问Plus', calls: 2680, cost: 324 },
    { name: 'DeepSeek Chat', calls: 2100, cost: 42 },
    { name: '文心ERNIE Speed', calls: 1560, cost: 63 },
    { name: '豆包Pro', calls: 1120, cost: 336 },
  ],
  alerts: [
    { level: 'warning', text: '「客户-犇犇Agent」当日费用已达预算的 82%', time: '14:32' },
    { level: 'danger', text: '检测到疑似 Key 泄露：sk-****83hi 异地高频使用', time: '13:05' },
    { level: 'info', text: '「研发-研发助手」调用成功率降至 98.1%', time: '11:47' },
  ],
  trend7: genDailyTrend(7),
  trendByWeek: genTrendByWeek(),
}

const businessStats = businessLines.map((b) => {
  const calls = rand(1200, 5000)
  const tokens = calls * rand(140, 260)
  const cost = Math.round(calls * rand(5, 15) * 100) / 100
  return {
    key: b.key,
    name: b.name,
    cost,
    calls,
    tokens,
    successRate: Math.round(rand(97.5, 99.9) * 10) / 10,
    avgLatency: rand(500, 1500),
  }
})
businessStats.sort((a, b) => b.cost - a.cost)

const providerStats = providers.map((p) => {
  const calls = rand(1500, 4500)
  const tokens = calls * rand(150, 240)
  const cost = Math.round(calls * rand(4, 18) * 100) / 100
  return {
    key: p.key,
    name: p.name,
    cost,
    calls,
    tokens,
    successRate: Math.round(rand(97, 99.9) * 10) / 10,
    avgLatency: rand(400, 1600),
  }
})
providerStats.sort((a, b) => b.cost - a.cost)

const modelStats = models.map((m) => {
  const p = providers.find((x) => x.key === m.providerKey)
  const calls = rand(800, 3500)
  const tokens = calls * rand(120, 220)
  const cost = Math.round(((tokens / 1000) * m.priceIn * 0.5 + (tokens / 1000) * m.priceOut * 0.5) * 100) / 100
  return {
    key: m.key,
    name: m.name,
    providerName: p.name,
    providerKey: p.key,
    series: m.series,
    priceIn: m.priceIn,
    priceOut: m.priceOut,
    calls,
    tokens,
    cost,
    successRate: Math.round(rand(96, 99.9) * 10) / 10,
    avgLatency: rand(500, 1800),
  }
})
modelStats.sort((a, b) => b.cost - a.cost)

const apiStats = apiTypes.map((a) => {
  const calls = rand(2000, 5000)
  const tokens = calls * rand(100, 180)
  const cost = Math.round(tokens / 100 * rand(2, 6) * 10) / 10
  return {
    key: a.key,
    name: a.name,
    calls,
    tokens,
    cost,
  }
})
apiStats.sort((a, b) => b.cost - a.cost)

function genCallLogs(count) {
  const list = []
  const statuses = ['success', 'success', 'success', 'success', 'success', 'success', 'success', 'success', 'failed', 'rate_limited']
  for (let i = 0; i < count; i++) {
    const product = products[rand(0, products.length - 1)]
    const business = businessLines.find((b) => b.key === product.businessKey)
    const model = models[rand(0, models.length - 1)]
    const provider = providers.find((x) => x.key === model.providerKey)
    const api = apiTypes[rand(0, apiTypes.length - 1)]
    const inTok = rand(500, 5000)
    const outTok = rand(300, 3000)
    const status = statuses[rand(0, statuses.length - 1)]
    const success = status === 'success'
    const cost = ((inTok / 1000) * model.priceIn + (outTok / 1000) * model.priceOut) * 0.6
    const ts = new Date(Date.now() - rand(0, 100) * 60000)
    list.push({
      requestId: `req_${Date.now().toString(36)}${i}w${rand(0, 999)}`,
      traceId: `trace_abc${rand(1000, 9999)}def${rand(1000, 9999)}`,
      productId: product.id,
      productName: product.name,
      callerProductId: `${product.id}_m${rand(1, 3)}`,
      tenantId: `t_${rand(1000, 9999)}`,
      businessId: business.key,
      businessName: business.name,
      time: `${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}:${String(ts.getSeconds()).padStart(2, '0')}`,
      date: `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}`,
      provider: provider.name,
      providerKey: provider.key,
      model: model.name,
      modelKey: model.key,
      series: model.series,
      apiType: api.name,
      inputTokens: inTok,
      outputTokens: outTok,
      totalTokens: inTok + outTok,
      cost: Math.round(cost * 100) / 100,
      latencyMs: rand(400, 9000),
      status,
      statusText: success ? '成功' : status === 'failed' ? '失败' : '限流',
      prompt: `你可以帮我分析一下最近一周的客户满意度数据吗？重点关注退货相关的问题。`,
      output: `基于最近一周的数据，客户满意度为 87.6%。其中退货类诉求占比 12.3%，主要集中在服饰类目物流时效问题……`,
      errorInfo: success ? null : status === 'failed' ? { code: 2002, message: 'upstream error: provider 500' } : { code: 1004, message: 'rate limit exceeded, retry in 3s' },
    })
  }
  list.sort((a, b) => b.requestId > a.requestId ? -1 : 1)
  return list
}

const callLogs = genCallLogs(86)

const costReport = {
  budget: {
    daily: 2000,
    monthly: 45000,
    monthlyUsed: 26100,
    monthlyPercent: 0.58,
    dailyUsed: 1186.4,
    dailyPercent: 0.59,
  },
  byBusiness: businessStats,
  byProvider: providerStats,
  byModel: modelStats,
  costTrend: () => {
    const list = []
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      months.push(`${now.getMonth() + 1}月`)
    }
    months.forEach((m, idx) => {
      list.push({ date: m, cost: Math.round([38, 41, 39, 45, 44, 46][idx] * 1000) })
    })
    return list
  },
}

const companyNames = ['杭州犇犇网络', '上海云启科技', '深圳极速电商', '北京音浪传媒', '广州链通商贸', '成都锦程集团']

// 公司级数据：每家公司下的产品及汇总
const companyStats = companyNames.map((name, ci) => {
  const tenants = [`t_${1300 + ci * 17}`]
  // 每家公司下的产品数 2~4 个，随机从现有产品中抽取
  const used = [...products].sort(() => Math.random() - 0.5).slice(0, 2 + (ci % 3))
  let calls = 0, tokens = 0, cost = 0
  const child = used.map((p, pi) => {
    const c = rand(600, 2600)
    const t = c * rand(150, 250)
    const co = Math.round(c * rand(5, 14) * 100) / 100
    calls += c; tokens += t; cost += co
    return {
      productId: p.id,
      productName: p.name,
      businessKey: p.businessKey,
      calls: c,
      tokens: t,
      cost: co,
      successRate: Math.round(rand(97, 99.9) * 10) / 10,
    }
  })
  child.push(
    ...['aiChat', 'opsAssist'].map((extra, i) => {
      const c = rand(200, 900)
      const t = c * rand(120, 200)
      const co = Math.round(c * rand(3, 8) * 100) / 100
      calls += c; tokens += t; cost += co
      return {
        productId: `${tenants[0]}_x${i}`,
        productName: extra === 'aiChat' ? '智能客服' : '运营助手',
        businessKey: 'customer',
        calls: c,
        tokens: t,
        cost: co,
        successRate: Math.round(rand(96, 99.8) * 10) / 10,
      }
    })
  )
  return {
    companyId: tenants[0],
    companyName: name,
    calls,
    tokens,
    cost,
    successRate: Math.round(rand(96, 99.9) * 10) / 10,
    avgLatency: rand(450, 1600),
    children: child,
  }
})
companyStats.sort((a, b) => b.cost - a.cost)

export {
  businessLines,
  products,
  providers,
  models,
  apiTypes,
  workbench,
  businessStats,
  providerStats,
  modelStats,
  apiStats,
  callLogs,
  costReport,
  companyStats,
}