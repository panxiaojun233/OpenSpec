/**
 * Change Scaffolder
 * 变更脚手架生成器 - 自动生成变更文件结构和内容
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Intent } from './intent-recognizer.js';
import type { Workflow } from './workflow-generator.js';

export interface ScaffoldConfig {
  changeId: string;
  intent: Intent;
  workflow: Workflow;
  affectedSpecs: string[];
  userInput: string;
}

/**
 * 变更脚手架生成器
 */
export class ChangeScaffolder {
  private projectPath: string;
  private changesDir: string;

  constructor(projectPath: string = '.') {
    this.projectPath = projectPath;
    this.changesDir = path.join(projectPath, 'openspec', 'changes');
  }

  /**
   * 脚手架一个新变更
   */
  async scaffold(config: ScaffoldConfig): Promise<void> {
    const changeDir = path.join(this.changesDir, config.changeId);

    // 检查变更是否已存在
    try {
      await fs.access(changeDir);
      throw new Error(`变更 '${config.changeId}' 已存在`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // 创建变更目录
    await fs.mkdir(changeDir, { recursive: true });

    try {
      // 生成文件
      await this.generateProposal(changeDir, config);
      await this.generateTasks(changeDir, config);
      
      // 如果工作流要求,生成设计文档
      const needsDesign = config.workflow.steps.some(
        s => s.type === 'create_design' && s.required
      );
      if (needsDesign) {
        await this.generateDesign(changeDir, config);
      }

      // 生成规范增量
      if (config.affectedSpecs.length > 0) {
        await this.generateSpecDeltas(changeDir, config);
      }

    } catch (error) {
      // 如果生成失败,清理创建的目录
      await fs.rm(changeDir, { recursive: true, force: true });
      throw error;
    }
  }

  /**
   * 生成 proposal.md
   */
  private async generateProposal(changeDir: string, config: ScaffoldConfig): Promise<void> {
    const content = `## Why
${this.generateWhySection(config)}

## What Changes
${this.generateWhatChangesSection(config)}

## Impact
- Affected specs: ${config.affectedSpecs.join(', ') || 'None (new capability)'}
- Complexity: ${config.workflow.riskLevel}
- Breaking changes: No (update if needed)
`;

    await fs.writeFile(path.join(changeDir, 'proposal.md'), content);
  }

  /**
   * 生成 Why 部分
   */
  private generateWhySection(config: ScaffoldConfig): string {
    const typeDescriptions: Record<string, string> = {
      new_capability: `添加新功能以支持 ${config.userInput}`,
      enhance: `增强现有功能: ${config.userInput}`,
      fix: `修复问题: ${config.userInput}`,
      refactor: `重构以改进: ${config.userInput}`
    };

    return typeDescriptions[config.intent.type] || config.userInput;
  }

  /**
   * 生成 What Changes 部分
   */
  private generateWhatChangesSection(config: ScaffoldConfig): string {
    const changes: string[] = [];

    if (config.affectedSpecs.length > 0) {
      changes.push(`- Update specs: ${config.affectedSpecs.join(', ')}`);
    } else {
      changes.push('- Create new spec for this capability');
    }

    changes.push('- Implement functionality as per tasks');
    changes.push('- Add tests');

    return changes.join('\n');
  }

  /**
   * 生成 tasks.md
   */
  private async generateTasks(changeDir: string, config: ScaffoldConfig): Promise<void> {
    const content = `## 1. Specification
- [ ] 1.1 Draft spec delta (ADDED/MODIFIED requirements)
- [ ] 1.2 Validate spec format

## 2. Implementation
- [ ] 2.1 Implement core functionality
- [ ] 2.2 Add unit tests
- [ ] 2.3 Add integration tests

## 3. Documentation
- [ ] 3.1 Update relevant documentation
- [ ] 3.2 Add usage examples (if applicable)

## 4. Review
- [ ] 4.1 Self-review code changes
- [ ] 4.2 Run validation: \`openspec validate ${config.changeId} --strict\`
`;

    await fs.writeFile(path.join(changeDir, 'tasks.md'), content);
  }

  /**
   * 生成 design.md
   */
  private async generateDesign(changeDir: string, config: ScaffoldConfig): Promise<void> {
    const content = `## Context
${config.userInput}

## Goals / Non-Goals
- **Goals**: 
  - TODO: Define primary goals
- **Non-Goals**:
  - TODO: Define what's out of scope

## Decisions
- **Decision**: TODO: Document key technical decisions
- **Alternatives considered**: TODO: List alternatives and why they weren't chosen

## Risks / Trade-offs
- TODO: Identify risks and mitigation strategies

## Migration Plan
- TODO: If breaking changes, document migration path
- TODO: Rollback plan

## Open Questions
- TODO: List unresolved questions
`;

    await fs.writeFile(path.join(changeDir, 'design.md'), content);
  }

  /**
   * 生成规范增量
   */
  private async generateSpecDeltas(changeDir: string, config: ScaffoldConfig): Promise<void> {
    const specsDir = path.join(changeDir, 'specs');
    await fs.mkdir(specsDir, { recursive: true });

    for (const specId of config.affectedSpecs) {
      const specDir = path.join(specsDir, specId);
      await fs.mkdir(specDir, { recursive: true });

      const deltaContent = this.generateDeltaContent(specId, config);
      await fs.writeFile(path.join(specDir, 'spec.md'), deltaContent);
    }
  }

  /**
   * 生成增量内容
   */
  private generateDeltaContent(specId: string, config: ScaffoldConfig): string {
    if (config.intent.type === 'new_capability') {
      return `## ADDED Requirements
### Requirement: ${this.capitalize(specId)} Core Functionality
The system SHALL provide ${specId} capability.

#### Scenario: Basic usage
- **WHEN** user performs ${specId} operation
- **THEN** system responds appropriately
`;
    }

    return `## MODIFIED Requirements
### Requirement: Enhanced ${this.capitalize(specId)}
The system SHALL provide enhanced ${specId} functionality.

#### Scenario: Updated behavior
- **WHEN** user interacts with ${specId}
- **THEN** system provides improved experience

## ADDED Requirements
### Requirement: Additional ${this.capitalize(specId)} Feature
The system SHALL support additional ${specId} features.

#### Scenario: New feature usage
- **WHEN** user uses new feature
- **THEN** feature works as expected
`;
  }

  /**
   * 首字母大写
   */
  private capitalize(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
