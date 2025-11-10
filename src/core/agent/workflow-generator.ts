/**
 * Workflow Generator
 * 动态工作流生成器 - 基于上下文生成定制化的工作流
 */

import type { IntentType } from './intent-recognizer.js';

export type WorkflowStepType = 
  | 'create_proposal'
  | 'create_tasks'
  | 'create_design'
  | 'create_spec_delta'
  | 'validate'
  | 'review';

export interface WorkflowStep {
  name: string;
  type: WorkflowStepType;
  required: boolean;
  blocker: boolean;  // 如果失败是否阻止继续
  description: string;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  estimatedTime?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WorkflowContext {
  intentType: IntentType;
  complexity: 'simple' | 'medium' | 'complex';
  affectedSpecs: string[];
  hasConflicts: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * 工作流生成器
 * 根据上下文动态生成最适合的工作流
 */
export class WorkflowGenerator {
  /**
   * 生成工作流
   */
  generate(context: WorkflowContext): Workflow {
    // 根据意图类型选择基础工作流
    let baseWorkflow = this.getBaseWorkflow(context.intentType);
    
    // 根据复杂度调整
    baseWorkflow = this.adjustForComplexity(baseWorkflow, context.complexity);
    
    // 根据风险等级调整
    baseWorkflow = this.adjustForRisk(baseWorkflow, context.riskLevel);
    
    // 如果有冲突,添加冲突解决步骤
    if (context.hasConflicts) {
      baseWorkflow = this.addConflictResolution(baseWorkflow);
    }
    
    return baseWorkflow;
  }

  /**
   * 获取基础工作流模板
   */
  private getBaseWorkflow(intentType: IntentType): Workflow {
    switch (intentType) {
      case 'new_capability':
        return {
          id: 'new-capability',
          name: '新建能力',
          steps: [
            {
              name: '创建提案',
              type: 'create_proposal',
              required: true,
              blocker: true,
              description: '描述新能力的目的和价值'
            },
            {
              name: '创建任务清单',
              type: 'create_tasks',
              required: true,
              blocker: true,
              description: '分解实现步骤'
            },
            {
              name: '创建技术设计',
              type: 'create_design',
              required: false,
              blocker: false,
              description: '记录技术决策(可选)'
            },
            {
              name: '创建规范增量',
              type: 'create_spec_delta',
              required: true,
              blocker: true,
              description: '定义新能力的规范'
            },
            {
              name: '验证',
              type: 'validate',
              required: true,
              blocker: true,
              description: '验证格式和内容'
            }
          ],
          estimatedTime: '5-10分钟',
          riskLevel: 'low'
        };

      case 'enhance':
        return {
          id: 'enhance-capability',
          name: '增强现有能力',
          steps: [
            {
              name: '创建提案',
              type: 'create_proposal',
              required: true,
              blocker: true,
              description: '说明增强的必要性'
            },
            {
              name: '创建任务清单',
              type: 'create_tasks',
              required: true,
              blocker: true,
              description: '分解修改步骤'
            },
            {
              name: '更新规范',
              type: 'create_spec_delta',
              required: true,
              blocker: true,
              description: '使用 MODIFIED/ADDED 更新规范'
            },
            {
              name: '验证',
              type: 'validate',
              required: true,
              blocker: true,
              description: '验证变更'
            }
          ],
          estimatedTime: '3-8分钟',
          riskLevel: 'medium'
        };

      case 'fix':
        return {
          id: 'fix',
          name: '修复问题',
          steps: [
            {
              name: '更新规范(如需要)',
              type: 'create_spec_delta',
              required: false,
              blocker: false,
              description: '如果是规范错误,更新规范'
            },
            {
              name: '快速验证',
              type: 'validate',
              required: true,
              blocker: false,
              description: '基础格式检查'
            }
          ],
          estimatedTime: '1-3分钟',
          riskLevel: 'low'
        };

      case 'refactor':
        return {
          id: 'refactor',
          name: '重构',
          steps: [
            {
              name: '创建提案',
              type: 'create_proposal',
              required: true,
              blocker: true,
              description: '说明重构原因和目标'
            },
            {
              name: '创建任务清单',
              type: 'create_tasks',
              required: true,
              blocker: true,
              description: '分解重构步骤'
            },
            {
              name: '更新规范(可选)',
              type: 'create_spec_delta',
              required: false,
              blocker: false,
              description: '如果行为有变化,更新规范'
            }
          ],
          estimatedTime: '5-15分钟',
          riskLevel: 'medium'
        };

      default:
        return {
          id: 'default',
          name: '标准流程',
          steps: [
            {
              name: '创建提案',
              type: 'create_proposal',
              required: true,
              blocker: true,
              description: '描述变更'
            },
            {
              name: '创建任务',
              type: 'create_tasks',
              required: true,
              blocker: true,
              description: '实现计划'
            },
            {
              name: '创建规范',
              type: 'create_spec_delta',
              required: true,
              blocker: true,
              description: '更新规范'
            },
            {
              name: '验证',
              type: 'validate',
              required: true,
              blocker: true,
              description: '验证所有内容'
            }
          ],
          estimatedTime: '10-20分钟',
          riskLevel: 'medium'
        };
    }
  }

  /**
   * 根据复杂度调整工作流
   */
  private adjustForComplexity(workflow: Workflow, complexity: 'simple' | 'medium' | 'complex'): Workflow {
    const adjusted = { ...workflow };
    
    if (complexity === 'simple') {
      // 简单任务:移除可选步骤
      adjusted.steps = adjusted.steps.filter(step => step.required);
      adjusted.estimatedTime = '2-5分钟';
    } else if (complexity === 'complex') {
      // 复杂任务:所有可选步骤变为必需
      adjusted.steps = adjusted.steps.map(step => ({
        ...step,
        required: true
      }));
      
      // 添加设计文档(如果还没有)
      const hasDesign = adjusted.steps.some(s => s.type === 'create_design');
      if (!hasDesign) {
        adjusted.steps.splice(2, 0, {
          name: '创建技术设计',
          type: 'create_design',
          required: true,
          blocker: true,
          description: '复杂变更需要详细的技术设计'
        });
      }
      
      adjusted.estimatedTime = '15-30分钟';
    }
    
    return adjusted;
  }

  /**
   * 根据风险等级调整工作流
   */
  private adjustForRisk(workflow: Workflow, riskLevel: 'low' | 'medium' | 'high'): Workflow {
    const adjusted = { ...workflow, riskLevel };
    
    if (riskLevel === 'high') {
      // 高风险:添加审查步骤
      adjusted.steps.push({
        name: '安全审查',
        type: 'review',
        required: true,
        blocker: true,
        description: '高风险变更需要团队审查'
      });
      
      // 强制 strict 验证
      const validateStep = adjusted.steps.find(s => s.type === 'validate');
      if (validateStep) {
        validateStep.description = '严格验证所有内容';
        validateStep.blocker = true;
      }
    }
    
    return adjusted;
  }

  /**
   * 添加冲突解决步骤
   */
  private addConflictResolution(workflow: Workflow): Workflow {
    const adjusted = { ...workflow };
    
    // 在创建规范之前添加冲突解决
    const specStepIndex = adjusted.steps.findIndex(s => s.type === 'create_spec_delta');
    
    if (specStepIndex !== -1) {
      adjusted.steps.splice(specStepIndex, 0, {
        name: '解决冲突',
        type: 'review',
        required: true,
        blocker: true,
        description: '检测到与其他变更的冲突,需要先解决'
      });
    }
    
    return adjusted;
  }

  /**
   * 格式化工作流为可读文本
   */
  formatWorkflow(workflow: Workflow): string {
    const lines: string[] = [];
    
    lines.push(`\n📋 工作流: ${workflow.name}`);
    lines.push(`⏱️  预估时间: ${workflow.estimatedTime || '未知'}`);
    lines.push(`⚠️  风险等级: ${this.formatRiskLevel(workflow.riskLevel)}`);
    lines.push('');
    lines.push('步骤:');
    
    workflow.steps.forEach((step, index) => {
      const required = step.required ? '✓' : '○';
      const blocker = step.blocker ? ' [阻断]' : '';
      lines.push(`  ${index + 1}. ${required} ${step.name}${blocker}`);
      lines.push(`     ${step.description}`);
    });
    
    return lines.join('\n');
  }

  /**
   * 格式化风险等级
   */
  private formatRiskLevel(level: string): string {
    switch (level) {
      case 'low': return '低 ✅';
      case 'medium': return '中 ⚠️';
      case 'high': return '高 🔴';
      default: return level;
    }
  }
}
