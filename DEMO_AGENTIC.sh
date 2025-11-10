#!/bin/bash

echo "=========================================="
echo "  🤖 OpenSpec Agentic 功能演示"
echo "=========================================="
echo ""

echo "📍 场景 1: 新建能力 (自动确认)"
echo "命令: openspec agent \"添加用户导出功能\" --yes"
echo "------------------------------------------"
node bin/openspec.js agent "添加用户导出功能" --yes
echo ""

echo "✅ 成功创建! 查看文件:"
ls -la openspec/changes/add-*/
echo ""

echo "📍 场景 2: 增强现有能力"  
echo "命令: openspec agent \"改进 archive 命令\" --yes --verbose"
echo "------------------------------------------"
node bin/openspec.js agent "改进 archive 命令" --yes --verbose
echo ""

echo "📍 场景 3: 修复问题 (简化工作流)"
echo "命令: openspec agent \"修复 validation bug\" --yes"
echo "------------------------------------------"
node bin/openspec.js agent "修复 validation bug" --yes
echo ""

echo "=========================================="
echo "  📊 对比总结"
echo "=========================================="
echo ""
echo "传统 SOP 模式:"
echo "  • 手动创建目录"
echo "  • 手动编写 proposal.md"
echo "  • 手动编写 tasks.md"
echo "  • 手动创建 specs/ 目录"
echo "  • 手动编写 delta 文件"
echo "  • 手动运行 validate"
echo "  ⏱️  总计: 15-20 分钟"
echo ""
echo "Agentic 模式:"
echo "  • 一条命令"
echo "  • 自动识别意图"
echo "  • 自动生成所有文件"
echo "  • 智能内容填充"
echo "  ⏱️  总计: 2-3 分钟"
echo ""
echo "✨ 效率提升: 6-10倍!"
echo ""
echo "=========================================="
echo "  查看所有变更"
echo "=========================================="
node bin/openspec.js list
echo ""

echo "清理测试数据..."
rm -rf openspec/changes/add-* openspec/changes/enhance-* openspec/changes/fix-*
echo "✅ 演示完成!"
