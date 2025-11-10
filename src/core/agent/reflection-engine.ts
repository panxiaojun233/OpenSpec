/**
 * Reflection Engine
 * 反思引擎 - 自动总结和沉淀经验
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface ChangeRecord {
  id: string;
  archivedDate: string;
  intent: string;
  complexity: string;
  affectedSpecs: string[];
  tasksTotal: number;
  tasksCompleted: number;
  hadIssues: boolean;
  timeToComplete?: number; // 小时
}

export interface Pattern {
  type: 'success' | 'antipattern';
  name: string;
  description: string;
  examples: string[];
  frequency: number;
  confidence: number;
}

export interface Insight {
  category: 'efficiency' | 'quality' | 'risk' | 'best_practice';
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
}

export interface ReflectionReport {
  summary: {
    totalChanges: number;
    successRate: number;
    avgTimeToComplete: number;
    commonPatterns: string[];
  };
  patterns: Pattern[];
  insights: Insight[];
  recommendations: string[];
}

/**
 * 反思引擎
 * 分析历史变更,提取模式和洞察
 */
export class ReflectionEngine {
  private projectPath: string;
  private archiveDir: string;

  constructor(projectPath: string = '.') {
    this.projectPath = projectPath;
    this.archiveDir = path.join(projectPath, 'openspec', 'changes', 'archive');
  }

  /**
   * 执行反思分析
   */
  async reflect(): Promise<ReflectionReport> {
    // 1. 收集历史变更数据
    const records = await this.collectChangeRecords();

    if (records.length === 0) {
      return this.emptyReport();
    }

    // 2. 分析模式
    const patterns = this.analyzePatterns(records);

    // 3. 生成洞察
    const insights = this.generateInsights(records, patterns);

    // 4. 生成建议
    const recommendations = this.generateRecommendations(insights, patterns);

    // 5. 汇总统计
    const summary = this.summarize(records);

    return {
      summary,
      patterns,
      insights,
      recommendations
    };
  }

  /**
   * 收集变更记录
   */
  private async collectChangeRecords(): Promise<ChangeRecord[]> {
    const records: ChangeRecord[] = [];

    try {
      const entries = await fs.readdir(this.archiveDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        // 解析归档文件夹名称: YYYY-MM-DD-change-id
        const match = entry.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
        if (!match) continue;

        const [, archivedDate, changeId] = match;
        const changePath = path.join(this.archiveDir, entry.name);

        try {
          const record = await this.analyzeChange(changePath, changeId, archivedDate);
          records.push(record);
        } catch {
          // 跳过无法分析的变更
        }
      }
    } catch {
      // archive 目录不存在
    }

    return records;
  }

  /**
   * 分析单个变更
   */
  private async analyzeChange(
    changePath: string,
    changeId: string,
    archivedDate: string
  ): Promise<ChangeRecord> {
    // 读取 proposal.md 识别意图
    const proposalPath = path.join(changePath, 'proposal.md');
    let intent = 'unknown';
    let complexity = 'medium';

    try {
      const proposalContent = await fs.readFile(proposalPath, 'utf-8');
      
      // 从 Impact 部分提取复杂度
      const complexityMatch = proposalContent.match(/Complexity:\s*(\w+)/i);
      if (complexityMatch) {
        complexity = complexityMatch[1].toLowerCase();
      }

      // 从内容推断意图
      const lowerContent = proposalContent.toLowerCase();
      if (lowerContent.includes('new') || lowerContent.includes('add')) {
        intent = 'new_capability';
      } else if (lowerContent.includes('enhance') || lowerContent.includes('improve')) {
        intent = 'enhance';
      } else if (lowerContent.includes('fix') || lowerContent.includes('bug')) {
        intent = 'fix';
      } else if (lowerContent.includes('refactor')) {
        intent = 'refactor';
      }
    } catch {
      // proposal 不存在
    }

    // 读取 tasks.md 统计任务
    const tasksPath = path.join(changePath, 'tasks.md');
    let tasksTotal = 0;
    let tasksCompleted = 0;

    try {
      const tasksContent = await fs.readFile(tasksPath, 'utf-8');
      const taskLines = tasksContent.match(/- \[[x ]\]/gi);
      if (taskLines) {
        tasksTotal = taskLines.length;
        tasksCompleted = taskLines.filter(line => line.includes('[x]')).length;
      }
    } catch {
      // tasks 不存在
    }

    // 检查是否有 specs 更新
    const specsDir = path.join(changePath, 'specs');
    const affectedSpecs: string[] = [];

    try {
      const specEntries = await fs.readdir(specsDir, { withFileTypes: true });
      for (const spec of specEntries) {
        if (spec.isDirectory()) {
          affectedSpecs.push(spec.name);
        }
      }
    } catch {
      // specs 不存在
    }

    // 判断是否有问题(任务未完成比例)
    const hadIssues = tasksTotal > 0 && tasksCompleted / tasksTotal < 0.9;

    return {
      id: changeId,
      archivedDate,
      intent,
      complexity,
      affectedSpecs,
      tasksTotal,
      tasksCompleted,
      hadIssues
    };
  }

