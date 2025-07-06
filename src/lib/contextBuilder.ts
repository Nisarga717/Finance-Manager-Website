import { FinancialContextService, FinancialContext, FilteredContext } from './financialContextService';
import { ChatHistoryManager, ChatContext, ChatMessage } from './chatHistoryManager';

export interface ComprehensiveContext {
  financialContext: FinancialContext | null;
  filteredContext: FilteredContext | null;
  chatContext: ChatContext;
  combinedPrompt: string;
  contextSummary: string;
  queryType: string;
}

export class ContextBuilder {
  private static readonly MAX_PROMPT_LENGTH = 3000; // Increased for better context

  static async buildComprehensiveContext(userMessage: string): Promise<ComprehensiveContext> {
    try {
      // Use filtered context for better relevance
      const [filteredContext, chatContext] = await Promise.all([
        FinancialContextService.fetchFilteredContext(userMessage),
        ChatHistoryManager.getChatContext()
      ]);

      const combinedPrompt = this.createSmartCombinedPrompt(userMessage, filteredContext, chatContext);
      const contextSummary = this.createSmartContextSummary(filteredContext, chatContext);

      return {
        financialContext: null, // We're now using filtered context
        filteredContext,
        chatContext,
        combinedPrompt,
        contextSummary,
        queryType: filteredContext.queryType
      };
    } catch (error) {
      console.error('Error building comprehensive context:', error);
      return this.createFallbackContext(userMessage);
    }
  }

  private static createSmartCombinedPrompt(
    userMessage: string,
    filteredContext: FilteredContext,
    chatContext: ChatContext
  ): string {
    // Use different system prompts based on query type
    const systemPrompt = this.getContextualSystemPrompt(filteredContext.queryType);
    const contexts = [];

    // Add filtered financial context if available
    if (filteredContext.hasData) {
      contexts.push(FinancialContextService.formatFilteredContextForAI(filteredContext));
    }

    // Add relevant chat context if available
    if (chatContext.hasChatHistory && chatContext.formattedContext) {
      // Filter chat history for relevance to current query
      const relevantChatContext = this.filterChatHistoryForRelevance(
        chatContext.formattedContext, 
        filteredContext.queryType
      );
      
      if (relevantChatContext) {
        contexts.push(`RELEVANT CONVERSATION HISTORY:\n${relevantChatContext}`);
      }
    }

    // Combine all contexts
    const contextSection = contexts.length > 0 ? 
      `\n\n=== CONTEXT ===\n${contexts.join('\n\n')}\n\n=== END CONTEXT ===\n` : '';

    const fullPrompt = `${systemPrompt}${contextSection}\n\nUser Question: ${userMessage}`;

    // Truncate if too long
    if (fullPrompt.length > this.MAX_PROMPT_LENGTH) {
      return this.createTruncatedPrompt(systemPrompt, contexts, userMessage);
    }

    return fullPrompt;
  }

