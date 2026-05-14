import os
import glob
from dotenv import load_dotenv

# Load .env BEFORE any other imports that need the API key
load_dotenv()

from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_text_splitters import MarkdownTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Configuration
CHROMA_DB_DIR = "./chroma_db"
DATA_DIR = "./data"

# Initialize Local Embeddings (Runs on local hardware)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize persistent local Vector DB
vector_store = Chroma(
    collection_name="digital_twin_memory",
    embedding_function=embeddings,
    persist_directory=CHROMA_DB_DIR
)

# Initialize LLM (Requires GEMINI_API_KEY in environment)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, google_api_key=GOOGLE_API_KEY)

# Define the Prompt
template = """You are the digital twin of Shanmugha Priyan S.
You must speak from his perspective, referring to his projects, hardware, and routines as your own.
Use the following pieces of retrieved personal memory to answer the question.
If the answer is not in the memories, state that you don't have that specific memory, but try to answer based on your persona.
Keep the answer concise, conversational, and lowercase (to mimic the UI's style).

Memory Context:
{context}

Question:
{question}

Answer:"""
prompt = PromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Create the RAG Chain
retriever = vector_store.as_retriever(search_kwargs={"k": 3})
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def ingest_markdown_file(filepath: str):
    """Reads a Markdown file, chunks it, and adds to ChromaDB."""
    print(f"Ingesting {filepath}...")
    try:
        # Use simple text reading if Unstructured is not installed, or use standard Langchain text loader
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
            
        splitter = MarkdownTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.create_documents([text])
        
        # Add source metadata
        for chunk in chunks:
            chunk.metadata = {"source": os.path.basename(filepath)}
            
        vector_store.add_documents(chunks)
        print(f"Successfully ingested {len(chunks)} chunks from {filepath}.")
        return len(chunks)
    except Exception as e:
        print(f"Error ingesting {filepath}: {e}")
        return 0

def initialize_seed_data():
    """Ingests all .md files in the data directory if the DB is empty."""
    # Check if DB has documents
    if vector_store._collection.count() == 0:
        print("Vector DB empty. Initializing seed data...")
        md_files = glob.glob(os.path.join(DATA_DIR, "*.md"))
        for file in md_files:
            ingest_markdown_file(file)

# Call on module load
initialize_seed_data()

async def process_query(query: str) -> str:
    """Processes a query through the RAG chain asynchronously."""
    response = await rag_chain.ainvoke(query)
    # Ensure lowercase formatting as per design spec
    return response.lower()
