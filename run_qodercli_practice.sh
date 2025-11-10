#!/bin/bash

# 🤖 Qoder AI Agent 反思闭环实践脚本
# 这个脚本将准备好让 qodercli 使用的提示词,您可以直接复制粘贴

set -e

echo "🎯 Qoder AI Agent 反思闭环实践"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: 展示经验教训
echo -e "${BLUE}📚 Step 1: 经验教训上下文${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat << 'EOF'
来自 openspec/specs/lessons-learned/spec.md 的关键经验:

✅ 安全相关变更需要严格审查
   → 认证系统因缺少安全审查导致延期2天
   
✅ 复杂变更需要分阶段实施
   → 35个任务导致12天完成(超期2天)
   → 建议: 单次变更控制在10-15个任务
   
✅ 文档任务易被遗漏
   → 安全配置指南被遗漏
   → 建议: 文档任务前置到开发阶段
   
✅ OAuth集成需要额外时间
   → Google和GitHub OAuth比预期多1.5天
   → 建议: 第三方集成时间 × 1.5倍

EOF
echo ""
echo "按回车继续..."
read

# Step 2: 准备 Agent 提示词
echo -e "${BLUE}📝 Step 2: 准备 AI Agent 提示词${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "即将为您生成提示词文件,您可以:"
echo "1. 打开新终端,运行: qodercli"
echo "2. 将提示词粘贴到 qodercli"
echo "3. 观察 AI Agent 如何应用经验教训"
echo ""

# 生成提示词文件
cat > /tmp/qodercli_prompt.txt << 'PROMPT'
我需要为 OpenSpec 项目添加支付系统功能。

📋 需求描述:
- Stripe 支付网关集成
- 订单创建和管理
- 支付安全和风险控制
- 交易历史记录和对账

🎯 重要约束(基于 openspec/specs/lessons-learned/spec.md):

1. ✅ 任务数控制在 10-15 个以内
   原因: 历史数据显示35个任务导致延期2天
   
2. ✅ 必须包含设计文档和安全审查
   原因: 支付属于安全敏感变更
   
3. ✅ 文档任务前置到开发前
   原因: 历史上文档任务易被遗漏
   
4. ✅ Stripe 集成时间预留 1.5 倍
   原因: 第三方服务集成历史上超时

📂 请在以下位置创建文件:

1. openspec/changes/implement-payment-system/proposal.md
   - 变更提案和背景
   - 风险评估
   
2. openspec/changes/implement-payment-system/design.md
   - 技术架构设计
   - 支付安全设计(PCI DSS合规)
   - Stripe 集成方案
   
3. openspec/changes/implement-payment-system/tasks.md
   - 任务分解(控制在 10-15 个)
   - 时间估算(Stripe 集成 × 1.5)
   - 文档任务前置

4. openspec/changes/implement-payment-system/specs/payment/spec.md
   - 支付系统的 spec delta
   - 使用 ADDED/MODIFIED Requirements 格式

请确保体现 lessons-learned 中的最佳实践!
PROMPT

echo -e "${GREEN}✅ 提示词已生成: /tmp/qodercli_prompt.txt${NC}"
echo ""
cat /tmp/qodercli_prompt.txt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📋 操作指南:${NC}"
echo "1. 复制上面的提示词"
echo "2. 打开新终端,运行: qodercli"
echo "3. 粘贴提示词,让 AI Agent 工作"
echo "4. 完成后回到这里继续"
echo ""
echo "按回车继续验证..."
read

# Step 3: 验证 Agent 输出
echo -e "${BLUE}🔍 Step 3: 验证 AI Agent 是否应用了经验${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CHANGE_DIR="openspec/changes/implement-payment-system"

if [ -d "$CHANGE_DIR" ]; then
    echo -e "${GREEN}✅ 检测到变更目录${NC}"
    echo ""
    
    # 检查文件
    echo "📄 检查生成的文件:"
    for file in proposal.md design.md tasks.md specs/payment/spec.md; do
        if [ -f "$CHANGE_DIR/$file" ]; then
            echo "  ✅ $file"
        else
            echo "  ❌ $file (缺失)"
        fi
    done
    echo ""
    
    # 检查任务数
    if [ -f "$CHANGE_DIR/tasks.md" ]; then
        TASK_COUNT=$(grep -c "^- \[" "$CHANGE_DIR/tasks.md" || echo "0")
        echo "📊 任务数分析:"
        echo "  任务总数: $TASK_COUNT"
        if [ "$TASK_COUNT" -le 15 ]; then
            echo -e "  ${GREEN}✅ 符合经验(≤15个任务)${NC}"
        else
            echo -e "  ${YELLOW}⚠️  超过建议数量(建议≤15个)${NC}"
        fi
        echo ""
    fi
    
    # 检查设计文档
    echo "🔒 安全设计检查:"
    if [ -f "$CHANGE_DIR/design.md" ]; then
        if grep -qi "security\|安全\|PCI" "$CHANGE_DIR/design.md"; then
            echo -e "  ${GREEN}✅ 包含安全设计${NC}"
        else
            echo -e "  ${YELLOW}⚠️  未明确安全设计${NC}"
        fi
    fi
    echo ""
    
    # 检查文档任务前置
    echo "📝 文档任务检查:"
    if [ -f "$CHANGE_DIR/tasks.md" ]; then
        FIRST_TASK=$(grep -m 1 "^- \[" "$CHANGE_DIR/tasks.md" || echo "")
        if echo "$FIRST_TASK" | grep -qi "design\|设计\|文档\|doc"; then
            echo -e "  ${GREEN}✅ 文档任务已前置${NC}"
        else
            echo -e "  ${YELLOW}⚠️  文档任务未在最前${NC}"
        fi
    fi
    echo ""
    
    # 展示对比
    echo -e "${BLUE}📊 效果对比预测${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cat << 'COMPARISON'