  private static getContextualSystemPrompt(queryType: string): string {
    const baseInstructions = `You are a specialized Financial Assistant AI for the FinWise app. You provide personalized financial advice based on the user's actual financial data and conversation history.

GENERAL INSTRUCTIONS:
- Use the provided financial context to give personalized advice
- Reference specific numbers and patterns from their financial data
- Consider their conversation history and preferences
- Focus on actionable, practical financial guidance
- Be conversational but professional
- Always prioritize financial responsibility and user's best interests

RESPONSE STYLE:
- Use markdown formatting for better readability
- Include specific numbers and percentages when relevant
- Provide actionable steps and recommendations
- Be encouraging but realistic about financial goals`;

    switch (queryType) {
      case 'bills':
        return `${baseInstructions}

BILLS SPECIALIST FOCUS:
- Prioritize bill-related advice and strategies
- Focus on payment schedules, due dates, and overdue items
- Suggest bill management techniques and automation
- Address cash flow issues related to bills
- Recommend bill payment strategies and budgeting for bills
- Help with bill categorization and tracking
- Provide advice on negotiating with creditors if needed

Only provide information specifically related to bills and payments unless the user asks for broader financial advice.`;

      case 'subscriptions':
        return `${baseInstructions}

SUBSCRIPTION SPECIALIST FOCUS:
- Focus on subscription management and optimization
- Analyze subscription costs and value
- Suggest subscription audit strategies
- Help identify unused or underutilized subscriptions
- Provide advice on subscription bundling and alternatives
- Address recurring payment management
- Recommend subscription tracking methods

Only provide information specifically related to subscriptions and recurring services unless the user asks for broader financial advice.`;

      case 'stats':
        return `${baseInstructions}

FINANCIAL STATISTICS SPECIALIST FOCUS:
- Provide detailed financial overview and analysis
- Focus on income, expenses, savings rates, and balances
- Analyze financial ratios and performance metrics
- Explain financial trends and patterns
- Compare current vs. historical performance
- Highlight key financial indicators and their meanings
- Provide statistical insights and interpretations

Only provide statistical analysis and financial overview unless the user asks for specific advice in other areas.`;

      case 'transactions':
        return `${baseInstructions}

TRANSACTION SPECIALIST FOCUS:
- Analyze spending patterns and transaction history
- Focus on expense categorization and tracking
- Identify spending trends and anomalies
- Provide insights on purchase behavior
- Suggest expense optimization strategies
- Help with transaction organization and budgeting
- Address spending-related concerns

Only provide information specifically related to transactions and spending unless the user asks for broader financial advice.`;

      case 'investments':
        return `${baseInstructions}

INVESTMENT SPECIALIST FOCUS:
- Focus on investment strategies and portfolio management
- Analyze investment allocation and performance
- Suggest diversification strategies
- Address risk management and investment planning
- Provide market insights and investment opportunities
- Help with investment goal setting and planning
- Recommend investment products and strategies

Only provide information specifically related to investments unless the user asks for broader financial advice.`;

      case 'budgeting':
        return `${baseInstructions}

BUDGETING SPECIALIST FOCUS:
- Focus on budget creation and management
- Analyze spending categories and allocation
- Suggest budget optimization techniques
- Help with expense tracking and control
- Provide budgeting strategies and methods
- Address budget-related challenges and solutions
- Recommend budgeting tools and approaches

Only provide information specifically related to budgeting unless the user asks for broader financial advice.`;

      default:
        return `${baseInstructions}

GENERAL FINANCIAL TOPICS YOU HELP WITH:
- Personal budgeting and expense optimization
- Investment strategies and portfolio management
- Debt management and credit improvement
- Saving goals and emergency fund planning
- Financial planning and retirement preparation
- Bill and subscription management
- Transaction analysis and spending optimization

Provide comprehensive financial advice based on the user's context and needs.`;
    }
  }

