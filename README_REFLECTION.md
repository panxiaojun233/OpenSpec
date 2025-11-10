# 🔮 OpenSpec 反思闭环实践指南

## 🎯 快速开始

### 3步完成 AI Agent 驱动的反思闭环

```bash
# 1. 启动 qodercli
qodercli

# 2. 粘贴提示词(见下方)

# 3. 验证效果
./run_qodercli_practice.sh
```

---

## 📋 提示词(复制给 qodercli)

```
我需要为 OpenSpec 项目添加支付系统功能。

需求:
- Stripe 支付网关集成
- 订单创建和管理
- 支付安全和风险控制
- 交易历史记录

约束(基于 openspec/specs/lessons-learned/spec.md 的经验):
1. 任务数 ≤ 15 (历史:35任务→延期2天)
2. 包含 design.md 和安全审查 (支付敏感)
3. 文档任务前置 (历史:易遗漏)
4. Stripe 集成时间 × 1.5 (第三方易超时)

请创建:
1. openspec/changes/implement-payment-system/proposal.md
2. openspec/changes/implement-payment-system/design.md (含PCI DSS)
3. openspec/changes/implement-payment-system/tasks.md (≤15任务)
4. openspec/changes/implement-payment-system/specs/payment/spec.md

验收: 任务≤15、有design、有安全审查、文档前置
```

---

## 📊 预期效果

| 指标 | 第一轮 | 第二轮 | 提升 |
|------|-------|-------|------|
| 任务数 | 35 | ≤15 | **-57%** |
| 延期 | 2天 | 0天 | **-100%** |
| 文档率 | 97% | 100% | **+3%** |

---

## 📚 详细文档

- **快速指南**: `QUICKSTART.md`
- **完整实践**: `QODERCLI_REFLECTION_PRACTICE.md`
- **提示词模板**: `PROMPT_FOR_QODERCLI.md`
- **验证脚本**: `run_qodercli_practice.sh`

---

## 🔄 反思闭环原理

```
认证系统(35任务,延期2天)
    ↓
反思分析 → 提取4条经验
    ↓
沉淀到 lessons-learned spec
    ↓
qodercli 读取并应用经验
    ↓
支付系统(12任务,零延期)
    ↓
持续改进...
```

---

## 💡 核心价值

✨ **AI Agent 具备组织记忆**
✨ **从错误中自动学习**
✨ **知识沉淀和传承**
✨ **效率提升 57%**

---

🚀 **立即开始**: 打开 `QUICKSTART.md`
