from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from rag import process_query, ingest_markdown_file

app = FastAPI(title="Digital Twin RAG Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/")
def read_root():
    return {"status": "Digital Twin Engine is online"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        # Call the asynchronous RAG processing function
        answer = await process_query(req.message)
        return ChatResponse(response=answer)
    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail="Internal Twin Error")

@app.post("/ingest")
async def ingest_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith('.md'):
        raise HTTPException(status_code=400, detail="Only Markdown (.md) files are supported for ingestion.")
    
    file_path = os.path.join("./data", file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Trigger ingestion to ChromaDB
        chunks_added = ingest_markdown_file(file_path)
        
        return {
            "status": "success", 
            "message": f"Successfully ingested {file.filename}",
            "chunks_added": chunks_added
        }
    except Exception as e:
        print(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to ingest file")
