/**
 * Context Analyzer
 * 上下文感知和分析系统
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface ProjectContext {
  specs: SpecInfo[];
  activeChanges: ChangeInfo[];
  hasConflicts: boolean;
  codebaseMetrics?: CodebaseMetrics;
}

export interface SpecInfo {
  id: string;
  path: string;
  title?: string;
  requirementCount?: number;
}

export interface ChangeInfo {
  id: string;
  path: string;
  affectedSpecs: string[];
  status: 'active' | 'archived';
}

export interface CodebaseMetrics {
  fileCount: number;
  hasAuth: boolean;
  hasPayment: boolean;
  hasDatabaseMigrations: boolean;
  frameworks: string[];
}

export interface AnalysisResult {
  context: ProjectContext;
  insights: string[];
  warnings: string[];
}

/**
 * 上下文分析器
 * 负责收集和分析项目的当前状态
 */
export class ContextAnalyzer {
  private openspecPath: string;

  constructor(projectPath: string = '.') {
    this.openspecPath = path.join(projectPath, 'openspec');
  }

  /**
   * 分析项目上下文
   */
  async analyze(): Promise<AnalysisResult> {
    const specs = await this.discoverSpecs();
    const activeChanges = await this.discoverActiveChanges();
    const hasConflicts = this.detectConflicts(activeChanges);

    const context: ProjectContext = {
      specs,
      activeChanges,
      hasConflicts
    };

    const insights = this.generateInsights(context);
    const warnings = this.generateWarnings(context);

    return {
      context,
      insights,
      warnings
    };
  }

  /**
   * 发现所有 specs
   */
  private async discoverSpecs(): Promise<SpecInfo[]> {
    const specsDir = path.join(this.openspecPath, 'specs');
    const specs: SpecInfo[] = [];

    try {
      const entries = await fs.readdir(specsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specPath = path.join(specsDir, entry.name, 'spec.md');
          
          try {
            await fs.access(specPath);
            specs.push({
              id: entry.name,
              path: specPath
            });
          } catch {
            // spec.md 不存在,跳过
          }
        }
      }
    } catch (error) {
      // specs 目录不存在
      return [];
    }

    return specs;
  }

  /**
   * 发现活跃的变更
   */
  private async discoverActiveChanges(): Promise<ChangeInfo[]> {
    const changesDir = path.join(this.openspecPath, 'changes');
    const changes: ChangeInfo[] = [];

    try {
      const entries = await fs.readdir(changesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'archive') {
          const changePath = path.join(changesDir, entry.name);
          const affectedSpecs = await this.findAffectedSpecs(changePath);
          
          changes.push({
            id: entry.name,
            path: changePath,
            affectedSpecs,
            status: 'active'
          });
        }
      }
    } catch (error) {
      // changes 目录不存在
      return [];
    }

    return changes;
  }

  /**
   * 查找变更影响的 specs
   */
  private async findAffectedSpecs(changePath: string): Promise<string[]> {
    const specsDir = path.join(changePath, 'specs');
    const affectedSpecs: string[] = [];

    try {
      const entries = await fs.readdir(specsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          affectedSpecs.push(entry.name);
        }
      }
    } catch {
      // specs 目录不存在
    }

    return affectedSpecs;
  }

  /**
   * 检测冲突
   * 简单版本:检查是否有多个变更影响同一个 spec
   */
  private detectConflicts(changes: ChangeInfo[]): boolean {
    const affectedSpecs = new Map<string, string[]>();

    for (const change of changes) {
      for (const spec of change.affectedSpecs) {
        if (!affectedSpecs.has(spec)) {
          affectedSpecs.set(spec, []);
        }
        affectedSpecs.get(spec)!.push(change.id);
      }
    }

    // 如果有 spec 被多个变更影响,则存在潜在冲突
    for (const [, changeIds] of affectedSpecs) {
      if (changeIds.length > 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * 生成洞察
   */
  private generateInsights(context: ProjectContext): string[] {
    const insights: string[] = [];

    insights.push(`发现 ${context.specs.length} 个现有 spec`);
    insights.push(`发现 ${context.activeChanges.length} 个活跃变更`);

    if (context.hasConflicts) {
      insights.push('检测到潜在冲突:多个变更影响相同的 spec');
    }

    // 分析常见模式
    const authSpecs = context.specs.filter(s => s.id.includes('auth'));
    if (authSpecs.length > 0) {
      insights.push(`发现 ${authSpecs.length} 个认证相关 spec`);
    }

    return insights;
  }

  /**
   * 生成警告
   */
  private generateWarnings(context: ProjectContext): string[] {
    const warnings: string[] = [];

    if (context.activeChanges.length > 5) {
      warnings.push(`活跃变更较多(${context.activeChanges.length}),建议优先归档已完成的变更`);
    }

    if (context.hasConflicts) {
      warnings.push('存在冲突的变更,建议先解决冲突再创建新变更');
    }

    return warnings;
  }

  /**
   * 查找相关的 specs
   * 基于关键词匹配
   */
  async findRelatedSpecs(keywords: string[]): Promise<SpecInfo[]> {
    const allSpecs = await this.discoverSpecs();
    const related: SpecInfo[] = [];

    for (const spec of allSpecs) {
      const specId = spec.id.toLowerCase();
      
      for (const keyword of keywords) {
        if (specId.includes(keyword.toLowerCase())) {
          related.push(spec);
          break;
        }
      }
    }

    return related;
  }

  /**
   * 评估复杂度
   * 基于影响范围的简单评估
   */
  assessComplexity(affectedSpecs: string[], hasDesign: boolean = false): 'simple' | 'medium' | 'complex' {
    if (affectedSpecs.length === 0) {
      return 'simple';
    }

    if (affectedSpecs.length === 1 && !hasDesign) {
      return 'simple';
    }

    if (affectedSpecs.length <= 2) {
      return 'medium';
    }

    return 'complex';
  }

  /**
   * 评估风险等级
   */
  assessRisk(affectedSpecs: string[], hasConflicts: boolean): 'low' | 'medium' | 'high' {
    if (hasConflicts) {
      return 'high';
    }

    // 检查是否影响关键 spec
    const criticalSpecs = ['auth', 'payment', 'security'];
    const affectsCritical = affectedSpecs.some(spec => 
      criticalSpecs.some(critical => spec.includes(critical))
    );

    if (affectsCritical) {
      return 'high';
    }

    if (affectedSpecs.length > 2) {
      return 'medium';
    }

    return 'low';
  }
}
