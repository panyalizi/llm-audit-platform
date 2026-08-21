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

// Model Profiles - 执行类型管理
const modelProfiles = [
  { key: 'fast', name: '快速响应', description: '优先速度，适合简单问答', color: '#52c41a', maxLatency: 1000 },
  { key: 'standard', name: '标准质量', description: '均衡性能与质量', color: '#1890ff', maxLatency: 3000 },
  { key: 'reasoning', name: '复杂推理', description: '复杂任务深度思考', color: '#722ed1', maxLatency: 10000 },
  { key: 'long_context', name: '长文本处理', description: '支持超长上下文', color: '#fa8c16', maxLatency: 15000 },
]

// Constraint Modes - 约束模式
const constraintModes = [
  { key: 'none', name: '无约束', description: '无特殊限制' },
  { key: 'safety', name: '安全合规', description: '内容安全过滤' },
  { key: 'cost_control', name: '成本控制', description: '预算限制' },
  { key: 'performance', name: '性能优先', description: '响应速度优先' },
  { key: 'accuracy', name: '准确性优先', description: '结果质量优先' },
]

// Error Codes - 错误码映射
const errorCodes = [
  { code: 1001, name: '参数错误', level: 'error', description: '请求参数格式错误或缺失' },
  { code: 1002, name: '认证失败', level: 'error', description: 'API密钥无效或过期' },
  { code: 1003, name: '配额不足', level: 'warning', description: '调用次数或Token额度已用完' },
  { code: 1004, name: '频率限制', level: 'warning', description: '调用频率超过限制' },
  { code: 2001, name: '网络超时', level: 'error', description: '请求超时或网络异常' },
  { code: 2002, name: '服务商错误', level: 'error', description: '上游服务商内部错误' },
  { code: 2003, name: '内容过滤', level: 'warning', description: '内容违反安全策略' },
  { code: 2004, name: '模型过载', level: 'warning', description: '模型服务过载' },
  { code: 3001, name: '路由异常', level: 'error', description: '路由配置错误' },
  { code: 3002, name: '降级失败', level: 'error', description: '降级模型调用失败' },
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

// Workbench Monitoring - 工作台监控指标
const workbenchMonitor = {
  // 稳定性指标
  stability: {
    successRate: 99.12,
    retryRate: 2.3,
    fallbackRate: 1.8,
    errorRate: 0.88,
    p50Latency: 820,
    p95Latency: 2100,
    p99Latency: 4500,
  },
  // 路由合规性
  routing: {
    totalCalls: 11320,
    compliantCalls: 11245,
    complianceRate: 99.34,
    violatedRoutes: [
      { route: 'customer→baidu→ernie-4.0', violation: '超出预算限制', count: 12 },
      { route: 'finance→aliyun→qwen-max', violation: '未使用指定模型', count: 8 },
    ],
  },
  // 输出质量
  quality: {
    avgScore: 8.7,
    satisfaction: 94.2,
    coherence: 96.8,
    accuracy: 98.1,
    relevance: 95.6,
  },
  // 实时监控
  realtime: {
    currentCalls: 156,
    activeUsers: 23,
    queueDepth: 2,
    systemLoad: 0.68,
    cacheHitRate: 34.2,
  },
  // 趋势分析
  trends: {
    latency: [820, 780, 850, 920, 880, 950, 820],
    success: [99.1, 99.3, 99.0, 99.2, 99.4, 99.1, 99.1],
    errors: [12, 8, 15, 10, 7, 9, 10],
  },
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
  monitor: workbenchMonitor,
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
    const profile = modelProfiles[rand(0, modelProfiles.length - 1)]
    const constraint = constraintModes[rand(0, constraintModes.length - 1)]
    
    const inTok = rand(500, 5000)
    const outTok = rand(300, 3000)
    const status = statuses[rand(0, statuses.length - 1)]
    const success = status === 'success'
    
    // 生成逻辑调用层（两层结构）
    const logicalCall = {
      requestId: `req_${Date.now().toString(36)}${i}w${rand(0, 999)}`,
      traceId: `trace_abc${rand(1000, 9999)}def${rand(1000, 9999)}`,
      tenantId: `t_${rand(1000, 9999)}`,
      businessId: business.key,
      businessName: business.name,
      productId: product.id,
      productName: product.name,
      callerProductId: `${product.id}_m${rand(1, 3)}`,
      platform: 'llm-gateway',
      product_id: product.id,
      scenario_id: `scenario_${rand(1, 10)}`,
      environment: status === 'success' ? 'production' : 'testing',
      model_profile: profile.key,
      constraint_mode: constraint.key,
      execution_mode: ['fast', 'standard', 'reasoning'][rand(0, 2)],
      fallback_mode: 'same_provider',
      routing_policy: `policy_${rand(1, 5)}`,
      total_cost: 0,
      total_latency: 0,
      attempt_count: 0,
      final_status: status,
      created_at: new Date(Date.now() - rand(0, 100) * 60000).toISOString(),
    }
    
    // 生成模型尝试层（1-3次尝试）
    const attemptCount = success ? 1 : rand(1, 3)
    const attempts = []
    let totalCost = 0
    let totalLatency = 0
    
    for (let j = 0; j < attemptCount; j++) {
      const attemptStatus = j === attemptCount - 1 ? status : (rand(0, 1) === 0 ? 'success' : 'rate_limited')
      const attemptSuccess = attemptStatus === 'success'
      
      const cost = ((inTok / 1000) * model.priceIn + (outTok / 1000) * model.priceOut) * 0.6
      const latency = rand(400, 9000)
      
      totalCost += cost
      totalLatency += latency
      
      attempts.push({
        attempt_id: `${logicalCall.requestId}_a${j + 1}`,
        logical_call_id: logicalCall.requestId,
        attempt_number: j + 1,
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
        latencyMs: latency,
        status: attemptStatus,
        statusText: attemptSuccess ? '成功' : attemptStatus === 'failed' ? '失败' : '限流',
        prompt: `你可以帮我分析一下最近一周的客户满意度数据吗？重点关注退货相关的问题。`,
        output: attemptSuccess ? `基于最近一周的数据，客户满意度为 87.6%。其中退货类诉求占比 12.3%，主要集中在服饰类目物流时效问题……` : null,
        errorInfo: attemptSuccess ? null : { code: 2002, message: 'upstream error: provider 500' },
        started_at: new Date(Date.now() - rand(0, 100) * 60000).toISOString(),
        completed_at: new Date(Date.now() - rand(0, 100) * 60000).toISOString(),
        is_final: j === attemptCount - 1,
      })
    }
    
    // 更新逻辑调用层信息
    logicalCall.total_cost = Math.round(totalCost * 100) / 100
    logicalCall.total_latency = totalLatency
    logicalCall.attempt_count = attemptCount
    
    // 构建返回数据（保持向后兼容）
    const finalData = {
      ...logicalCall,
      ...attempts[0], // 使用第一次尝试的信息作为主要显示
      attempts: attempts,
    }
    
    list.push(finalData)
  }
  
  list.sort((a, b) => b.created_at > a.created_at ? -1 : 1)
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

// TokenLimit 配额网关示例：Team→业务线，User→产品，沿用本平台已有口径
const tokenLimitDemo = {
  gatewayUrl: 'https://llm-audit.example.com',
  accessKey: 'tl_ak_8Kx2mNqP4rStUvWxYzAbCdEfGhIjKlMn',
  stats: [
    { label: '业务线 / Team', value: businessLines.length },
    { label: '配额规则数', value: 9 },
    { label: '产品 / User', value: products.length },
    { label: 'API Key 数', value: 12 },
    { label: '今日 Token', value: workbench.today.todayTokens },
    { label: '今日调用', value: workbench.today.calls },
  ],
  costStats: [
    { label: '今日费用(¥)', value: workbench.today.todayCost.toFixed(2) },
    { label: '今日缓存命中率', value: '34.2%' },
    { label: '今日缓存节省(¥)', value: '86.40', highlight: true },
  ],
  trend: workbench.trend7.map((d) => ({ date: d.date, value: d.tokens })),
  topTeams: businessStats.slice(0, 5).map((b) => ({
    name: b.name,
    tokens: b.tokens,
    calls: b.calls,
    cost: b.cost,
  })),
  overview: {
    productName: '犇犇Agent',
    productId: 'p_benben',
    quotaMode: 'PERSONAL_FIRST_THEN_TEAM',
    businessName: '客户',
    businessKey: 'customer',
    personalQuota: 200000,
    personalUsed: 164000,
    teamQuota: 800,
    teamUsed: 656,
    teamLimitType: 'COST',
  },
  chain: [
    {
      key: 'team-balance',
      title: '业务线余额',
      tokenlimit: 'team-balance',
      desc: '对应 TokenLimit 的团队预算池。客户业务线今日费用额度 ¥800，用完即拦。',
    },
    {
      key: 'user-balance',
      title: '产品额度',
      tokenlimit: 'user-balance',
      desc: '对应个人额度。犇犇Agent 每日 20 万 Token，不足时按「产品优先、业务线兜底」。',
    },
    {
      key: 'usage-period',
      title: '周期用量',
      tokenlimit: 'usage-period',
      desc: '按日 / 周 / 月的次数与 Token 上限。本次请求预估通过后才转发真实厂商。',
    },
  ],
  quotaRules: [
    { id: 1, ruleCode: 'Q-CUSTOMER-DAY-COST', targetType: 'TEAM', targetCode: 'customer', targetName: '客户', model: '', limitType: 'COST', limitValue: 800, used: 656, period: 'DAY', enabled: true, description: '客户业务线日费用硬限额' },
    { id: 2, ruleCode: 'Q-FINANCE-MONTH-COST', targetType: 'TEAM', targetCode: 'finance', targetName: '财务', model: '', limitType: 'COST', limitValue: 12000, used: 6840, period: 'MONTH', enabled: true, description: '财务业务线月预算' },
    { id: 3, ruleCode: 'Q-RD-MONTH-TOKEN', targetType: 'TEAM', targetCode: 'rd', targetName: '研发', model: '', limitType: 'TOKEN', limitValue: 8000000, used: 2100000, period: 'MONTH', enabled: true, description: '研发助手月 Token 池' },
    { id: 4, ruleCode: 'Q-BENBEN-DAY-TOKEN', targetType: 'USER', targetCode: 'p_benben', targetName: '犇犇Agent', model: '', limitType: 'TOKEN', limitValue: 200000, used: 164000, period: 'DAY', enabled: true, description: '犇犇Agent 每日 Token' },
    { id: 5, ruleCode: 'Q-VOC-DAY-REQ', targetType: 'USER', targetCode: 'p_voc', targetName: 'VOC评价', model: '', limitType: 'REQUEST_COUNT', limitValue: 3000, used: 2140, period: 'DAY', enabled: true, description: 'VOC 每日请求次数' },
    { id: 6, ruleCode: 'Q-AIORDER-DAY-COST', targetType: 'USER', targetCode: 'p_aiorder', targetName: 'AI建单', model: 'doubao-lite', limitType: 'COST', limitValue: 120, used: 48, period: 'DAY', enabled: false, description: 'AI建单仅限豆包 Lite' },
    { id: 7, ruleCode: 'Q-CONTENT-WEEK-TOKEN', targetType: 'USER', targetCode: 'p_content', targetName: '内容生成', model: '', limitType: 'TOKEN', limitValue: 1500000, used: 420000, period: 'WEEK', enabled: true, description: '内容生成周 Token' },
    { id: 8, ruleCode: 'Q-OPS-HOUR-REQ', targetType: 'USER', targetCode: 'p_ops', targetName: '运营助手', model: '', limitType: 'REQUEST_COUNT', limitValue: 200, used: 36, period: 'HOUR', enabled: true, description: '运营助手每小时限次' },
    { id: 9, ruleCode: 'Q-TIYAN-TOTAL-COST', targetType: 'USER', targetCode: 'p_tiyan', targetName: '体验罗盘', model: '', limitType: 'COST', limitValue: 5000, used: 1280, period: 'TOTAL', enabled: true, description: '体验罗盘长期费用封顶' },
  ],
}

// 供应商模型管理（平台级统一收口）：供应商接入、模型注册上下线、密钥托管
const providerModelDemo = {
  stats: [
    { label: '接入供应商', value: 7 },
    { label: '在线模型', value: '9 / 12' },
    { label: '待上线模型', value: 3 },
    { label: '本月新接入', value: 4 },
    { label: '待审核申请', value: 2 },
    { label: '网关接入率', value: '100%' },
  ],
  providers: [
    { key: 'baidu', name: '百度', color: '#2932E1', region: '中国大陆', baseUrl: 'https://qianfan.baidubce.com/v2', protocol: 'OpenAI 兼容', credential: 'sk-bd-****3f1a', credentialExpires: '2027-06-30', lastCheck: '08-20 10:24', latency: 480, successRate: 99.6, calls7d: 81243, balance: 3120, balanceWarn: false, status: 'online' },
    { key: 'aliyun', name: '阿里云', color: '#FF6A00', region: '中国大陆', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', protocol: 'OpenAI 兼容', credential: 'sk-qs-****8c22', credentialExpires: '2026-11-15', lastCheck: '08-20 10:21', latency: 620, successRate: 99.2, calls7d: 58610, balance: 208.5, balanceWarn: true, status: 'warn' },
    { key: 'bytedance', name: '字节豆包', color: '#325AB4', region: '中国大陆', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', protocol: 'OpenAI 兼容', credential: 'sk-vk-****02ab', credentialExpires: '2027-02-28', lastCheck: '08-20 10:25', latency: 410, successRate: 99.8, calls7d: 102480, balance: 15000, balanceWarn: false, status: 'online' },
    { key: 'tencent', name: '腾讯混元', color: '#0052D9', region: '中国大陆', baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1', protocol: 'OpenAI 兼容', credential: 'sk-hy-****77fe', credentialExpires: '2027-08-01', lastCheck: '08-20 10:20', latency: 580, successRate: 99.4, calls7d: 32850, balance: 6800, balanceWarn: false, status: 'online' },
    { key: 'zhipu', name: '智谱GLM', color: '#3859FF', region: '中国大陆', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', protocol: 'OpenAI 兼容', credential: 'sk-zp-****90e3', credentialExpires: '2026-09-30', lastCheck: '08-20 10:18', latency: 720, successRate: 99.1, calls7d: 21970, balance: 430, balanceWarn: true, status: 'warn' },
    { key: 'moonshot', name: '月之暗面', color: '#171717', region: '中国大陆', baseUrl: 'https://api.moonshot.cn/v1', protocol: 'OpenAI 兼容', credential: 'sk-kk-****11d9', credentialExpires: '2026-12-12', lastCheck: '08-20 10:22', latency: 890, successRate: 99.5, calls7d: 9640, balance: 1260, balanceWarn: false, status: 'online' },
    { key: 'deepseek', name: 'DeepSeek', color: '#4D6BFE', region: '中国大陆', baseUrl: 'https://api.deepseek.com/v1', protocol: 'OpenAI 兼容', credential: 'sk-ds-****5b77', credentialExpires: '2027-03-20', lastCheck: '08-20 10:23', latency: 360, successRate: 99.7, calls7d: 70500, balance: 9200, balanceWarn: false, status: 'online' },
  ],
  models: [
    { key: 'ernie-4.0', name: '文心ERNIE 4.0', providerKey: 'baidu', apiType: 'chat', series: 'Pro', priceIn: 9, priceOut: 30, contextWindow: 128, maxOutput: 8, owner: '陈工', applyAt: '2026-07-02', status: 'online' },
    { key: 'ernie-speed', name: '文心ERNIE Speed', providerKey: 'baidu', apiType: 'chat', series: 'Flash', priceIn: 0.8, priceOut: 2, contextWindow: 128, maxOutput: 8, owner: '陈工', applyAt: '2026-06-15', status: 'online' },
    { key: 'qwen-max', name: '通义千问MAX', providerKey: 'aliyun', apiType: 'chat', series: 'Pro', priceIn: 9.5, priceOut: 28, contextWindow: 128, maxOutput: 8, owner: '李工', applyAt: '2026-06-20', status: 'online' },
    { key: 'qwen-plus', name: '通义千问Plus', providerKey: 'aliyun', apiType: 'chat', series: 'Flash', priceIn: 2, priceOut: 8, contextWindow: 128, maxOutput: 8, owner: '李工', applyAt: '2026-05-08', status: 'online' },
    { key: 'doubao-pro', name: '豆包Pro', providerKey: 'bytedance', apiType: 'chat', series: 'Pro', priceIn: 5, priceOut: 20, contextWindow: 256, maxOutput: 8, owner: '王工', applyAt: '2026-07-18', status: 'online' },
    { key: 'doubao-lite', name: '豆包Lite', providerKey: 'bytedance', apiType: 'chat', series: 'Flash', priceIn: 0.3, priceOut: 0.6, contextWindow: 128, maxOutput: 8, owner: '王工', applyAt: '2026-04-28', status: 'online' },
    { key: 'doubao-embedding', name: '豆包Embedding', providerKey: 'bytedance', apiType: 'embedding', series: 'Flash', priceIn: 0.1, priceOut: 0.1, contextWindow: 24, maxOutput: 2, owner: '王工', applyAt: '2026-08-19', status: 'pending' },
    { key: 'hunyuan-turbo', name: '混元Turbo', providerKey: 'tencent', apiType: 'chat', series: 'Flash', priceIn: 4, priceOut: 12, contextWindow: 128, maxOutput: 8, owner: '赵工', applyAt: '2026-06-25', status: 'online' },
    { key: 'glm-4', name: 'GLM-4', providerKey: 'zhipu', apiType: 'chat', series: 'Pro', priceIn: 2.5, priceOut: 15, contextWindow: 128, maxOutput: 8, owner: '陈工', applyAt: '2026-07-11', status: 'online' },
    { key: 'glm-4v', name: 'GLM-4V', providerKey: 'zhipu', apiType: 'image', series: 'Flash', priceIn: 4, priceOut: 4, contextWindow: 128, maxOutput: 8, owner: '陈工', applyAt: '2026-03-30', status: 'offline' },
    { key: 'kimi', name: 'Kimi', providerKey: 'moonshot', apiType: 'chat', series: 'Pro', priceIn: 12, priceOut: 12, contextWindow: 128, maxOutput: 16, owner: '钱工', applyAt: '2026-08-17', status: 'pending' },
    { key: 'deepseek-chat', name: 'DeepSeek Chat', providerKey: 'deepseek', apiType: 'chat', series: 'Flash', priceIn: 0.5, priceOut: 2, contextWindow: 128, maxOutput: 8, owner: '孙工', applyAt: '2026-05-22', status: 'online' },
  ],
  reviews: [
    { id: 1, applicant: '王工', modelKey: 'doubao-embedding', modelName: '豆包Embedding', providerName: '字节豆包', action: '接入上线', time: '08-19 16:40', status: 'pending' },
    { id: 2, applicant: '钱工', modelKey: 'kimi', modelName: 'Kimi', providerName: '月之暗面', action: '接入上线', time: '08-17 11:05', status: 'pending' },
    { id: 3, applicant: '李工', modelKey: 'qwen-max', modelName: '通义千问MAX', providerName: '阿里云', action: '提价维护', time: '08-12 09:30', status: 'approved' },
    { id: 4, applicant: '陈工', modelKey: 'ernie-4.0', modelName: '文心ERNIE 4.0', providerName: '百度', action: '接入上线', time: '08-02 14:18', status: 'approved' },
    { id: 5, applicant: '王工', modelKey: 'doubao-pro', modelName: '豆包Pro', providerName: '字节豆包', action: '接入上线', time: '07-29 10:52', status: 'approved' },
  ],
  onboard: [
    { title: '提交接入申请', desc: '填写供应商 / 模型信息，选择协议类型（对话 / 向量 / 图像），说明用途与预估量级。' },
    { title: '密钥托管', desc: '厂商密钥录入平台密钥库，明文不出网，客户端只拿产品级 Key。' },
    { title: '接入统一网关', desc: '平台 /v1 统一收口，配额与审计在网关前置，产品侧 Base URL 一致、零改造。' },
    { title: '灰度上线', desc: '小流量验证健康度与账单，确认无误后全量放开并纳入报表。' },
  ],
  accessSpec: [
    { item: 'Base URL', spec: 'https://llm-audit.example.com/v1', note: '所有客户端统一指向平台网关' },
    { item: '认证方式', spec: 'Bearer tl_ak_xxxxxxxx（产品 Key，非厂商密钥）', note: '由网关映射到真实供应商凭证' },
    { item: '模型命名', spec: 'provider.model 前缀透传，如 deepseek-chat', note: '映射后台模型注册表' },
    { item: '协议兼容', spec: 'OpenAI Chat Completions / Embeddings / Images', note: '厂商私有协议由网关适配层转换' },
    { item: '配额前置', spec: '业务线→产品→周期用量责任链拦截', note: '对应配额网关页' },
    { item: '可观测性', spec: '全量写入调用明细 + 审计中心', note: '账单统一到月底对账' },
  ],
}

export {
  businessLines,
  products,
  providers,
  models,
  apiTypes,
  modelProfiles,
  constraintModes,
  errorCodes,
  workbench,
  businessStats,
  providerStats,
  modelStats,
  apiStats,
  callLogs,
  costReport,
  companyStats,
  tokenLimitDemo,
  providerModelDemo,
}