from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import json
import uvicorn
import logging
import os
from router import process_complaint  # handles AI + routing logic

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Local Grievance Resolution Backend")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["localhost", "127.0.0.1", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured ticket model (response)
class Ticket(BaseModel):
    ticket_id: str
    category: str
    department: str
    urgency: str
    location: str
    description: str
    status: str


@app.post("/api/complaint")
async def complaint_endpoint(
    text: str = Form(None),
    file: UploadFile = None
):
    """
    Handles:
    - WhatsApp text
    - Audio files
    - Images

    Converts them into structured municipal tickets.
    """
    logger.info(f"Received complaint: text={bool(text)}, file={file.filename if file else None}")
    
    if not text and not file:
        logger.warning("Empty complaint received")
        raise HTTPException(status_code=400, detail="Please provide text or file")

    try:
        ticket = await process_complaint(text=text, file=file)
        logger.info(f"Generated ticket: {ticket['ticket_id']}")
        return Ticket(**ticket)
    except Exception as e:
        logger.error(f"Error processing complaint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing complaint: {str(e)}")


@app.get("/")
def root():
    return {
        "status": "backend running",
        "endpoints": {
            "submit_complaint": "POST /api/complaint",
            "health": "GET /"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "grievance-agent"}


if __name__ == "__main__":
    logger.info("Starting Grievance Agent Backend on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
