# 1. Bring in dependencies 
from typing import Annotated 
from langgraph.graph import START, END, StateGraph
from langgraph.graph.message import add_messages 
from langgraph.checkpoint.memory import InMemorySaver 
from langchain_ollama import ChatOllama
from colorama import Fore 
from langgraph.prebuilt import ToolNode 
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3
from dotenv import load_dotenv
load_dotenv()
from tool import (
    simple_screener,
    get_stock_price,
    get_company_profile,
    get_financial_summary,
    get_stock_history,
)

# 2. Create LLM
llm = ChatOllama(model='qwen2.5:14b')

# 8. Create tool
tools = [
    simple_screener,
    get_stock_price,
    get_company_profile,
    get_financial_summary,
    get_stock_history,
]
# 9. Bind LLM with tools
llm_with_tools = llm.bind_tools(tools)
# 10. Create Tool Node 
tool_node = ToolNode(tools)

# 3. Create state
class State(dict): 
    messages: Annotated[list, add_messages]
# 4. Build LLM node 
def chatbot(state:State): 
    print(state['messages'])
    return {"messages":[llm_with_tools.invoke(state['messages'])]}
# 11. Create Router Node
def router(state:State): 
    last_message = state['messages'][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls: 
        return "tools" 
    else: 
        return END 

# 5. Assemble Graph 
graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", tool_node)
graph_builder.add_edge(START, "chatbot")
# 12. Update graph for Tools
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_conditional_edges("chatbot", router)
# 6. Add Memory and Compile Graph 
conn=sqlite3.connect(database='chatbot.db', check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)
chatbot = graph_builder.compile(checkpointer=checkpointer)
def retrieve_all_threads():
    all_threads=set()

    for checkpoint in checkpointer.list(None):
        all_threads.add(checkpoint.config['configurable']['thread_id'])
    return (list(all_threads))
