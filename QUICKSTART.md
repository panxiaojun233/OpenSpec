# 🚀 快速开始:使用 qodercli 实践反思闭环

## 一、准备工作(已完成✅)

- ✅ 反思引擎已实现
- ✅ 第一轮变更(认证系统)已归档
- ✅ lessons-learned spec 已生成,包含4条经验教训
- ✅ 提示词已准备好

## 二、开始实践(3步完成)

### Step 1: 启动 qodercli

```bash
# 在新终端中运行
qodercli
```

### Step 2: 复制提示词

打开文件 `PROMPT_FOR_QODERCLI.md`,复制全部内容粘贴到 qodercli

或者直接复制下面的内容:

---

我需要为 OpenSpec 项目添加支付系统功能。

📋 **需求描述**:
- Stripe 支付网关集成
- 订单创建和管理
- 支付安全和风险控制
- 交易历史记录和对账

🎯 **重要约束**(基于 openspec/specs/lessons-learned/spec.md):

1. 任务数控制在 10-15 个以内(历史:35任务→延期2天)
2. 必须包含设计文档和安全审查(支付属于安全敏感)
3. 文档任务前置(历史:文档易遗漏)
4. Stripe集成时间 × 1.5(第三方集成易超时)

📂 **请创建**:
1. openspec/changes/implement-payment-system/proposal.md
2. openspec/changes/implement-payment-system/design.md(包含PCI DSS合规)
3. openspec/changes/implement-payment-system/tasks.md(≤15任务,文档前置)
4. openspec/changes/implement-payment-system/specs/payment/spec.md

✅ **验收**: 任务≤15、有design.md、有安全审查、文档前置、Stripe时间合理

---

### Step 3: 验证效果

运行验证脚本:

```bash
./run_qodercli_practice.sh
```

或手动检查:

```bash
# 检查任务数
grep -c "^- \[" openspec/changes/implement-payment-system/tasks.md

# 检查设计文档
ls openspec/changes/implement-payment-system/design.md

# 检查安全相关
grep -i "security\|安全\|PCI" openspec/changes/implement-payment-system/design.md
```

## 三、预期效果对比

| 指标 | 第一轮(未反思) | 第二轮(应用反思) | 提升 |
|------|---------------|----------------|------|
| 任务数 | 35个 | ≤15个 | **-57%** |
| 设计文档 | ❌ | ✅ | **新增** |
| 安全审查 | ❌ | ✅ | **新增** |
| 文档完成率 | 97% | 100% | **+3%** |
| 预期延期 | 2天 | 0天 | **-100%** |

## 四、核心价值

```
┌─────────────────────────────────────────┐
│   AI Agent 具备组织记忆能力            │
├─────────────────────────────────────────┤
│                                         │
│  历史变更 → 反思分析 → 沉淀spec         │
│       ↓                                 │
│  新变更时自动应用经验                    │
│       ↓                                 │
│  效率提升、质量提升、风险降低            │
│       ↓                                 │
│  持续学习、持续改进                     │
│                                         │
└─────────────────────────────────────────┘
```

## 五、故障排除

**Q: qodercli 未找到?**
```bash
# 检查安装
which qodercli
# 或使用完整路径
/Users/pxj233/.local/bin/qodercli
```

**Q: 任务数超过15个?**
- 提醒 Agent 严格遵循 lessons-learned 中的经验
- 让 Agent 将变更拆分为多个阶段

**Q: 缺少设计文档?**
- 强调支付是安全敏感变更,必须有 design.md
- 参考 lessons-learned 中的要求

## 六、下一步

完成后可以:

1. **归档变更**: `mv openspec/changes/implement-payment-system openspec/changes/archived/`
2. **运行反思**: `npm run cli reflect -- --save`
3. **查看新经验**: `cat openspec/specs/lessons-learned/spec.md`
4. **开始第三轮**: 应用更多经验,持续改进

---

🎉 **开始实践吧!** 见证 AI Agent 如何从历史中学习并应用经验!
