/**
 * Reflect Command
 * 反思命令 - 分析历史变更并生成洞察
 */

import chalk from 'chalk';
import ora from 'ora';
import { ReflectionEngine, type ReflectionReport } from './reflection-engine.js';

export interface ReflectOptions {
  save?: boolean;      // 是否保存为 spec
  json?: boolean;      // 输出 JSON 格式
  verbose?: boolean;   // 详细输出
}

/**
 * 反思命令
 */
export class ReflectCommand {
  private engine: ReflectionEngine;

  constructor(projectPath: string = '.') {
    this.engine = new ReflectionEngine(projectPath);
  }

  /**
   * 执行反思分析
   */
  async execute(options: ReflectOptions = {}): Promise<void> {
    const spinner = ora('分析历史变更...').start();

    try {
      // 执行反思
      const report = await this.engine.reflect();
      spinner.succeed('分析完成');

      // 输出报告
      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      this.displayReport(report, options.verbose);

      // 保存为 spec
      if (options.save) {
        const saveSpinner = ora('沉淀为 spec...').start();
        try {
          const specPath = await this.engine.crystallizeToSpec(report);
          saveSpinner.succeed(`已保存到: ${chalk.cyan(specPath)}`);
        } catch (error) {
          saveSpinner.fail(`保存失败: ${(error as Error).message}`);
        }
      } else {
        console.log('');
        console.log(chalk.gray('提示: 使用 --save 将洞察沉淀为 spec'));
      }

    } catch (error) {
      spinner.fail(`反思失败: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 显示报告
   */
  private displayReport(report: ReflectionReport, verbose: boolean = false): void {
    console.log('');
    console.log(chalk.cyan.bold('🔮 反思报告'));
    console.log(chalk.gray('='.repeat(60)));
    console.log('');

    // 摘要
    this.displaySummary(report.summary);

    // 模式
    if (report.patterns.length > 0) {
      console.log('');
      this.displayPatterns(report.patterns, verbose);
    }

    // 洞察
    if (report.insights.length > 0) {
      console.log('');
      this.displayInsights(report.insights, verbose);
    }

    // 建议
    if (report.recommendations.length > 0) {
      console.log('');
      this.displayRecommendations(report.recommendations);
    }

    console.log('');
    console.log(chalk.gray('='.repeat(60)));
  }

  /**
   * 显示摘要
   */
  private displaySummary(summary: ReflectionReport['summary']): void {
    console.log(chalk.white.bold('📊 摘要'));
    console.log('');
    console.log(`  总变更数: ${chalk.white(summary.totalChanges)}`);
    console.log(`  成功率: ${this.formatSuccessRate(summary.successRate)}`);
    
    if (summary.commonPatterns.length > 0) {
      console.log(`  常见类型: ${chalk.gray(summary.commonPatterns.join(', '))}`);
    }
  }

  /**
   * 显示模式
   */
  private displayPatterns(patterns: ReflectionReport['patterns'], verbose: boolean): void {
    console.log(chalk.white.bold('🔍 识别的模式'));
    console.log('');

    const successPatterns = patterns.filter(p => p.type === 'success');
    const antiPatterns = patterns.filter(p => p.type === 'antipattern');

    if (successPatterns.length > 0) {
      console.log(chalk.green('  ✓ 成功模式:'));
      for (const pattern of successPatterns) {
        console.log(`    • ${chalk.white(pattern.name)}`);
        console.log(`      ${chalk.gray(pattern.description)}`);
        console.log(`      信心: ${this.formatConfidence(pattern.confidence)} | 频次: ${pattern.frequency}`);
        
        if (verbose && pattern.examples.length > 0) {
          console.log(`      示例: ${chalk.gray(pattern.examples.join(', '))}`);
        }
      }
      console.log('');
    }

    if (antiPatterns.length > 0) {
      console.log(chalk.yellow('  ⚠ 反模式:'));
      for (const pattern of antiPatterns) {
        console.log(`    • ${chalk.white(pattern.name)}`);
        console.log(`      ${chalk.gray(pattern.description)}`);
        console.log(`      风险率: ${this.formatConfidence(pattern.confidence)} | 频次: ${pattern.frequency}`);
        
        if (verbose && pattern.examples.length > 0) {
          console.log(`      示例: ${chalk.gray(pattern.examples.join(', '))}`);
        }
      }
    }
  }

  /**
   * 显示洞察
   */
  private displayInsights(insights: ReflectionReport['insights'], verbose: boolean): void {
    console.log(chalk.white.bold('💡 洞察'));
    console.log('');

    for (const insight of insights) {
      const icon = this.getInsightIcon(insight.category);
      console.log(`  ${icon} ${chalk.white(insight.title)}`);
      console.log(`    ${chalk.gray(insight.description)}`);
      
      if (verbose && insight.evidence.length > 0) {
        console.log(`    证据:`);
        for (const evidence of insight.evidence) {
          console.log(`      - ${chalk.gray(evidence)}`);
        }
      }
      
      console.log(`    ${chalk.cyan('→')} ${insight.recommendation}`);
      console.log('');
    }
  }

  /**
   * 显示建议
   */
  private displayRecommendations(recommendations: string[]): void {
    console.log(chalk.white.bold('💎 建议'));
    console.log('');

    for (let i = 0; i < recommendations.length; i++) {
      console.log(`  ${i + 1}. ${recommendations[i]}`);
    }
  }

  /**
   * 格式化成功率
   */
  private formatSuccessRate(rate: number): string {
    const percentage = Math.round(rate * 100);
    let color = chalk.green;
    
    if (percentage < 60) {
      color = chalk.red;
    } else if (percentage < 80) {
      color = chalk.yellow;
    }

    return color(`${percentage}%`);
  }

  /**
   * 格式化信心度
   */
  private formatConfidence(confidence: number): string {
    const percentage = Math.round(confidence * 100);
    let color = chalk.green;
    
    if (confidence < 0.5) {
      color = chalk.yellow;
    } else if (confidence < 0.7) {
      color = chalk.cyan;
    }

    return color(`${percentage}%`);
  }

  /**
   * 获取洞察图标
   */
  private getInsightIcon(category: string): string {
    switch (category) {
      case 'efficiency': return '⚡';
      case 'quality': return '✨';
      case 'risk': return '⚠️';
      case 'best_practice': return '🏆';
      default: return '💡';
    }
  }
}
