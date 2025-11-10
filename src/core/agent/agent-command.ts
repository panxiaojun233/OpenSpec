/**
 * Agent Command
 * 智能体命令 - Agentic 工作流的主入口
 */

import chalk from 'chalk';
import ora from 'ora';
import { confirm } from '@inquirer/prompts';
import { IntentRecognizer, type Intent, type Context } from './intent-recognizer.js';
import { ContextAnalyzer } from './context-analyzer.js';
import { WorkflowGenerator, type WorkflowContext } from './workflow-generator.js';
import { ChangeScaffolder } from './change-scaffolder.js';

export interface AgentOptions {
  autoConfirm?: boolean;  // 自动确认,跳过交互
  verbose?: boolean;       // 详细输出
}

/**
 * Agent 命令
 * 提供智能化的变更创建和管理
 */
export class AgentCommand {
  private intentRecognizer: IntentRecognizer;
  private contextAnalyzer: ContextAnalyzer;
  private workflowGenerator: WorkflowGenerator;
  private scaffolder: ChangeScaffolder;

  constructor(projectPath: string = '.') {
    this.intentRecognizer = new IntentRecognizer();
    this.contextAnalyzer = new ContextAnalyzer(projectPath);
    this.workflowGenerator = new WorkflowGenerator();
    this.scaffolder = new ChangeScaffolder(projectPath);
  }

  /**
   * 执行 Agent 命令
   */
  async execute(userInput: string, options: AgentOptions = {}): Promise<void> {
    console.log(chalk.cyan('\n🤖 OpenSpec Agent 启动...\n'));

    // 阶段 1: 分析上下文
    const spinner = ora('分析项目上下文...').start();
    const analysis = await this.contextAnalyzer.analyze();
    spinner.succeed('上下文分析完成');

    // 显示洞察
    if (analysis.insights.length > 0 && options.verbose) {
      console.log(chalk.gray('\n📊 项目洞察:'));
      analysis.insights.forEach(insight => {
        console.log(chalk.gray(`  • ${insight}`));
      });
    }

    // 显示警告
    if (analysis.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  警告:'));
      analysis.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }

    // 阶段 2: 识别意图
    spinner.start('识别您的意图...');
    const context: Context = {
      userInput,
      existingSpecs: analysis.context.specs.map(s => s.id),
      activeChanges: analysis.context.activeChanges.map(c => c.id)
    };

    const intent = await this.intentRecognizer.recognize(context);
    spinner.succeed('意图识别完成');

    // 显示识别结果
    this.displayIntent(intent);

    // 如果信心不足,请求确认
    if (intent.confidence < 0.7) {
      console.log(chalk.yellow('\n⚠️  我对意图的理解信心不足。'));
      const proceed = await confirm({
        message: '是否继续?',
        default: false
      });

      if (!proceed) {
        console.log(chalk.gray('已取消'));
        return;
      }
    }

    // 阶段 3: 提取实体和生成建议
    const entities = this.intentRecognizer.extractEntities(userInput);
    const suggestedChangeId = this.generateChangeId(intent, entities);

    console.log(chalk.cyan(`\n💡 建议的变更 ID: ${chalk.white(suggestedChangeId)}`));

    // 查找相关 specs
    const relatedSpecs = await this.contextAnalyzer.findRelatedSpecs(entities);
    if (relatedSpecs.length > 0) {
      console.log(chalk.gray('\n🔗 发现相关的 spec:'));
      relatedSpecs.forEach(spec => {
        console.log(chalk.gray(`  • ${spec.id}`));
      });
    }

    // 阶段 4: 生成工作流
    const affectedSpecs = relatedSpecs.map(s => s.id);
    const complexity = this.contextAnalyzer.assessComplexity(affectedSpecs);
    const riskLevel = this.contextAnalyzer.assessRisk(
      affectedSpecs,
      analysis.context.hasConflicts
    );

    const workflowContext: WorkflowContext = {
      intentType: intent.type,
      complexity,
      affectedSpecs,
      hasConflicts: analysis.context.hasConflicts,
      riskLevel
    };

    const workflow = this.workflowGenerator.generate(workflowContext);
    
    // 显示工作流
    console.log(this.workflowGenerator.formatWorkflow(workflow));

    // 请求确认
    if (!options.autoConfirm) {
      console.log('');
      const proceed = await confirm({
        message: '是否按照此工作流创建变更?',
        default: true
      });

      if (!proceed) {
        console.log(chalk.gray('\n已取消'));
        return;
      }
    }

    // 阶段 5: 执行工作流
    console.log(chalk.cyan('\n⚙️  开始执行工作流...\n'));

    try {
      await this.scaffolder.scaffold({
        changeId: suggestedChangeId,
        intent,
        workflow,
        affectedSpecs,
        userInput
      });

      console.log(chalk.green('\n✅ 变更创建成功!'));
      console.log(chalk.gray(`\n查看变更: ${chalk.white(`openspec show ${suggestedChangeId}`)}`));
      console.log(chalk.gray(`验证变更: ${chalk.white(`openspec validate ${suggestedChangeId} --strict`)}`));
      
    } catch (error) {
      throw new Error(`创建变更失败: ${(error as Error).message}`);
    }
  }

  /**
   * 显示识别的意图
   */
  private displayIntent(intent: Intent): void {
    console.log(chalk.cyan('\n🎯 我的理解:'));
    console.log(`  类型: ${chalk.white(this.formatIntentType(intent.type))}`);
    console.log(`  信心: ${this.formatConfidence(intent.confidence)}`);
    console.log(`  推理: ${chalk.gray(intent.reasoning)}`);
  }

  /**
   * 格式化意图类型
   */
  private formatIntentType(type: string): string {
    const typeMap: Record<string, string> = {
      new_capability: '新建能力',
      enhance: '增强现有能力',
      fix: '修复问题',
      refactor: '重构',
      unknown: '未知'
    };
    return typeMap[type] || type;
  }

  /**
   * 格式化信心分数
   */
  private formatConfidence(confidence: number): string {
    const percentage = Math.round(confidence * 100);
    let color = chalk.green;
    
    if (confidence < 0.5) {
      color = chalk.red;
    } else if (confidence < 0.7) {
      color = chalk.yellow;
    }

    return color(`${percentage}%`);
  }

  /**
   * 生成变更 ID
   */
  private generateChangeId(intent: Intent, entities: string[]): string {
    const prefix = this.getPrefix(intent.type);
    const suffix = entities.length > 0 
      ? entities[0].toLowerCase().replace(/\s+/g, '-')
      : 'change';

    return `${prefix}${suffix}`;
  }

  /**
   * 获取变更 ID 前缀
   */
  private getPrefix(intentType: string): string {
    switch (intentType) {
      case 'new_capability': return 'add-';
      case 'enhance': return 'enhance-';
      case 'fix': return 'fix-';
      case 'refactor': return 'refactor-';
      default: return 'update-';
    }
  }
}
