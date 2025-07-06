import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  TrendingUp,
  DollarSign,
  PieChart,
  Loader2
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { ContextBuilder } from '../lib/contextBuilder';
import { ChatMessage } from '../lib/chatHistoryManager';

// Use ChatMessage interface from our chat history manager
type Message = ChatMessage;

const FinancialChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your **Financial Assistant** 💰. I'm here to help you with:\n\n• **Budgeting** and expense tracking\n• **Investment** strategies and portfolio management\n• **Saving** goals and emergency funds\n• **Debt management** and credit improvement\n• **Financial planning** for your future\n\nHow can I assist you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Note: Financial prompts are now handled by ContextBuilder

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    // Dynamic loading messages with context awareness
    const loadingMessages = [
      'Analyzing your question...',
      'Determining context type...',
      'Fetching relevant financial data...',
      'Filtering for specific information...',
      'Reviewing conversation history...',
      'Generating personalized advice...',
      'Preparing your response...'
    ];
    
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    
    // Cycle through loading messages
    const loadingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1200);

    try {
      // Check if API key is available
      if (!process.env.REACT_APP_GEMINI_API_KEY) {
        throw new Error('API_KEY_MISSING');
      }

      // Save user message to history
      ContextBuilder.saveMessageToHistory(userMessage);

      // Build comprehensive context using our new services
      const contextData = await ContextBuilder.buildComprehensiveContext(userMessage.content);

      // Initialize Google Gemini client
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Generate response using the comprehensive context
      const result = await model.generateContent(contextData.combinedPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse || "I apologize, but I couldn't generate a response. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };

      // Save assistant message to history
      ContextBuilder.saveMessageToHistory(assistantMessage);

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack',
        name: error instanceof Error ? error.name : 'Unknown',
        cause: error instanceof Error ? error.cause : 'No cause'
      });
      
      let errorMessage = '';
      
      // Handle OpenAI SDK specific errors with detailed debugging
      if (error instanceof Error) {
        // Log the exact error for debugging
        const errorDetails = `\n\n🔍 **Debug Info**:\nError: ${error.message}\nType: ${error.name}`;
        
        if (error.message.includes('API_KEY_MISSING')) {
          errorMessage = '🔑 **API Key Required**\n\nTo use the AI assistant, please:\n1. Get a free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)\n2. Create a `.env` file in the frontend folder\n3. Add: `REACT_APP_GEMINI_API_KEY=your_key_here`\n4. Restart the application' + errorDetails;
        } else if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('API key') || error.message.includes('Unauthorized') || error.message.includes('INVALID_ARGUMENT')) {
          errorMessage = '❌ **Invalid API Key**\n\nYour Google Gemini API key appears to be invalid or expired. Please:\n1. Check your API key in the `.env` file\n2. Verify it\'s correctly formatted\n3. Generate a new key at aistudio.google.com\n4. Restart the development server' + errorDetails;
        } else if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED') || error.message.includes('exceeded your quota')) {
          errorMessage = '💳 **Quota Exceeded**\n\nYour Google Gemini API has hit daily limits:\n• Free tier: 1,500 requests per day\n• Resets every 24 hours\n• Check usage at aistudio.google.com\n• Wait until tomorrow or upgrade plan' + errorDetails;
        } else if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('RATE_LIMIT_EXCEEDED')) {
          errorMessage = '⏱️ **Rate Limit Exceeded**\n\nYou\'ve hit Google Gemini\'s rate limits:\n• Free tier: 15 requests per minute\n• Wait a minute before trying again\n• Much more generous than OpenAI!\n\n💡 **Tip**: Gemini resets quickly, just wait 60 seconds.' + errorDetails;
        } else if (error.message.includes('500') || error.message.includes('server') || error.message.includes('INTERNAL')) {
          errorMessage = '🔧 **Server Error**\n\nGoogle Gemini servers are experiencing issues. Please try again in a few minutes.' + errorDetails;
        } else if (error.message.includes('insufficient_quota') || error.message.includes('QUOTA_EXCEEDED')) {
          errorMessage = '💳 **Quota Exceeded**\n\nYour Google Gemini API has hit daily limits:\n• Free tier: 1,500 requests per day\n• Resets every 24 hours\n• Check usage at aistudio.google.com\n• Wait until tomorrow or upgrade plan' + errorDetails;
        } else {
          errorMessage = '⚠️ **Connection Error**\n\nUnable to connect to the AI service. Please check your internet connection and try again.' + errorDetails;
        }
      } else {
        errorMessage = '⚠️ **Unknown Error**\n\nSomething went wrong. Please try again or check your internet connection.\n\n🔍 **Debug Info**: ' + JSON.stringify(error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date(),
        isError: true,
        retryMessage: userMessage.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      clearInterval(loadingInterval);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    // Clear all context (chat history and summaries)
    ContextBuilder.clearAllContext();
    
    const welcomeMessage: Message = {
      id: '1',
      content: "Chat cleared! 🧹 I'm here to help with your **financial questions**. What would you like to know about managing your money?",
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const testSubscriptionData = async () => {
    console.log('🧪 Testing subscription data...');
    
    const testMessage: Message = {
      id: Date.now().toString(),
      content: "🧪 **Testing Subscription Data**\n\nRunning comprehensive subscription test... Check browser console for detailed logs.",
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, testMessage]);
    
    // Test the subscription data fetching
    try {
      // First, let's test the direct financial context
      const { FinancialContextService } = await import('../lib/financialContextService');
      const userId = await FinancialContextService.getCurrentUserId();
      console.log('👤 Current user ID:', userId);
      
      if (!userId) {
        throw new Error('No user ID found - user might not be logged in');
      }
      
      // Test direct subscription fetch
      const directSubscriptions = await FinancialContextService.fetchSubscriptions(userId);
      console.log('📋 Direct subscription fetch result:', directSubscriptions);
      
      // Test full context
      const context = await ContextBuilder.buildComprehensiveContext("Show me my subscriptions");
      console.log('🔍 Full context:', context);
      
      const subscriptionData = context.filteredContext?.relevantData;
      console.log('🔄 Subscription data:', subscriptionData);
      
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `**🧪 Comprehensive Test Results:**

**👤 User Status:**
• User ID: ${userId ? '✅ Found' : '❌ Not Found'}
• User ID Value: ${userId || 'None'}

**📋 Direct Fetch:**
• Subscriptions Found: ${directSubscriptions?.length || 0}
• Raw Data: ${JSON.stringify(directSubscriptions, null, 2)}

**🔍 Context Test:**
• Query Type: ${context.queryType}
• Has Data: ${context.filteredContext?.hasData ? 'Yes' : 'No'}
• Active Subscriptions: ${subscriptionData?.activeSubscriptions?.length || 0}
• Monthly Total: $${subscriptionData?.monthlyTotal?.toFixed(2) || '0.00'}

**📊 Full Context Summary:**
\`\`\`
${context.filteredContext?.summary || 'No summary available'}
\`\`\`

**🔍 Console Logs:** Check browser console for detailed database query logs.`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `**❌ Test Failed:**

**Error:** ${error instanceof Error ? error.message : 'Unknown error'}

**Possible Issues:**
• User not logged in
• Database connection issue
• Table name mismatch
• Permission issue

**Next Steps:**
1. Check if you're logged in to the app
2. Verify your subscription data exists in the database
3. Check browser console for detailed error logs

**Error Details:**
\`\`\`
${error instanceof Error ? error.stack : JSON.stringify(error)}
\`\`\``,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const retryMessage = (originalMessage: string) => {
    setCurrentMessage(originalMessage);
    // Auto-send the retry message
    setTimeout(() => {
      if (originalMessage.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          content: originalMessage.trim(),
          role: 'user',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);
        
        // Dynamic loading messages (same as sendMessage)
        const loadingMessages = [
          'Retrying your request...',
          'Processing financial data...',
          'Generating personalized advice...',
          'Consulting financial knowledge...',
          'Preparing your response...'
        ];
        
        let messageIndex = 0;
        setLoadingMessage(loadingMessages[0]);
        
        const loadingInterval = setInterval(() => {
          messageIndex = (messageIndex + 1) % loadingMessages.length;
          setLoadingMessage(loadingMessages[messageIndex]);
        }, 1500);

        // Continue with the same API call logic as sendMessage
        (async () => {
          try {
            if (!process.env.REACT_APP_GEMINI_API_KEY) {
              throw new Error('API_KEY_MISSING');
            }

            // Save user message to history (for retry)
            ContextBuilder.saveMessageToHistory(userMessage);

            // Build comprehensive context using our new services
            const contextData = await ContextBuilder.buildComprehensiveContext(originalMessage);

            // Initialize Google Gemini client
            const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Generate response using the comprehensive context
            const result = await model.generateContent(contextData.combinedPrompt);
            const response = await result.response;
            const aiResponse = response.text();

            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: aiResponse || "I apologize, but I couldn't generate a response. Please try again.",
              role: 'assistant',
              timestamp: new Date()
            };

            // Save assistant message to history
            ContextBuilder.saveMessageToHistory(assistantMessage);

            setMessages(prev => [...prev, assistantMessage]);
          } catch (error) {
            console.error('Retry error:', error);
            
            let errorMessage = '';
            
            // Handle Google Gemini API specific errors (same as main sendMessage function)
            if (error instanceof Error) {
              if (error.message.includes('API_KEY_MISSING')) {
                errorMessage = '🔑 **API Key Required**\n\nTo use the AI assistant, please:\n1. Get a free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)\n2. Create a `.env` file in the frontend folder\n3. Add: `REACT_APP_GEMINI_API_KEY=your_key_here`\n4. Restart the application';
              } else if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('API key') || error.message.includes('INVALID_ARGUMENT')) {
                errorMessage = '❌ **Invalid API Key**\n\nYour Google Gemini API key appears to be invalid or expired. Please:\n1. Check your API key in the `.env` file\n2. Verify it\'s correctly formatted\n3. Generate a new key at aistudio.google.com\n4. Restart the development server';
              } else if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('RATE_LIMIT_EXCEEDED')) {
                errorMessage = '⏱️ **Rate Limit Exceeded**\n\nYou\'ve hit Google Gemini\'s rate limits:\n• Free tier: 15 requests per minute\n• Wait a minute before trying again\n• Much more generous than OpenAI!\n\n💡 **Tip**: Gemini resets quickly, just wait 60 seconds.';
              } else if (error.message.includes('500') || error.message.includes('server') || error.message.includes('INTERNAL')) {
                errorMessage = '🔧 **Server Error**\n\nGoogle Gemini servers are experiencing issues. Please try again in a few minutes.';
              } else {
                errorMessage = '⚠️ **Connection Error**\n\nUnable to connect to the AI service. Please check your internet connection and try again.';
              }
            } else {
              errorMessage = '⚠️ **Unknown Error**\n\nSomething went wrong. Please try again or check your internet connection.';
            }

            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: errorMessage,
              role: 'assistant',
              timestamp: new Date(),
              isError: true,
              retryMessage: originalMessage
            };

            setMessages(prev => [...prev, assistantMessage]);
          } finally {
            clearInterval(loadingInterval);
            setIsLoading(false);
            setLoadingMessage('');
          }
        })();
      }
    }, 100);
  };

  // Enhanced debug function to check API key and context status
  const debugAPIKey = async () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const apiDebugInfo = {
      hasApiKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
      keyFormat: apiKey ? (apiKey.startsWith('AIza') ? 'correct' : 'unknown format') : 'missing'
    };

    // Get context status
    const contextStatus = await ContextBuilder.getContextStatus();
    
    // Test subscription data specifically
    const testSubscriptionData = await ContextBuilder.buildComprehensiveContext("How much am I spending on subscriptions?");
    
    const debugMessage: Message = {
      id: Date.now().toString(),
      content: `🔧 **System Debug Information**

**🔑 API Key Status:**
• Present: ${apiDebugInfo.hasApiKey ? '✅ Yes' : '❌ No'}
• Length: ${apiDebugInfo.keyLength} characters
• Prefix: ${apiDebugInfo.keyPrefix}
• Format: ${apiDebugInfo.keyFormat}

**💰 Financial Context:**
• Data Available: ${contextStatus.hasFinancialData ? '✅ Yes' : '❌ No'}
• Summary: ${contextStatus.financialSummary}

**💬 Chat Context:**
• History Available: ${contextStatus.hasChatHistory ? '✅ Yes' : '❌ No'}
• Summary: ${contextStatus.chatSummary}

**🔄 Subscription Debug:**
• Query Type: ${testSubscriptionData.queryType}
• Context Has Data: ${testSubscriptionData.filteredContext?.hasData ? '✅ Yes' : '❌ No'}
• Active Subscriptions: ${testSubscriptionData.filteredContext?.relevantData?.activeSubscriptions?.length || 0}
• Monthly Total: $${testSubscriptionData.filteredContext?.relevantData?.monthlyTotal?.toFixed(2) || '0.00'}

**🎯 Context Features:**
• Real-time financial stats: ${contextStatus.hasFinancialData ? 'Active' : 'Inactive'}
• Conversation memory: ${contextStatus.hasChatHistory ? 'Active' : 'Inactive'}
• Personalized advice: ${contextStatus.hasFinancialData || contextStatus.hasChatHistory ? 'Enhanced' : 'General'}

${!apiDebugInfo.hasApiKey ? '\n**⚠️ Fix**: Create .env file with REACT_APP_GEMINI_API_KEY=your_key' : apiDebugInfo.keyFormat === 'unknown format' ? '\n**⚠️ Note**: Gemini keys usually start with "AIza"' : '\n**✅ Status**: System ready for personalized financial advice'}

**🔍 Quick Test**: Check browser console for detailed subscription data logs.`,
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, debugMessage]);
  };

  return (
    <>
      {/* Backdrop Overlay when chat is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
          onClick={toggleChat}
        />
      )}

      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[110]">
        <Button
          onClick={toggleChat}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          } text-white border-2 border-white/20`}
          size="lg"
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <div className="relative">
              <MessageCircle className="h-8 w-8" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          )}
        </Button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-24 right-4 sm:right-6 z-[105] w-full max-w-sm sm:max-w-md md:w-96 max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-300">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Financial Assistant</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-purple-100">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={testSubscriptionData}
                    className="text-white hover:bg-white/20 p-2"
                    title="Test Subscription Data"
                  >
                    🧪
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={debugAPIKey}
                    className="text-white hover:bg-white/20 p-2"
                    title="Debug API Key"
                  >
                    🔧
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-white hover:bg-white/20 p-2"
                    title="Clear Chat"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages Container */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-blue-50/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white shadow-md border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className={`text-sm markdown-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                            <ReactMarkdown
                              components={{
                                // Custom styling for markdown elements
                                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                                strong: ({ children }) => <strong className={`font-bold ${message.role === 'user' ? 'text-white' : 'text-purple-700'}`}>{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                h1: ({ children }) => <h1 className={`text-lg font-bold mb-2 ${message.role === 'user' ? 'text-white' : 'text-purple-700'}`}>{children}</h1>,
                                h2: ({ children }) => <h2 className={`text-base font-bold mb-2 ${message.role === 'user' ? 'text-white' : 'text-purple-700'}`}>{children}</h2>,
                                h3: ({ children }) => <h3 className={`text-sm font-bold mb-1 ${message.role === 'user' ? 'text-white' : 'text-purple-700'}`}>{children}</h3>,
                                code: ({ children }) => <code className={`px-2 py-1 rounded text-xs font-mono ${message.role === 'user' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>{children}</code>,
                                blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 italic mb-2 ${message.role === 'user' ? 'border-white/30 text-white/90' : 'border-purple-300 text-gray-600'}`}>{children}</blockquote>,
                                a: ({ href, children }) => <a href={href} className={`underline ${message.role === 'user' ? 'text-white hover:text-white/80' : 'text-purple-600 hover:text-purple-700'}`} target="_blank" rel="noopener noreferrer">{children}</a>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <span className={`text-xs ${message.role === 'user' ? 'text-purple-100' : 'text-gray-500'} mt-1 block`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.isError && message.retryMessage && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryMessage(message.retryMessage!)}
                              className="mt-3 text-purple-600 border-purple-300 hover:bg-purple-50 text-xs"
                              disabled={isLoading}
                            >
                              🔄 Try Again
                            </Button>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-md border border-gray-200 rounded-2xl p-3 max-w-[80%]">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">{loadingMessage}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about budgeting, investing, saving..."
                      className="pr-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-purple-50 text-xs"
                    onClick={() => setCurrentMessage("Show me my financial statistics")}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Stats
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-purple-50 text-xs"
                    onClick={() => setCurrentMessage("What bills do I have coming up?")}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Bills
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-purple-50 text-xs"
                    onClick={() => setCurrentMessage("Show me my active subscriptions")}
                  >
                    <PieChart className="h-3 w-3 mr-1" />
                    Subscriptions
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-purple-50 text-xs"
                    onClick={() => setCurrentMessage("Help me create a monthly budget")}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Budget
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FinancialChatbot; 