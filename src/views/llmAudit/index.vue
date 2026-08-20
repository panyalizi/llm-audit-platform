<template>
  <div class="llm-audit">
    <!-- 左侧导航 -->
    <aside class="llm-audit-aside">
      <div class="llm-audit-logo">
        <span class="llm-audit-logo-badge">AI</span>
        <div class="llm-audit-logo-text">
          <strong>大模型调用审计</strong>
          <span>Token · 成本 · 审计</span>
        </div>
      </div>

      <nav class="llm-audit-nav">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="llm-audit-nav-item"
          :class="{ active: isActive(item.path) }"
          @click="$router.push(item.path)"
        >
          <el-icon :size="17"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <!-- 主区域 -->
    <div class="llm-audit-main">
      <header class="llm-audit-header">
        <div class="llm-audit-breadcrumb">
          <span>统一大模型API统计审计平台</span>
          <i class="el-icon llm-audit-breadcrumb-sep">›</i>
          <span class="llm-audit-breadcrumb-current">{{ currentTitle }}</span>
        </div>
        <div class="llm-audit-header-right">
          <span class="llm-audit-env-tag">生产环境</span>
          <el-dropdown>
            <span class="llm-audit-user">
              <span class="llm-audit-avatar">管</span>
              <span>平台管理员</span>
            </span>
          </el-dropdown>
        </div>
      </header>

      <main class="llm-audit-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { Odometer, TrendCharts, Document, Money, Guide, Search, Coin, Connection } from '@element-plus/icons-vue'

export default {
  name: 'llmAuditLayout',
  components: { Odometer, TrendCharts, Document, Money, Guide, Search, Coin, Connection },
  data() {
    return {
      navItems: [
        { path: '/llmAudit/workbench', label: '工作台', icon: 'Odometer' },
        { path: '/llmAudit/usage', label: '用量统计', icon: 'TrendCharts' },
        { path: '/llmAudit/logs', label: '调用明细', icon: 'Document' },
        { path: '/llmAudit/cost', label: '成本中心', icon: 'Money' },
        { path: '/llmAudit/openRouter', label: 'OpenRouter治理', icon: 'Guide' },
        { path: '/llmAudit/audit', label: '审计中心', icon: 'Search' },
        { path: '/llmAudit/tokenlimit', label: '配额网关', icon: 'Coin' },
        { path: '/llmAudit/providerModel', label: '供应商模型管理', icon: 'Connection' },
      ],
    }
  },
  computed: {
    currentTitle() {
      const item = this.navItems.find((x) => this.isActive(x.path))
      return item ? item.label : ''
    },
  },
  methods: {
    isActive(path) {
      return this.$route.matched?.some((r) => r.path === path || r.path === `${path}`)
        || this.$route.path === path
    },
  },
}
</script>

<style scoped lang="scss">
.llm-audit {
  display: flex;
  height: 100vh;
  background: #f2f4f7;
  overflow: hidden;

  &-aside {
    width: 220px;
    flex-shrink: 0;
    background: #18223c;
    display: flex;
    flex-direction: column;

    .llm-audit-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      &-badge {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #6c5ce7, #a29bfe);
        color: #fff;
        font-weight: 700;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      &-text {
        display: flex;
        flex-direction: column;
        line-height: 1.3;
        strong {
          color: #fff;
          font-size: 15px;
        }
        span {
          color: rgba(255, 255, 255, 0.45);
          font-size: 11px;
        }
      }
    }

    .llm-audit-nav {
      flex: 1;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      &-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 14px;
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        &.active {
          background: linear-gradient(90deg, #4f7cff, #6c5ce7);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(79, 124, 255, 0.35);
        }
      }

      &-icon {
        width: 18px;
        font-size: 16px;
        text-align: center;
      }
    }
  }

  &-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &-header {
    height: 56px;
    flex-shrink: 0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    .llm-audit-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #86909c;
      font-size: 13px;

      &-sep {
        font-style: normal;
        color: #c9cdd4;
      }

      &-current {
        color: #1d2129;
        font-weight: 600;
        font-size: 14px;
      }
    }

    &-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .llm-audit-env-tag {
      padding: 3px 10px;
      border-radius: 4px;
      background: #e8f3ff;
      color: #165dff;
      font-size: 12px;
    }

    .llm-audit-user {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #1d2129;
      font-size: 13px;

      .llm-audit-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #6c5ce7;
        color: #fff;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  &-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}
</style>