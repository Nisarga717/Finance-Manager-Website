import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
  retryMessage?: string;
}

export interface ChatSummary {
  totalMessages: number;
  conversationTopics: string[];
  keyInsights: string[];
  userPreferences: string[];
  lastSummaryDate: Date;
  recentMessages: ChatMessage[];
}

export interface ChatContext {
  hasChatHistory: boolean;
  summary: ChatSummary | null;
  formattedContext: string;
}

export class ChatHistoryManager {
  private static readonly STORAGE_KEY = 'fin-wise-chat-history';
  private static readonly SUMMARY_THRESHOLD = 10; // Summarize after 10 messages
  private static readonly RECENT_MESSAGES_COUNT = 5; // Keep last 5 messages
  private static readonly MAX_CONTEXT_LENGTH = 1000; // Max chars for context

  static saveMessage(message: ChatMessage): void {
    try {
      const history = this.getChatHistory();
      history.push(message);
      
      // Keep only recent messages to prevent storage bloat
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  static getChatHistory(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const history = JSON.parse(stored);
      return history.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  static clearChatHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_KEY + '-summary');
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  static async getChatContext(): Promise<ChatContext> {
    try {
      const history = this.getChatHistory();
      
      if (history.length === 0) {
        return {
          hasChatHistory: false,
          summary: null,
          formattedContext: ''
        };
      }

      // Filter out error messages for cleaner context
      const validMessages = history.filter(msg => !msg.isError);
      
      if (validMessages.length < 3) {
        return {
          hasChatHistory: true,
          summary: null,
          formattedContext: this.formatRecentMessages(validMessages)
        };
      }

      // Check if we need to create/update summary
      const summary = await this.getSummary(validMessages);
      
      return {
        hasChatHistory: true,
        summary,
        formattedContext: this.formatContextForAI(summary, validMessages)
      };
    } catch (error) {
      console.error('Error getting chat context:', error);
      return {
        hasChatHistory: false,
        summary: null,
        formattedContext: ''
      };
    }
  }

  private static async getSummary(messages: ChatMessage[]): Promise<ChatSummary> {
    try {
      const existingSummary = this.getStoredSummary();
      const recentMessages = messages.slice(-this.RECENT_MESSAGES_COUNT);
      
      // If we have a recent summary and not many new messages, use it
      if (existingSummary && messages.length - existingSummary.totalMessages < this.SUMMARY_THRESHOLD) {
        return {
          ...existingSummary,
          recentMessages
        };
      }

      // Create new summary
      const summary = await this.generateSummary(messages);
      this.storeSummary(summary);
      
      return {
        ...summary,
        recentMessages
      };
    } catch (error) {
      console.error('Error creating summary:', error);
      return this.createBasicSummary(messages);
    }
  }

  private static getStoredSummary(): ChatSummary | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY + '-summary');
      if (!stored) return null;
      
      const summary = JSON.parse(stored);
      return {
        ...summary,
        lastSummaryDate: new Date(summary.lastSummaryDate)
      };
    } catch (error) {
      console.error('Error loading stored summary:', error);
      return null;
    }
  }

  private static storeSummary(summary: ChatSummary): void {
    try {
      localStorage.setItem(this.STORAGE_KEY + '-summary', JSON.stringify(summary));
    } catch (error) {
      console.error('Error storing summary:', error);
    }
  }

  private static async generateSummary(messages: ChatMessage[]): Promise<ChatSummary> {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const conversationText = messages
        .filter(msg => !msg.isError)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `
Analyze this financial conversation and provide a concise summary:

CONVERSATION:
${conversationText}

Please provide a JSON response with:
{
  "conversationTopics": ["topic1", "topic2", ...],
  "keyInsights": ["insight1", "insight2", ...],
  "userPreferences": ["preference1", "preference2", ...]
}

Focus on financial topics discussed, key insights about the user's financial situation, and any preferences or goals mentioned.
      `.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(text);
        return {
          totalMessages: messages.length,
          conversationTopics: parsed.conversationTopics || [],
          keyInsights: parsed.keyInsights || [],
          userPreferences: parsed.userPreferences || [],
          lastSummaryDate: new Date(),
          recentMessages: []
        };
      } catch (parseError) {
        // Fallback to basic summary if JSON parsing fails
        return this.createBasicSummary(messages);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return this.createBasicSummary(messages);
    }
  }

  private static createBasicSummary(messages: ChatMessage[]): ChatSummary {
    const userMessages = messages.filter(msg => msg.role === 'user' && !msg.isError);
    const topics = this.extractTopicsFromMessages(userMessages);
    
    return {
      totalMessages: messages.length,
      conversationTopics: topics,
      keyInsights: [`User has asked ${userMessages.length} questions about financial topics`],
      userPreferences: [],
      lastSummaryDate: new Date(),
      recentMessages: []
    };
  }

  private static extractTopicsFromMessages(messages: ChatMessage[]): string[] {
    const topics: string[] = [];
    const keywords = {
      'budgeting': ['budget', 'expense', 'spending', 'income'],
      'investing': ['invest', 'stock', 'portfolio', 'market'],
      'saving': ['save', 'savings', 'emergency fund'],
      'debt': ['debt', 'loan', 'credit', 'mortgage'],
      'insurance': ['insurance', 'coverage', 'policy'],
      'retirement': ['retirement', '401k', 'pension', 'ira']
    };

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word)) && !topics.includes(topic)) {
          topics.push(topic);
        }
      });
    });

    return topics;
  }

  private static formatRecentMessages(messages: ChatMessage[]): string {
    if (messages.length === 0) return '';
    
    const recent = messages.slice(-3);
    return `
RECENT CONVERSATION:
${recent.map(msg => `${msg.role}: ${msg.content.substring(0, 100)}...`).join('\n')}
    `.trim();
  }

  private static formatContextForAI(summary: ChatSummary, messages: ChatMessage[]): string {
    const parts = [];
    
    if (summary.conversationTopics.length > 0) {
      parts.push(`PREVIOUS TOPICS DISCUSSED: ${summary.conversationTopics.join(', ')}`);
    }
    
    if (summary.keyInsights.length > 0) {
      parts.push(`KEY INSIGHTS FROM PAST CONVERSATIONS:\n${summary.keyInsights.map(insight => `• ${insight}`).join('\n')}`);
    }
    
    if (summary.userPreferences.length > 0) {
      parts.push(`USER PREFERENCES:\n${summary.userPreferences.map(pref => `• ${pref}`).join('\n')}`);
    }
    
    // Add recent messages
    const recentMessages = messages.slice(-this.RECENT_MESSAGES_COUNT);
    if (recentMessages.length > 0) {
      parts.push(`RECENT MESSAGES:\n${recentMessages.map(msg => 
        `${msg.role}: ${msg.content.substring(0, 150)}...`
      ).join('\n')}`);
    }
    
    const context = parts.join('\n\n');
    
    // Truncate if too long
    if (context.length > this.MAX_CONTEXT_LENGTH) {
      return context.substring(0, this.MAX_CONTEXT_LENGTH) + '...';
    }
    
    return context;
  }
} 