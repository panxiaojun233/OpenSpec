#!/bin/bash

# 🔮 OpenSpec 反思引擎演示
# 展示如何自动分析历史变更,提取经验教训并沉淀为 spec

echo "🔮 OpenSpec 反思引擎演示"
echo "======================================"
echo ""

# 1. 基础反思 - 分析历史变更
echo "1️⃣ 基础反思:分析历史归档变更"
echo "--------------------------------------"
node dist/cli/index.js reflect
echo ""

# 2. 详细模式 - 显示模式和洞察
echo "2️⃣ 详细模式:显示完整的模式分析"
echo "--------------------------------------"
node dist/cli/index.js reflect --verbose
echo ""

# 3. 保存为 spec - 沉淀经验知识
echo "3️⃣ 保存模式:将洞察沉淀为 lessons-learned spec"
echo "--------------------------------------"
node dist/cli/index.js reflect --save --verbose
echo ""

# 4. JSON 格式输出 - 供其他工具使用
echo "4️⃣ JSON 格式:结构化输出供 CI/CD 集成"
echo "--------------------------------------"
node dist/cli/index.js reflect --json | jq '.' 2>/dev/null || node dist/cli/index.js reflect --json
echo ""

echo "✅ 演示完成!"
echo ""
echo "💡 反思引擎的价值:"
echo "   • 自动识别成功模式和反模式"
echo "   • 量化分析变更效率和质量"
echo "   • 提供数据驱动的改进建议"
echo "   • 将经验沉淀为可复用的 spec 知识"
echo ""
echo "📖 查看生成的 spec:"
echo "   openspec/specs/lessons-learned/spec.md"
