import streamlit as st
from backend_flow import chatbot, retrieve_all_threads
from langchain_core.messages import HumanMessage
import uuid


# -----------------------------
# Thread Management
# -----------------------------

def generate_thread_id():
    return uuid.uuid4()


def reset_chat():
    thread_id = generate_thread_id()

    st.session_state["thread_id"] = thread_id
    add_thread(thread_id)

    st.session_state["message_history"] = []


def add_thread(thread_id):
    if thread_id not in st.session_state["chat_threads"]:
        st.session_state["chat_threads"].append(thread_id)


def load_conversation(thread_id):
    return chatbot.get_state(
        config={"configurable": {"thread_id": thread_id}}
    ).values["messages"]


# -----------------------------
# Initialize Session State
# -----------------------------

if "message_history" not in st.session_state:
    st.session_state["message_history"] = []


if "thread_id" not in st.session_state:
    st.session_state["thread_id"] = generate_thread_id()


if "chat_threads" not in st.session_state:
    st.session_state["chat_threads"] = retrieve_all_threads()


add_thread(st.session_state["thread_id"])


# -----------------------------
# Sidebar
# -----------------------------

st.sidebar.title("📈 AI Stock Research Assistant")

if st.sidebar.button("➕ New Research Chat"):
    reset_chat()

st.sidebar.header("💬 Research History")


for thread_id in st.session_state["chat_threads"][::-1]:

    if st.sidebar.button(
        f"Research {str(thread_id)[:8]}",
        key=f"thread_{thread_id}"
    ):
        st.session_state["thread_id"] = thread_id

        messages = load_conversation(thread_id)

        temp_messages = []

        for message in messages:

            if isinstance(message, HumanMessage):
                role = "user"
            else:
                role = "assistant"

            temp_messages.append({
                "role": role,
                "content": message.content
            })

        st.session_state["message_history"] = temp_messages


# -----------------------------
# Main Chat Area
# -----------------------------

st.title("📈 AI Stock Research Assistant")

st.caption(
    "Ask questions about stocks, market data, company information, "
    "financial metrics, and historical performance."
)


# -----------------------------
# Display Conversation History
# -----------------------------

for message in st.session_state["message_history"]:

    with st.chat_message(message["role"]):
        st.write(message["content"])


# -----------------------------
# User Input
# -----------------------------

user_input = st.chat_input(
    "Ask about a stock, company, or market..."
)


if user_input:

    # Add user's message to local history
    st.session_state["message_history"].append({
        "role": "user",
        "content": user_input
    })

    with st.chat_message("user"):
        st.write(user_input)


    # -----------------------------
    # LangGraph Configuration
    # -----------------------------

    CONFIG = {
        "configurable": {
            "thread_id": st.session_state["thread_id"]
        },
        "metadata": {
            "thread_id": st.session_state["thread_id"]
        },
        "run_name": "stock_research_chat",
    }


    # -----------------------------
    # Run Agent + Stream Response
    # -----------------------------

    with st.chat_message("assistant"):

        ai_message = st.write_stream(
            message_chunk.content
            for message_chunk, metadata in chatbot.stream(
                {"messages": [HumanMessage(content=user_input)]},
                config=CONFIG,
                stream_mode="messages"
            )
            if metadata.get("langgraph_node") == "chatbot"
            and message_chunk.content
        )


    # Save assistant response
    st.session_state["message_history"].append({
        "role": "assistant",
        "content": ai_message
    })