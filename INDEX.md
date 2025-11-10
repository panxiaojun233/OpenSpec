# 📚 OpenSpec 反思闭环 - 文档索引

## 🚀 快速开始(推荐顺序)

### 1️⃣ 最快上手
- **[README_REFLECTION.md](README_REFLECTION.md)** - 3步完成反思闭环(最简洁)
- **[QUICKSTART.md](QUICKSTART.md)** - 快速开始指南(含故障排除)

### 2️⃣ 详细实践
- **[QODERCLI_REFLECTION_PRACTICE.md](QODERCLI_REFLECTION_PRACTICE.md)** - 完整实践指南(含效果对比)
- **[qodercli_agent_practice.md](qodercli_agent_practice.md)** - Agent 实践说明

### 3️⃣ 提示词模板
- **[PROMPT_FOR_QODERCLI.md](PROMPT_FOR_QODERCLI.md)** - 直接复制给 qodercli 的提示词

---

## 🛠️ 可执行脚本

### 验证和演示
- **[run_qodercli_practice.sh](run_qodercli_practice.sh)** - 自动验证 Agent 输出
- **[DEMO_REFLECTION_CYCLE.sh](DEMO_REFLECTION_CYCLE.sh)** - 完整反思闭环演示
- **[DEMO_REFLECT.sh](DEMO_REFLECT.sh)** - 反思引擎演示
- **[DEMO_AGENTIC.sh](DEMO_AGENTIC.sh)** - Agentic 功能演示

---

## 📖 背景文档

### 核心概念
- **[README.md](README.md)** - OpenSpec 项目总览
- **[AGENTS.md](AGENTS.md)** - Agentic 架构设计
- **[REFLECTION_SUMMARY.md](REFLECTION_SUMMARY.md)** - 反思引擎实现总结

### 技术文档
- **[docs/reflection-engine.md](docs/reflection-engine.md)** - 反思引擎详细文档
- **[CHANGELOG.md](CHANGELOG.md)** - 变更日志

---

## 🗂️ 实践数据

### 第一轮变更(认证系统)
```
openspec/changes/archived/implement-auth-system/
├── proposal.md          # 变更提案
├── design.md           # 技术设计
├── tasks.md            # 任务清单(35个任务,12天完成)
└── specs/
    └── authentication/
        └── spec.md     # Spec delta
```

### 经验沉淀
```
openspec/specs/lessons-learned/spec.md
├── 安全相关变更需要严格审查
├── 复杂变更需要分阶段实施
├── 文档任务易被遗漏
└── OAuth集成需要额外时间
```

### 第二轮变更(支付系统-待创建)
```
openspec/changes/implement-payment-system/
├── proposal.md
├── design.md
├── tasks.md            # 目标: ≤15个任务,5天完成
└── specs/
    └── payment/
        └── spec.md
```

---

## 📊 使用场景导航

### 场景1: 我想快速了解反思闭环
→ 阅读 **README_REFLECTION.md** (5分钟)

### 场景2: 我想动手实践
→ 阅读 **QUICKSTART.md** → 复制 **PROMPT_FOR_QODERCLI.md** → 启动 qodercli

### 场景3: 我想了解完整原理
→ 阅读 **QODERCLI_REFLECTION_PRACTICE.md**

### 场景4: 我想看实际效果
→ 运行 `./DEMO_REFLECTION_CYCLE.sh`

### 场景5: 我想验证 Agent 输出
→ 运行 `./run_qodercli_practice.sh`

### 场景6: 我想深入了解技术实现
→ 阅读 **docs/reflection-engine.md** 和 **REFLECTION_SUMMARY.md**

---

## 🎯 核心文件关系图

```
README_REFLECTION.md (入口)
    ↓
QUICKSTART.md (操作指南)
    ↓
PROMPT_FOR_QODERCLI.md (提示词)
    ↓
qodercli 创建文件
    ↓
run_qodercli_practice.sh (验证)
    ↓
QODERCLI_REFLECTION_PRACTICE.md (总结)
```

---

## 💡 推荐学习路径

### 路径A: 快速实践者
1. README_REFLECTION.md (3分钟)
2. 复制 PROMPT_FOR_QODERCLI.md
3. 启动 qodercli
4. 运行 run_qodercli_practice.sh

### 路径B: 深入理解者
1. QODERCLI_REFLECTION_PRACTICE.md (了解全貌)
2. docs/reflection-engine.md (技术细节)
3. 运行 DEMO_REFLECTION_CYCLE.sh (看效果)
4. 实际操作(QUICKSTART.md)

### 路径C: 理论探索者
1. AGENTS.md (理解 Agentic 设计)
2. REFLECTION_SUMMARY.md (实现总结)
3. 源码阅读(src/core/agent/)
4. 实践验证

---

## 🔗 相关链接

- **主项目**: [OpenSpec](README.md)
- **反思引擎**: [docs/reflection-engine.md](docs/reflection-engine.md)
- **经验库**: [openspec/specs/lessons-learned/spec.md](openspec/specs/lessons-learned/spec.md)
- **第一轮变更**: [openspec/changes/archived/implement-auth-system/](openspec/changes/archived/implement-auth-system/)

---

## ❓ 常见问题

**Q: 我应该从哪个文件开始?**
A: 从 **README_REFLECTION.md** 开始,3分钟快速了解

**Q: 提示词在哪里?**
A: **PROMPT_FOR_QODERCLI.md**,直接复制粘贴到 qodercli

**Q: 如何验证 Agent 输出?**
A: 运行 `./run_qodercli_practice.sh`

**Q: 效果对比数据在哪?**
A: **QODERCLI_REFLECTION_PRACTICE.md** 的"效果对比"章节

**Q: 如何运行完整演示?**
A: `./DEMO_REFLECTION_CYCLE.sh`

---

## 📞 需要帮助?

- 查看 **QUICKSTART.md** 的"故障排除"章节
- 阅读 **docs/reflection-engine.md** 的详细说明
- 参考第一轮变更的实际数据

---

**更新时间**: 2025-11-10  
**版本**: v1.0 - 反思闭环实践版

🎉 **开始您的反思闭环之旅吧!**
