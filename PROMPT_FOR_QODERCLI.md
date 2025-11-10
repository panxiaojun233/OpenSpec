我需要为 OpenSpec 项目添加支付系统功能。

## 📋 需求描述

实现完整的支付系统,包含:
- Stripe 支付网关集成
- 订单创建和管理
- 支付安全和风险控制
- 交易历史记录和对账

## 🎯 重要约束(基于 lessons-learned 经验)

请务必遵循 `openspec/specs/lessons-learned/spec.md` 中的经验教训:

1. **任务数控制**: 控制在 10-15 个以内
   - 原因: 历史数据显示35个任务导致延期2天

2. **安全设计**: 必须包含完整的设计文档和安全审查计划
   - 原因: 支付属于安全敏感变更,需要 PCI DSS 合规

3. **文档前置**: 文档任务(design.md)必须在开发任务之前
   - 原因: 历史上文档任务易被遗漏

4. **第三方集成**: Stripe 集成时间预留 1.5 倍
   - 原因: 第三方服务集成历史上经常超时

## 📂 请创建以下文件

### 1. openspec/changes/implement-payment-system/proposal.md
- 变更提案和背景
- 目标和范围
- 风险评估

### 2. openspec/changes/implement-payment-system/design.md
- 技术架构设计
- 支付安全设计(PCI DSS 合规)
- Stripe 集成方案
- 数据流和状态机

### 3. openspec/changes/implement-payment-system/tasks.md
- 任务分解(严格控制在 10-15 个)
- 时间估算(Stripe 集成记得 × 1.5)
- 将设计和文档任务放在最前面
- 使用格式: `- [ ] Task Name (估算: Xh)`

### 4. openspec/changes/implement-payment-system/specs/payment/spec.md
- 支付系统的完整 spec delta
- 使用 ADDED Requirements 格式
- 每个 Requirement 包含清晰的 Scenarios

## ✅ 验收标准

生成的变更应该体现:
- ✅ 任务总数 ≤ 15
- ✅ 包含完整的 design.md
- ✅ 包含安全审查和测试任务
- ✅ 文档任务在开发任务之前
- ✅ Stripe 集成时间合理(不少于 8h)

请开始工作吧!