  private static filterChatHistoryForRelevance(
    chatContext: string, 
    queryType: string
  ): string | null {
    // Simple keyword-based filtering for chat history relevance
    const keywords = this.getKeywordsForQueryType(queryType);
    const contextLines = chatContext.split('\n');
    
    const relevantLines = contextLines.filter(line => 
      keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))
    );

    if (relevantLines.length === 0) {
      return null;
    }

    return relevantLines.join('\n').substring(0, 500); // Limit length
  }

  private static getKeywordsForQueryType(queryType: string): string[] {
    switch (queryType) {
      case 'bills':
        return ['bill', 'payment', 'due', 'overdue', 'invoice', 'utilities', 'rent', 'mortgage'];
      case 'subscriptions':
        return ['subscription', 'recurring', 'monthly', 'netflix', 'spotify', 'service', 'membership'];
      case 'stats':
        return ['income', 'balance', 'total', 'statistics', 'overview', 'summary', 'savings'];
      case 'transactions':
        return ['transaction', 'purchase', 'spending', 'expense', 'bought', 'spent'];
      case 'investments':
        return ['investment', 'portfolio', 'stock', 'bond', 'mutual fund', 'retirement', 'trading'];
      case 'budgeting':
        return ['budget', 'spending', 'category', 'allocation', 'limit', 'control'];
      default:
        return ['financial', 'money', 'advice', 'planning'];
    }
  }

  private static createTruncatedPrompt(
    systemPrompt: string,
    contexts: string[],
    userMessage: string
  ): string {
    const availableSpace = this.MAX_PROMPT_LENGTH - systemPrompt.length - userMessage.length - 100; // Buffer
    
    if (availableSpace <= 0) {
      return `${systemPrompt}\n\nUser Question: ${userMessage}`;
    }

    // Prioritize financial context over chat history if we need to truncate
    let truncatedContext = '';
    let remainingSpace = availableSpace;

    for (const context of contexts) {
      if (context.length <= remainingSpace) {
        truncatedContext += context + '\n\n';
        remainingSpace -= context.length + 2;
      } else {
        // Partially include context
        const partialContext = context.substring(0, remainingSpace - 10) + '...';
        truncatedContext += partialContext;
        break;
      }
    }

    return `${systemPrompt}\n\n=== CONTEXT ===\n${truncatedContext}=== END CONTEXT ===\n\nUser Question: ${userMessage}`;
  }

  private static createSmartContextSummary(
    filteredContext: FilteredContext,
    chatContext: ChatContext
  ): string {
    const summaryParts = [];

    // Add query type indicator
    summaryParts.push(`🎯 Query Type: ${filteredContext.queryType.toUpperCase()}`);

    // Add relevant financial context summary
    if (filteredContext.hasData) {
      switch (filteredContext.queryType) {
        case 'bills':
          const billData = filteredContext.relevantData;
          summaryParts.push(`💳 Bills: ${billData.pendingBills?.length || 0} pending, ${billData.overdueBills?.length || 0} overdue`);
          break;
        case 'subscriptions':
          const subData = filteredContext.relevantData;
          summaryParts.push(`🔄 Subscriptions: ${subData.activeSubscriptions?.length || 0} active, $${subData.monthlyTotal?.toFixed(2) || 0}/month`);
          break;
        case 'stats':
          const statsData = filteredContext.relevantData;
          summaryParts.push(`📊 Stats: ${statsData.netIncome >= 0 ? 'Surplus' : 'Deficit'} of $${Math.abs(statsData.netIncome).toLocaleString()}`);
          break;
        case 'transactions':
          const transData = filteredContext.relevantData;
          summaryParts.push(`💰 Transactions: ${transData.transactions?.length || 0} recent, $${transData.totalSpent?.toLocaleString() || 0} spent`);
          break;
        case 'investments':
          const invData = filteredContext.relevantData;
          summaryParts.push(`📈 Investments: $${invData.totalInvestments?.toLocaleString() || 0} (${invData.investmentRatio}%)`);
          break;
        case 'budgeting':
          const budgetData = filteredContext.relevantData;
          summaryParts.push(`📋 Budget: ${budgetData.categorySpending?.length || 0} categories tracked`);
          break;
        default:
          summaryParts.push(`💰 General financial advice mode`);
      }
    }

    // Add chat context if relevant
    if (chatContext.hasChatHistory && chatContext.summary) {
      const topics = chatContext.summary.conversationTopics;
      if (topics.length > 0) {
        summaryParts.push(`💬 Previous: ${topics.slice(0, 2).join(', ')}`);
      }
    }

    if (summaryParts.length <= 1) {
      return `Providing ${filteredContext.queryType} advice - no personalized context available`;
    }

    return summaryParts.join(' • ');
  }

  private static createFallbackContext(userMessage: string): ComprehensiveContext {
    const queryType = FinancialContextService.analyzeQueryType(userMessage);
    
    return {
      financialContext: null,
      filteredContext: {
        hasData: false,
        summary: 'No financial data available',
        relevantData: null,
        insights: [],
        queryType
      },
      chatContext: {
        hasChatHistory: false,
        summary: null,
        formattedContext: ''
      },
      combinedPrompt: `${this.getContextualSystemPrompt(queryType)}\n\nUser Question: ${userMessage}`,
      contextSummary: `Providing ${queryType} advice - no personalized context available`,
      queryType
    };
  }

  // Helper method to save messages to chat history
  static saveMessageToHistory(message: ChatMessage): void {
    ChatHistoryManager.saveMessage(message);
  }

  // Helper method to clear all context data
  static clearAllContext(): void {
    ChatHistoryManager.clearChatHistory();
  }

  // Helper method to get context status for debugging
  static async getContextStatus(): Promise<{
    hasFinancialData: boolean;
    hasChatHistory: boolean;
    financialSummary: string;
    chatSummary: string;
  }> {
    try {
      const [financialContext, chatContext] = await Promise.all([
        FinancialContextService.fetchFinancialContext(),
        ChatHistoryManager.getChatContext()
      ]);

      return {
        hasFinancialData: financialContext.hasData,
        hasChatHistory: chatContext.hasChatHistory,
        financialSummary: financialContext.summary,
        chatSummary: chatContext.summary ? 
          `${chatContext.summary.conversationTopics.length} topics, ${chatContext.summary.keyInsights.length} insights` :
          'No chat summary available'
      };
    } catch (error) {
      console.error('Error getting context status:', error);
      return {
        hasFinancialData: false,
        hasChatHistory: false,
        financialSummary: 'Error loading financial data',
        chatSummary: 'Error loading chat history'
      };
    }
  }
} 