  /**
   * 分析模式
   */
  private analyzePatterns(records: ChangeRecord[]): Pattern[] {
    const patterns: Pattern[] = [];

    // 模式 1: 高效的简单变更
    const simpleChanges = records.filter(r => r.complexity === 'simple' || r.complexity === 'low');
    if (simpleChanges.length >= 3) {
      const successRate = simpleChanges.filter(r => !r.hadIssues).length / simpleChanges.length;
      if (successRate > 0.8) {
        patterns.push({
          type: 'success',
          name: '简单变更高效模式',
          description: '简单/低复杂度的变更通常完成度高且快速',
          examples: simpleChanges.slice(0, 3).map(r => r.id),
          frequency: simpleChanges.length,
          confidence: successRate
        });
      }
    }

    // 模式 2: Auth 相关变更需要额外关注
    const authChanges = records.filter(r => 
      r.affectedSpecs.some(s => s.includes('auth')) ||
      r.id.includes('auth')
    );
    if (authChanges.length >= 2) {
      const hadIssuesRate = authChanges.filter(r => r.hadIssues).length / authChanges.length;
      if (hadIssuesRate > 0.3) {
        patterns.push({
          type: 'antipattern',
          name: '认证相关变更风险较高',
          description: '涉及认证的变更容易出现问题,需要更严格的审查',
          examples: authChanges.filter(r => r.hadIssues).map(r => r.id),
          frequency: authChanges.length,
          confidence: hadIssuesRate
        });
      }
    }

    // 模式 3: 跨多个 spec 的变更复杂度高
    const multiSpecChanges = records.filter(r => r.affectedSpecs.length > 2);
    if (multiSpecChanges.length >= 2) {
      const hadIssuesRate = multiSpecChanges.filter(r => r.hadIssues).length / multiSpecChanges.length;
      if (hadIssuesRate > 0.4) {
        patterns.push({
          type: 'antipattern',
          name: '跨多个 spec 的变更容易失控',
          description: '影响超过 2 个 spec 的变更往往复杂度被低估',
          examples: multiSpecChanges.slice(0, 3).map(r => r.id),
          frequency: multiSpecChanges.length,
          confidence: hadIssuesRate
        });
      }
    }

    // 模式 4: 修复类变更通常快速
    const fixChanges = records.filter(r => r.intent === 'fix');
    if (fixChanges.length >= 3) {
      const avgTasks = fixChanges.reduce((sum, r) => sum + r.tasksTotal, 0) / fixChanges.length;
      if (avgTasks < 5) {
        patterns.push({
          type: 'success',
          name: '修复类变更精简高效',
          description: 'Bug 修复类变更通常任务少且聚焦',
          examples: fixChanges.slice(0, 3).map(r => r.id),
          frequency: fixChanges.length,
          confidence: 0.85
        });
      }
    }

    return patterns;
  }