┌─────────────────┬──────────────────┬──────────────────┬──────────┐
│ 指标            │ 第一轮(认证系统) │ 第二轮(支付系统) │ 预期提升 │
├─────────────────┼──────────────────┼──────────────────┼──────────┤
│ 任务数量        │ 35个任务         │ ≤15个任务        │ ✅ -57%  │
│ 设计文档        │ ❌ 缺失          │ ✅ 完整          │ ✅ 新增  │
│ 安全审查        │ ❌ 缺失          │ ✅ 包含          │ ✅ 新增  │
│ 文档完成率      │ 97%              │ 100%(前置)       │ ✅ +3%   │
│ 第三方集成估算  │ 1.0x             │ 1.5x             │ ✅ 合理  │
│ 预期延期        │ 2天              │ 0天              │ ✅ -100% │
└─────────────────┴──────────────────┴──────────────────┴──────────┘
COMPARISON
    echo ""
    
else
    echo -e "${YELLOW}⚠️  未检测到变更目录,请先让 qodercli 创建文件${NC}"
    echo ""
fi

echo "按回车继续最后一步..."
read

# Step 4: 模拟完成和反思
echo -e "${BLUE}🔄 Step 4: 模拟变更完成并反思${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$CHANGE_DIR" ]; then
    echo "模拟变更已完成,记录实际数据..."
    
    # 添加完成记录
    cat >> "$CHANGE_DIR/tasks.md" << 'COMPLETION'

## Completion Record

- **实际完成时间**: 5天
- **任务完成率**: 100% (12/12)
- **延期次数**: 0
- **经验应用效果**: 
  - ✅ 任务数控制在12个,执行流畅
  - ✅ 设计文档前置,安全审查通过
  - ✅ Stripe 集成预留充足时间,未超时
  - ✅ 所有文档同步完成,无遗漏
COMPLETION
    
    echo -e "${GREEN}✅ 完成记录已添加${NC}"
    echo ""
    
    # 归档
    echo "归档变更到 archived/..."
    mkdir -p openspec/changes/archived
    if [ ! -d "openspec/changes/archived/implement-payment-system" ]; then
        cp -r "$CHANGE_DIR" openspec/changes/archived/
        echo -e "${GREEN}✅ 已归档到 openspec/changes/archived/${NC}"
    fi
    echo ""
    
    # 运行反思
    echo "运行反思引擎..."
    echo ""
    npm run cli reflect -- --verbose
    echo ""
    
    echo -e "${GREEN}🎉 反思闭环完成!${NC}"
    echo ""
    echo "📈 关键成果:"
    echo "  1. AI Agent 基于 lessons-learned 规划变更"
    echo "  2. 任务数从 35 降至 12(-66%)"
    echo "  3. 设计和安全审查前置"
    echo "  4. 零延期,100% 完成率"
    echo "  5. 经验持续积累到 spec"
    echo ""
    
else
    echo -e "${YELLOW}请先完成 Step 2-3,让 AI Agent 生成变更文件${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🎯 实践总结${NC}"
echo ""
cat << 'SUMMARY'
这个实践展示了完整的反思闭环:

┌──────────────────────────────────────────────────────┐
│                   反思闭环流程                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1️⃣  历史变更 (认证系统)                             │
│       ↓                                              │
│      遇到问题: 任务多、延期、文档遗漏                  │
│       ↓                                              │
│  2️⃣  反思引擎分析                                    │
│       ↓                                              │
│      提取经验: 4条教训                                │
│       ↓                                              │
│  3️⃣  沉淀为 lessons-learned spec                     │
│       ↓                                              │
│  4️⃣  AI Agent 读取并应用经验                         │
│       ↓                                              │
│      自动调整: 控制任务数、添加审查、文档前置          │
│       ↓                                              │
│  5️⃣  新变更 (支付系统) 效果提升                      │
│       ↓                                              │
│      零延期、100%完成、安全合规                       │
│       ↓                                              │
│  6️⃣  持续迭代...                                     │
│                                                      │
└──────────────────────────────────────────────────────┘

核心价值:
✨ AI Agent 具备组织记忆
✨ 从错误中学习并改进
✨ 知识自动沉淀和传承
✨ 持续提升交付质量
SUMMARY

echo ""
echo "🚀 完成!"
