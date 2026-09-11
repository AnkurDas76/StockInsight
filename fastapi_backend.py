import json
import sqlite3
import uuid
from typing import Any, Iterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field

from backend_flow import chatbot, retrieve_all_threads

load_dotenv()

app = FastAPI(
    title="StockInsight API",
    description="FastAPI backend for the StockInsight agentic stock research assistant.",
    version="1.0.0",
)

# Ready for the future React/Next.js frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    thread_id: str | None = None


class ChatResponse(BaseModel):
    thread_id: str
    response: str


class ThreadResponse(BaseModel):
    thread_id: str


class MessageResponse(BaseModel):
    role: str
    content: str


class ConversationResponse(BaseModel):
    thread_id: str
    messages: list[MessageResponse]


def new_thread_id() -> str:
    return str(uuid.uuid4())


def get_thread_config(thread_id: str) -> dict[str, Any]:
    return {
        "configurable": {"thread_id": thread_id},
        "metadata": {"thread_id": thread_id},
        "run_name": "stock_research_chat",
    }


def content_to_text(content: Any) -> str:
    """Normalize LangChain message content into plain text."""
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                text = block.get("text")
                if isinstance(text, str):
                    parts.append(text)
        return "".join(parts)

    return str(content) if content is not None else ""


def get_conversation_messages(thread_id: str) -> list[MessageResponse]:
    try:
        state = chatbot.get_state(
            config={"configurable": {"thread_id": thread_id}}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load conversation: {exc}",
        ) from exc

    values = state.values or {}
    messages = values.get("messages", [])

    result: list[MessageResponse] = []

    for message in messages:
        # Tool messages are intentionally hidden from the API's chat history.
        message_type = getattr(message, "type", "")
        if message_type == "tool":
            continue

        if message_type == "human":
            role = "user"
        elif message_type == "ai":
            role = "assistant"
        else:
            continue

        text = content_to_text(getattr(message, "content", ""))
        if text:
            result.append(MessageResponse(role=role, content=text))

    return result


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "stockinsight-api"}


@app.post("/conversations", response_model=ThreadResponse)
def create_conversation() -> ThreadResponse:
    return ThreadResponse(thread_id=new_thread_id())


@app.get("/conversations", response_model=list[ThreadResponse])
def list_conversations() -> list[ThreadResponse]:
    try:
        thread_ids = retrieve_all_threads()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve conversations: {exc}",
        ) from exc

    return [
        ThreadResponse(thread_id=str(thread_id))
        for thread_id in thread_ids
    ]


@app.get(
    "/conversations/{thread_id}",
    response_model=ConversationResponse,
)
def get_conversation(thread_id: str) -> ConversationResponse:
    # A missing thread simply has no checkpoint/state yet.
    messages = get_conversation_messages(thread_id)
    return ConversationResponse(
        thread_id=thread_id,
        messages=messages,
    )


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    thread_id = request.thread_id or new_thread_id()

    try:
        result = chatbot.invoke(
            {"messages": [HumanMessage(content=request.message)]},
            config=get_thread_config(thread_id),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Agent execution failed: {exc}",
        ) from exc

    messages = result.get("messages", [])
    if not messages:
        raise HTTPException(
            status_code=500,
            detail="Agent returned no messages.",
        )

    response_text = content_to_text(messages[-1].content)

    return ChatResponse(
        thread_id=thread_id,
        response=response_text,
    )


def stream_chat(message: str, thread_id: str) -> Iterator[str]:
    """Stream only chatbot/model text as Server-Sent Events.

    Tool execution messages are deliberately filtered so raw yfinance/tool
    output is not sent to the frontend.
    """
    try:
        for message_chunk, metadata in chatbot.stream(
            {"messages": [HumanMessage(content=message)]},
            config=get_thread_config(thread_id),
            stream_mode="messages",
        ):
            if metadata.get("langgraph_node") != "chatbot":
                continue

            text = content_to_text(getattr(message_chunk, "content", ""))
            if not text:
                continue

            payload = json.dumps(
                {
                    "type": "token",
                    "thread_id": thread_id,
                    "content": text,
                },
                ensure_ascii=False,
            )
            yield f"data: {payload}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'thread_id': thread_id})}\n\n"

    except Exception as exc:
        payload = json.dumps(
            {
                "type": "error",
                "thread_id": thread_id,
                "error": str(exc),
            },
            ensure_ascii=False,
        )
        yield f"data: {payload}\n\n"


@app.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    thread_id = request.thread_id or new_thread_id()

    return StreamingResponse(
        stream_chat(request.message, thread_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "fastapi_backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
