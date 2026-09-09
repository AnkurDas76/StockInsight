# 📈 StockInsight

**An agentic AI that researches stocks for you — just ask, in plain English.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent-1C3C3C)](https://www.langchain.com/langgraph)
[![Streamlit](https://img.shields.io/badge/Streamlit-UI-FF4B4B?logo=streamlit&logoColor=white)](https://streamlit.io/)
[![Ollama](https://img.shields.io/badge/Ollama-Qwen%202.5%2014B-000000)](https://ollama.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

StockInsight replaces manual ticker-hunting with a conversation. Instead of jumping between screeners, financial statements, and price charts, you ask a question — the agent decides which tools to call, fetches the right data, and hands back a clear, human-readable answer.

```
You:  "Compare Nvidia and AMD on profitability and valuation"
Bot:  Pulls financial summaries for both → compares margins, P/E, ROE → summarizes the winner and why
```

---

## ✨ Features

- **Natural Language Research** — Ask questions conversationally; no query syntax to learn.
- **Agentic Tool Calling** — The LLM autonomously decides which tool(s) a query requires.
- **Stock Screening** — Surface gainers, losers, tech stocks, undervalued picks, and more.
- **Financial Analysis** — Pull revenue, EPS, margins, P/E, debt-to-equity, ROE, and other key metrics.
- **Company Research** — Profile, sector, industry, market cap, employee count, and business summary.
- **Historical Data** — OHLC and volume data across custom time ranges.
- **Streaming Responses** — Answers render progressively for a smoother experience.
- **Persistent Conversations** — Chat history and agent state saved via SQLite.
- **Observability** — Full LLM and tool-call tracing with LangSmith.

## 🧠 Architecture

```
┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
│ Streamlit UI │ ──▶ │ LangGraph Agent │ ──▶ │  Qwen 2.5 (14B)  │
└──────────────┘     └────────────────┘     └─────────────────┘
                                                      │
                                            decides if a tool is needed
                                                      ▼
                                          ┌───────────────────────┐
                                          │  Financial Data Tools │
                                          │  (yfinance-backed)    │
                                          └───────────────────────┘
                                                      │
                                            results fed back to Qwen
                                                      ▼
                                            Final natural-language
                                                  response
```

LangGraph manages agent state and control flow; Qwen decides *when* and *which* tool to call. Tool outputs are passed back into the model, which synthesizes them into the final response — streamed to the UI in real time.

## 🛠️ Tools

| Tool | Purpose |
|---|---|
| `simple_screener` | Screen stocks using Yahoo Finance predefined market screens |
| `get_stock_price` | Get the latest price and daily change |
| `get_company_profile` | Get company profile, sector, and business info |
| `get_financial_summary` | Get key financial metrics and valuation ratios |
| `get_stock_history` | Get historical OHLC and volume data |

Tools are exposed to the LLM via LangChain function calling, so the agent chooses the right one per request — no hardcoded routing.

## 💬 Example Prompts

- *"What are today's top gaining tech stocks?"*
- *"Show me Apple's P/E ratio and debt-to-equity"*
- *"How has Tesla's stock moved over the last 6 months?"*
- *"Give me a quick profile on Palantir"*

## ⚙️ Tech Stack

**Backend & AI:** Python · LangGraph · LangChain · Qwen 2.5 (14B) · Ollama
**Data & Storage:** yfinance · SQLite
**Frontend & Observability:** Streamlit · LangSmith

## 💾 Persistence

Conversation state started as in-memory checkpoints and was upgraded to SQLite (`SqliteSaver`), enabling persistent, multi-threaded research sessions.

## 📂 Project Structure

```
StockInsight/
├── backend_flow.py     # LangGraph agent and workflow
├── frontend.py         # Streamlit interface
├── tool.py             # Financial research tools
├── chatbot.db          # SQLite checkpoint database
├── .env                # Environment configuration
└── README.md
```

## ▶️ Run Locally

```bash
# 1. Start the local Qwen model
ollama run qwen2.5:14b

# 2. Launch the app
streamlit run frontend.py
```

## 🚀 Roadmap

**Backend**
- [ ] PostgreSQL-based persistent storage
- [ ] FastAPI backend
- [ ] Agent evaluation and testing

**Features**
- [ ] Additional financial and news research tools
- [ ] Stock comparison and deeper analysis
- [ ] Structured data visualizations

**Infra & Frontend**
- [ ] Dockerization and deployment
- [ ] React/Next.js frontend

## 🤝 Contributing

Issues and PRs are welcome — this is an active learning project, and feedback is genuinely appreciated.

## 📄 License

MIT — free to use, modify, and build on.

---

*Built for educational and informational purposes only. Not financial advice.*
