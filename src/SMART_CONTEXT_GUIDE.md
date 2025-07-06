# 🎯 Smart Context System Guide

## Overview

The FinWise Financial Chatbot now features an **intelligent context system** that analyzes your questions and provides only the most relevant financial information. Instead of overwhelming you with all your financial data, it focuses on exactly what you're asking about.

## 🔍 How It Works

### 1. Query Analysis
The system analyzes your questions using keyword detection to determine what type of financial information you're seeking:

- **Bills**: "payment", "due", "overdue", "bill"
- **Subscriptions**: "subscription", "recurring", "monthly service", "Netflix"
- **Stats**: "overview", "summary", "total", "balance", "statistics"
- **Transactions**: "spending", "purchase", "expense", "bought"
- **Investments**: "portfolio", "stock", "investment", "retirement"
- **Budgeting**: "budget", "category", "allocation", "spending limit"

### 2. Context Filtering
Based on your query type, the system fetches only relevant data:

#### 📊 **Stats Context**
- Monthly income/expenses
- Savings rate
- Investment allocation
- Net surplus/deficit

#### 💳 **Bills Context**
- Pending bills with amounts
- Overdue bills requiring attention
- Upcoming payment dates
- Recurring vs one-time bills

#### 🔄 **Subscriptions Context**
- Active subscriptions
- Monthly/annual costs
- Next billing dates
- Subscription categories

#### 💰 **Transactions Context**
- Recent purchase history
- Spending patterns
- Transaction categories
- Total amounts spent

#### 📈 **Investments Context**
- Portfolio value
- Investment allocation percentage
- Investment-to-balance ratio

#### 📋 **Budgeting Context**
- Category breakdown
- Spending percentages
- Top spending categories
- Budget allocation analysis

## 🎨 Specialized Responses

Each context type has a specialized AI assistant that focuses exclusively on that area:

### Bills Specialist
- Payment scheduling strategies
- Overdue bill management
- Bill automation recommendations
- Cash flow optimization for bills

### Subscriptions Specialist
- Subscription audit strategies
- Cost optimization tips
- Unused subscription identification
- Recurring payment management

### Stats Specialist
- Financial performance analysis
- Trend identification
- Ratio explanations
- Performance metrics

### Transaction Specialist
- Spending pattern analysis
- Expense optimization
- Purchase behavior insights
- Transaction categorization

### Investment Specialist
- Portfolio management advice
- Asset allocation strategies
- Investment planning
- Risk assessment

### Budgeting Specialist
- Budget creation strategies
- Expense control techniques
- Category optimization
- Budgeting methods

## 🚀 Usage Examples

### Example 1: Bills Query
**You ask:** "What bills do I have coming up?"
**System analyzes:** Detects "bills" keyword
**Context provided:** Only bills data - pending, overdue, upcoming
**Response:** Focused bill management advice with specific amounts and dates

### Example 2: Subscription Query
**You ask:** "How much am I spending on subscriptions?"
**System analyzes:** Detects "subscriptions" keyword
**Context provided:** Only subscription data - active services, costs, billing cycles
**Response:** Subscription optimization advice with monthly/annual totals

### Example 3: Stats Query
**You ask:** "Show me my financial overview"
**System analyzes:** Detects "overview" keyword
**Context provided:** Financial statistics - income, expenses, savings rate
**Response:** Comprehensive financial analysis with key metrics

## 🔧 Technical Features

### Smart Chat History
- Filters previous conversations for relevance
- Only shows chat history related to current query type
- Reduces information overload

### Context Prioritization
- Bills context prioritizes overdue items
- Subscription context focuses on active services
- Stats context highlights key financial ratios

### Intelligent Prompts
- Different AI instructions for each context type
- Specialized knowledge base for each financial area
- Context-aware response generation

## 🎯 Benefits

1. **Focused Responses**: Get answers specific to your question
2. **Reduced Noise**: No irrelevant information cluttering responses
3. **Faster Processing**: Smaller context = faster AI responses
4. **Better Accuracy**: Specialized prompts = more accurate advice
5. **Personalized Advice**: Uses your actual financial data
6. **Context Awareness**: Remembers relevant conversation history

## 📱 Quick Actions

Use the quick action buttons to test different context types:
- **Stats**: "Show me my financial statistics"
- **Bills**: "What bills do I have coming up?"
- **Subscriptions**: "How much am I spending on subscriptions?"
- **Budget**: "Help me create a monthly budget"

## 🔍 Debug Information

The chatbot includes a debug tool (🔧 button) that shows:
- API key status
- Available financial data
- Chat history status
- Context features active

## 💡 Pro Tips

1. **Be Specific**: Use keywords like "bills", "subscriptions", "stats" for better context detection
2. **Ask Follow-ups**: Within the same context, ask related questions for consistent responses
3. **Mix Contexts**: Ask general questions to get comprehensive advice
4. **Use Quick Actions**: Test different context types easily
5. **Check Debug Info**: Use the debug tool to verify your data is loading correctly

## 🛠️ Technical Implementation

The system uses:
- **Query Analysis**: Keyword-based intent detection
- **Context Filtering**: Tailored data fetching for each query type
- **Smart Prompting**: Specialized AI instructions per context
- **History Filtering**: Relevant conversation memory
- **Response Optimization**: Context-specific advice generation

This intelligent system ensures you get precisely the financial advice you need, when you need it, without information overload! 🎉 