# AI Stock Research & Screening Agent

An agentic AI application that helps users research and screen stocks using natural language.

The project uses **Qwen 2.5 (14B) with Ollama**, **LangGraph** for agent workflow, **yfinance** for market data, and **Streamlit** for the user interface.

## 🚀 Features

- Natural-language stock research
- LLM-based tool selection
- Stock screening using Yahoo Finance
- Current stock price information
- Company profile information
- Financial metrics and ratios
- Historical stock price data
- Streaming AI responses
- Multiple research conversations
- Persistent conversation state using SQLite
- LangSmith integration for agent tracing and observability

## 🛠️ Tech Stack

- Python
- LangGraph
- LangChain
- Qwen 2.5 14B
- Ollama
- yfinance
- Streamlit
- SQLite
- LangSmith

## 🔧 Available Tools

The agent currently has five tools:

1. **`simple_screener`** – Finds stocks using Yahoo Finance's predefined screens such as day gainers, day losers, technology stocks, undervalued stocks, etc.
2. **`get_stock_price`** – Retrieves the latest available stock price and basic price-change information.
3. **`get_company_profile`** – Retrieves company information such as sector, industry, country, market cap, employees, and business description.
4. **`get_financial_summary`** – Retrieves important financial metrics such as revenue, margins, EPS, P/E, debt-to-equity, and ROE.
5. **`get_stock_history`** – Retrieves historical price data for different periods.

The LLM decides which tool is required based on the user's query.

## 🧠 Agent Workflow

```text
User
  ↓
Streamlit
  ↓
LangGraph
  ↓
Qwen 2.5 via Ollama
  ↓
Tool required?
  ├── No → Final Response
  │
  └── Yes
       ↓
      Tool
       ↓
   Market Data
       ↓
      Qwen
       ↓
   Final Response
```

LangGraph manages the state and workflow between the LLM and tools.

## 💾 Persistence

The project initially used `InMemorySaver`, but it has been upgraded to **SQLite using `SqliteSaver`**.

This allows conversations and LangGraph checkpoints to persist between sessions.

## 💬 Streamlit Interface

The current frontend includes:

- AI stock research chat
- New research conversations
- Conversation history
- Multiple threads
- Persistent thread IDs
- Streaming responses

## 🔍 LangSmith

LangSmith is integrated for tracing and monitoring the agent's execution, including LLM calls and tool usage.

Configuration is stored in `.env`.

## 📂 Project Structure

```text
project/
├── backend_flow.py
├── frontend.py
├── tool.py
├── chatbot.db
├── .env
└── README.md
```

## ▶️ Run Locally

Make sure Ollama is running and the Qwen model is available:

```bash
ollama run qwen2.5:14b
```

Then start the Streamlit application:

```bash
streamlit run frontend.py
```

## 🔮 Future Improvements

- PostgreSQL database
- More financial and research tools
- News analysis
- Stock comparison
- Better structured outputs
- Agent evaluation and testing
- Docker and deployment
- Advanced React/Next.js frontend
- FastAPI backend

## ⚠️ Disclaimer

This project is for educational and informational purposes only and does not provide personalized financial advice.