  /**
   * 生成洞察
   */
  private generateInsights(records: ChangeRecord[], patterns: Pattern[]): Insight[] {
    const insights: Insight[] = [];

    // 洞察 1: 效率分析
    const avgTaskCompletion = records.length > 0
      ? records.reduce((sum, r) => {
          return sum + (r.tasksTotal > 0 ? r.tasksCompleted / r.tasksTotal : 1);
        }, 0) / records.length
      : 0;

    if (avgTaskCompletion < 0.85) {
      insights.push({
        category: 'efficiency',
        title: '任务完成率偏低',
        description: `平均任务完成率为 ${Math.round(avgTaskCompletion * 100)}%,低于理想值 85%`,
        evidence: [
          `分析了 ${records.length} 个归档变更`,
          `${records.filter(r => r.hadIssues).length} 个变更存在未完成任务`
        ],
        recommendation: '在归档前确保所有关键任务已完成,或明确标记可选任务'
      });
    }

    // 洞察 2: 质量分析
    const successPatterns = patterns.filter(p => p.type === 'success');
    const antiPatterns = patterns.filter(p => p.type === 'antipattern');

    if (antiPatterns.length > 0) {
      insights.push({
        category: 'quality',
        title: '发现常见问题模式',
        description: `识别到 ${antiPatterns.length} 个反模式需要注意`,
        evidence: antiPatterns.map(p => `${p.name}: ${p.description}`),
        recommendation: '在创建类似变更时提前规划,避免重复问题'
      });
    }

    // 洞察 3: 复杂度趋势
    const complexChanges = records.filter(r => r.complexity === 'complex' || r.complexity === 'high');
    if (complexChanges.length / records.length > 0.3) {
      insights.push({
        category: 'risk',
        title: '复杂变更占比较高',
        description: `${Math.round(complexChanges.length / records.length * 100)}% 的变更被标记为复杂`,
        evidence: [
          `${complexChanges.length} / ${records.length} 个变更`,
          `复杂变更平均任务数: ${Math.round(complexChanges.reduce((sum, r) => sum + r.tasksTotal, 0) / complexChanges.length)}`
        ],
        recommendation: '考虑将复杂变更拆分为多个较小的变更,降低风险'
      });
    }

    // 洞察 4: 最佳实践
    if (successPatterns.length > 0) {
      insights.push({
        category: 'best_practice',
        title: '识别到成功模式',
        description: `发现 ${successPatterns.length} 个值得复用的成功模式`,
        evidence: successPatterns.map(p => `${p.name}: ${p.description}`),
        recommendation: '在未来变更中主动应用这些成功模式'
      });
    }

    return insights;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(insights: Insight[], patterns: Pattern[]): string[] {
    const recommendations: string[] = [];

    // 基于洞察生成建议
    for (const insight of insights) {
      if (insight.category === 'risk' || insight.category === 'quality') {
        recommendations.push(insight.recommendation);
      }
    }

    // 基于反模式生成建议
    for (const pattern of patterns) {
      if (pattern.type === 'antipattern' && pattern.confidence > 0.5) {
        recommendations.push(`注意 "${pattern.name}": ${pattern.description}`);
      }
    }

    // 通用建议
    if (recommendations.length === 0) {
      recommendations.push('继续保持良好的变更管理习惯');
    }

    return [...new Set(recommendations)]; // 去重
  }

  /**
   * 汇总统计
   */
  private summarize(records: ChangeRecord[]): ReflectionReport['summary'] {
    const totalChanges = records.length;
    const successfulChanges = records.filter(r => !r.hadIssues).length;
    const successRate = totalChanges > 0 ? successfulChanges / totalChanges : 0;

    // 统计常见模式
    const intentCounts = records.reduce((acc, r) => {
      acc[r.intent] = (acc[r.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonPatterns = Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent);

    // 计算平均完成时间(如果有数据)
    const avgTimeToComplete = 0; // TODO: 需要从归档时间计算

    return {
      totalChanges,
      successRate,
      avgTimeToComplete,
      commonPatterns
    };
  }

  /**
   * 空报告
   */
  private emptyReport(): ReflectionReport {
    return {
      summary: {
        totalChanges: 0,
        successRate: 0,
        avgTimeToComplete: 0,
        commonPatterns: []
      },
      patterns: [],
      insights: [{
        category: 'best_practice',
        title: '暂无历史数据',
        description: '还没有归档的变更可供分析',
        evidence: [],
        recommendation: '完成并归档一些变更后,反思引擎将能够提供有价值的洞察'
      }],
      recommendations: ['开始创建和归档变更,积累经验数据']
    };
  }

  /**
   * 将反思结果沉淀为 spec 知识
   * 生成一个 lessons-learned spec
   */
  async crystallizeToSpec(report: ReflectionReport): Promise<string> {
    const specContent = this.generateLessonsLearnedSpec(report);
    
    const specsDir = path.join(this.projectPath, 'openspec', 'specs', 'lessons-learned');
    await fs.mkdir(specsDir, { recursive: true });
    
    const specPath = path.join(specsDir, 'spec.md');
    await fs.writeFile(specPath, specContent);
    
    return specPath;
  }

  /**
   * 生成经验总结 spec
   */
  private generateLessonsLearnedSpec(report: ReflectionReport): string {
    const lines: string[] = [];

    lines.push('# Lessons Learned Specification');
    lines.push('');
    lines.push('## Purpose');
    lines.push('');
    lines.push('记录从历史变更中提取的经验教训和最佳实践,用于指导未来的变更决策。');
    lines.push('');
    lines.push(`**最后更新**: ${new Date().toISOString().split('T')[0]}`);
    lines.push(`**基于数据**: ${report.summary.totalChanges} 个归档变更`);
    lines.push('');

    lines.push('## Requirements');
    lines.push('');

    // 成功模式
    const successPatterns = report.patterns.filter(p => p.type === 'success');
    if (successPatterns.length > 0) {
      lines.push('### Requirement: 应用成功模式');
      lines.push('变更创建过程应当(SHALL)参考已验证的成功模式。');
      lines.push('');

      for (const pattern of successPatterns) {
        lines.push(`#### Scenario: ${pattern.name}`);
        lines.push(`- **WHEN** 创建类似变更`);
        lines.push(`- **THEN** 参考以下模式: ${pattern.description}`);
        lines.push(`- **AND** 成功率: ${Math.round(pattern.confidence * 100)}%`);
        lines.push('');
      }
    }

    // 反模式
    const antiPatterns = report.patterns.filter(p => p.type === 'antipattern');
    if (antiPatterns.length > 0) {
      lines.push('### Requirement: 避免已知反模式');
      lines.push('变更创建过程必须(MUST)避免已识别的反模式。');
      lines.push('');

      for (const pattern of antiPatterns) {
        lines.push(`#### Scenario: ${pattern.name}`);
        lines.push(`- **GIVEN** ${pattern.description}`);
        lines.push(`- **WHEN** 检测到类似情况`);
        lines.push(`- **THEN** 提示风险并建议缓解措施`);
        lines.push(`- **AND** 风险发生率: ${Math.round(pattern.confidence * 100)}%`);
        lines.push('');
      }
    }

    // 洞察和建议
    if (report.insights.length > 0) {
      lines.push('### Requirement: 遵循洞察建议');
      lines.push('变更决策应当(SHALL)考虑从数据中提取的洞察。');
      lines.push('');

      for (const insight of report.insights) {
        lines.push(`#### Scenario: ${insight.title}`);
        lines.push(`- **WHEN** ${insight.description}`);
        lines.push(`- **THEN** ${insight.recommendation}`);
        lines.push('');
      }
    }

    // 统计数据
    lines.push('## Metrics');
    lines.push('');
    lines.push('```');
    lines.push(`总变更数: ${report.summary.totalChanges}`);
    lines.push(`成功率: ${Math.round(report.summary.successRate * 100)}%`);
    lines.push(`常见类型: ${report.summary.commonPatterns.join(', ')}`);
    lines.push('```');
    lines.push('');

    return lines.join('\n');
  }
}
