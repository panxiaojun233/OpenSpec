/**
 * Intent Recognition System
 * 基于关键词和上下文的意图识别引擎
 */

export type IntentType = 
  | 'new_capability'     // 新建能力
  | 'enhance'            // 增强现有能力
  | 'fix'                // 修复问题
  | 'refactor'           // 重构
  | 'unknown';           // 未知意图

export interface Intent {
  type: IntentType;
  confidence: number;      // 0-1 之间的信心分数
  reasoning: string;       // 推理依据
  suggestedAction: string; // 建议的行动
}

export interface Context {
  userInput: string;
  existingSpecs: string[];
  activeChanges: string[];
  codebaseInfo?: {
    hasRelatedFiles: boolean;
    relatedPaths: string[];
  };
}

/**
 * 意图识别器
 * 阶段 1: 基于规则的识别 + 关键词匹配
 */
export class IntentRecognizer {
  private newCapabilityKeywords = ['add', 'create', 'new', '添加', '新建', '创建'];
  private enhanceKeywords = ['enhance', 'improve', 'extend', 'update', '增强', '改进', '扩展', '更新'];
  private fixKeywords = ['fix', 'bug', 'issue', 'problem', '修复', '修改', '问题'];
  private refactorKeywords = ['refactor', 'restructure', 'reorganize', '重构', '重组'];

  /**
   * 识别用户意图
   */
  async recognize(context: Context): Promise<Intent> {
    const { userInput, existingSpecs } = context;
    const lowerInput = userInput.toLowerCase();
    
    // 1. 关键词匹配
    const keywordScore = this.calculateKeywordScore(lowerInput);
    
    // 2. 上下文分析
    const hasRelatedSpec = this.hasRelatedSpec(userInput, existingSpecs);
    
    // 3. 综合推理
    return this.inferIntent(lowerInput, keywordScore, hasRelatedSpec, context);
  }

  /**
   * 计算关键词分数
   */
  private calculateKeywordScore(input: string): Record<IntentType, number> {
    const scores: Record<IntentType, number> = {
      new_capability: 0,
      enhance: 0,
      fix: 0,
      refactor: 0,
      unknown: 0
    };

    // 计算每种意图的关键词匹配度
    scores.new_capability = this.countMatches(input, this.newCapabilityKeywords);
    scores.enhance = this.countMatches(input, this.enhanceKeywords);
    scores.fix = this.countMatches(input, this.fixKeywords);
    scores.refactor = this.countMatches(input, this.refactorKeywords);

    return scores;
  }

  /**
   * 统计关键词匹配数量
   */
  private countMatches(input: string, keywords: string[]): number {
    return keywords.filter(keyword => input.includes(keyword)).length;
  }

  /**
   * 检查是否有相关的现有 spec
   */
  private hasRelatedSpec(input: string, existingSpecs: string[]): boolean {
    const inputTokens = this.tokenize(input);
    
    for (const spec of existingSpecs) {
      const specTokens = this.tokenize(spec);
      const overlap = inputTokens.filter(token => specTokens.includes(token));
      
      // 如果有 30% 以上的词汇重叠,认为相关
      if (overlap.length / inputTokens.length > 0.3) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 简单分词
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2); // 过滤掉短词
  }

  /**
   * 推理最终意图
   */
  private inferIntent(
    input: string,
    keywordScore: Record<IntentType, number>,
    hasRelatedSpec: boolean,
    context: Context
  ): Intent {
    // 找出得分最高的意图类型
    let maxScore = 0;
    let topIntent: IntentType = 'unknown';
    
    for (const [intent, score] of Object.entries(keywordScore)) {
      if (score > maxScore) {
        maxScore = score;
        topIntent = intent as IntentType;
      }
    }

    // 基于上下文调整
    if (topIntent === 'new_capability' && hasRelatedSpec) {
      // 如果检测到"新建"但已有相关 spec,可能是增强
      return {
        type: 'enhance',
        confidence: 0.75,
        reasoning: '检测到新建关键词,但发现已有相关 spec,推测为增强现有能力',
        suggestedAction: 'modify_existing_spec'
      };
    }

    if (topIntent === 'fix') {
      // 修复类通常不需要 proposal
      return {
        type: 'fix',
        confidence: maxScore > 0 ? 0.9 : 0.5,
        reasoning: '检测到修复关键词,建议直接修改 spec',
        suggestedAction: 'direct_fix'
      };
    }

    if (topIntent === 'new_capability' && !hasRelatedSpec) {
      return {
        type: 'new_capability',
        confidence: 0.85,
        reasoning: '检测到新建关键词且无相关 spec,推测为新能力',
        suggestedAction: 'create_new_spec'
      };
    }

    if (topIntent === 'enhance') {
      return {
        type: 'enhance',
        confidence: 0.8,
        reasoning: '检测到增强关键词,建议扩展现有能力',
        suggestedAction: 'modify_existing_spec'
      };
    }

    if (topIntent === 'refactor') {
      return {
        type: 'refactor',
        confidence: 0.8,
        reasoning: '检测到重构关键词,可能不需要修改 spec',
        suggestedAction: 'optional_spec_update'
      };
    }

    // 默认:信心不足
    return {
      type: 'unknown',
      confidence: 0.3,
      reasoning: '无法确定意图,需要更多信息',
      suggestedAction: 'ask_for_clarification'
    };
  }

  /**
   * 提取关键实体(如功能名称)
   */
  extractEntities(input: string): string[] {
    // 简单实现:提取名词短语
    const entities: string[] = [];
    
    // 匹配常见模式: "添加 X 功能", "创建 X", etc.
    const patterns = [
      /(?:add|create|new|添加|创建|新建)\s+([a-z0-9\u4e00-\u9fa5\-]+)/gi,
      /([a-z0-9\u4e00-\u9fa5\-]+)\s+(?:feature|function|capability|功能|能力)/gi
    ];

    for (const pattern of patterns) {
      const matches = input.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          entities.push(match[1].trim());
        }
      }
    }

    return [...new Set(entities)]; // 去重
  }
}
