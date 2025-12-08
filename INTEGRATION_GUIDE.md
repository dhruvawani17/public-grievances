# 🔗 LocalGrievance Integration Guide

## Complete System Connections Map

This document shows how all components are connected and communicate.

---

## 1️⃣ Frontend → Backend Connection

### Files Involved
- **Frontend:** `grievance-agent/app.js`
- **Backend:** `grievance-agent/server/app.py`

### Connection Flow

```javascript
// app.js - Line 22-30
const response = await fetch("http://localhost:8000/api/complaint", {
    method: "POST",
    body: formData
});
```

**Endpoint Definition:**
```python
# app.py - Line 42-66
@app.post("/api/complaint")
async def complaint_endpoint(
    text: str = Form(None),
    file: UploadFile = None
):
    # Receives text and/or file from frontend
    # Returns structured ticket
    return Ticket(**ticket)
```

### Data Flow
```
User Input (HTML)
    ↓
app.js sendComplaint()
    ↓
fetch POST to http://localhost:8000/api/complaint
    ↓
app.py complaint_endpoint()
    ↓
router.process_complaint()
    ↓
ai.py extract_structured_data()
    ↓
JSON Response
    ↓
app.js displayTicket()
    ↓
UI Display
```

---

## 2️⃣ Backend → Router → AI Pipeline

### Files Involved
- **Backend:** `grievance-agent/server/app.py`
- **Router:** `grievance-agent/server/router.py`
- **AI:** `grievance-agent/server/ai.py`

### Connection Flow

```python
# app.py (line 47)
from router import process_complaint

# Inside complaint_endpoint (line 58)
ticket = await process_complaint(text=text, file=file)
```

### Router Processing

```python
# router.py - process_complaint function
async def process_complaint(text: str = None, file: UploadFile = None):
    
    # Step 1: Extract file bytes if provided
    if file:
        file_bytes = await file.read()
        file_type = file.content_type
    
    # Step 2: Send to AI Pipeline
    ai_output = extract_structured_data(
        text=text,
        file_bytes=file_bytes,
        file_type=file_type
    )
    
    # Step 3: Route to Department
    department = route_department(category)
    
    # Step 4: Generate Ticket
    ticket_id = str(uuid.uuid4())[:8]
    
    # Step 5: Return structured ticket
    return { ... }
```

### AI Pipeline Processing

```python
# ai.py - extract_structured_data function
def extract_structured_data(text=None, file_bytes=None, file_type=None):
    
    # Step 1: Extract text from input
    if text:
        final_text = text.strip()
    elif file_bytes and file_type:
        if "image" in file_type:
            final_text = extract_text_from_image(file_bytes)  # OCR
        elif "audio" in file_type:
            final_text = speech_to_text(file_bytes)  # ASR
    
    # Step 2: Run Oumi RL Model
    structured = run_oumi_model(final_text)
    
    # Step 3: Return structured output
    return {
        "category": structured["category"],
        "urgency": structured["urgency"],
        "location": structured["location"],
        "description": structured["description"],
        "confidence": structured["confidence"],
        "raw_text": final_text,
        "trace": "processed_by_ai_pipeline_v2"
    }
```

---

## 3️⃣ Department Routing

### Files Involved
- **Config:** `grievance-agent/server/departments.json`
- **Router:** `grievance-agent/server/router.py`

### Connection Flow

```python
# router.py - Line 18-23
DEPT_FILE = os.path.join(os.path.dirname(__file__), "departments.json")
with open(DEPT_FILE, "r") as f:
    department_map = json.load(f)

def route_department(category):
    for key, dept in department_map.items():
        if key.lower() in category.lower():
            return dept
    return "General Administration"
```

### Department Mapping

```json
// departments.json
{
  "garbage": "Solid Waste Management Department",
  "trash": "Solid Waste Management Department",
  "pothole": "Roads & Infrastructure Department",
  "sewage": "Sewage & Drainage Department",
  "streetlight": "Electrical & Street Lighting Department",
  // ... more mappings
}
```

### Example Routing

```
Input Category: "Garbage dumped at roadside"
    ↓
Router checks: "garbage" in "garbage dumped at roadside"
    ↓
Found: "garbage" → "Solid Waste Management Department"
    ↓
Ticket routed to Solid Waste Management Department
```

---

## 4️⃣ HTTP Endpoints

### Base URL
```
http://localhost:8000
```

### Available Endpoints

#### Submit Complaint
```
POST /api/complaint

Form Data:
  - text (string, optional): Complaint text
  - file (file, optional): Image or audio file

Response:
{
  "ticket_id": "a1b2c3d4",
  "category": "Garbage",
  "department": "Solid Waste Management Department",
  "urgency": "Medium",
  "location": "Ward 12, XYZ Road",
  "description": "Garbage dumped near the bus stop",
  "status": "Sent to Department"
}
```

#### Health Check
```
GET /health

Response:
{
  "status": "ok",
  "service": "grievance-agent"
}
```

#### Root Endpoint
```
GET /

Response:
{
  "status": "backend running",
  "endpoints": {
    "submit_complaint": "POST /api/complaint",
    "health": "GET /"
  }
}
```

#### API Documentation
```
GET /docs          (Swagger UI)
GET /redoc         (ReDoc)
GET /openapi.json  (OpenAPI Schema)
```

---

## 5️⃣ CORS Configuration

### Purpose
Allows frontend (port 3000) to communicate with backend (port 8000)

### Implementation

```python
# app.py - Lines 19-25
app.add_middleware(
    CORSMiddleware,
    allow_origins=["localhost", "127.0.0.1", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### What This Enables
- ✅ Cross-origin requests
- ✅ Credentials (cookies, auth tokens)
- ✅ All HTTP methods (GET, POST, etc.)
- ✅ All headers

---

## 6️⃣ Logging & Debugging

### Logger Setup

```python
# app.py - Lines 11-12
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### Logged Events

```python
# Line 59
logger.info(f"Received complaint: text={bool(text)}, file={file.filename if file else None}")

# Line 70
logger.info(f"Generated ticket: {ticket['ticket_id']}")

# Line 72
logger.error(f"Error processing complaint: {str(e)}")
```

### Output Example

```
INFO:     Received complaint: text=True, file=None
INFO:     Generated ticket: a1b2c3d4
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 7️⃣ Error Handling

### Frontend Error Handling

```javascript
// app.js - Lines 37-40
catch (err) {
    outputBox.innerHTML = `<p style="color:red;">
        ❌ Error connecting to the backend: ${err}
    </p>`;
}
```

### Backend Error Handling

```python
# app.py - Lines 62-72
if not text and not file:
    raise HTTPException(status_code=400, detail="Please provide text or file")

try:
    ticket = await process_complaint(text=text, file=file)
    return Ticket(**ticket)
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error processing complaint: {str(e)}")
```

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `❌ Error connecting to the backend` | Backend not running | Start backend: `python app.py` |
| `CORS error` | Frontend/Backend ports mismatch | Check ports (3000/8000) |
| `ModuleNotFoundError: fastapi` | Dependencies not installed | `pip install -r requirements.txt` |
| `Address already in use` | Port 8000 is taken | Kill process or change port |

---

## 8️⃣ Data Models

### Pydantic Model (Backend)

```python
# app.py - Lines 27-36
class Ticket(BaseModel):
    ticket_id: str
    category: str
    department: str
    urgency: str
    location: str
    description: str
    status: str
```

### Form Data (Frontend)

```javascript
// app.js - Lines 23-31
const formData = new FormData();

if (textInput.value.trim() !== "") {
    formData.append("text", textInput.value.trim());
}

if (fileInput.files.length > 0) {
    formData.append("file", fileInput.files[0]);
}
```

### AI Output

```python
# ai.py - Line 64
return {
    "category": structured["category"],
    "urgency": structured["urgency"],
    "location": structured["location"],
    "description": structured["description"],
    "confidence": structured["confidence"],
    "raw_text": final_text,
    "trace": "processed_by_ai_pipeline_v2"
}
```

---

## 9️⃣ Running the System

### Start Backend

```bash
cd grievance-agent/server
python app.py
```

**Expected Output:**
```
Starting Grievance Agent Backend on http://localhost:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Start Frontend

```bash
cd grievance-agent
npm run dev
```

**Expected Output:**
```
Serving at http://localhost:3000
```

### One-Command Start (Windows)

```batch
START.bat
```

### One-Command Start (macOS/Linux)

```bash
./start.sh
```

---

## 🔟 Testing the Connection

### Using cURL

```bash
# Submit text complaint
curl -X POST "http://localhost:8000/api/complaint" \
  -F "text=There is garbage piled up near the bus stop"

# Submit image complaint
curl -X POST "http://localhost:8000/api/complaint" \
  -F "file=@/path/to/image.jpg"

# Check health
curl http://localhost:8000/health
```

### Using Browser

1. Navigate to `http://localhost:3000`
2. Enter complaint text or upload file
3. Click "Submit Complaint"
4. View structured ticket in output box

### Using Swagger UI

1. Navigate to `http://localhost:8000/docs`
2. Click "Try it out" on `/api/complaint`
3. Enter form data
4. Click "Execute"
5. View response

---

## 🔗 Connection Checklist

- [x] Frontend serves on port 3000
- [x] Backend serves on port 8000
- [x] CORS enabled for cross-origin requests
- [x] Complaint endpoint accepts text and/or file
- [x] AI pipeline processes inputs correctly
- [x] Router maps categories to departments
- [x] Ticket structure matches frontend expectations
- [x] Error handling in place on both sides
- [x] Logging enabled for debugging
- [x] All dependencies installed

---

## 📚 Next Steps

1. **Extend AI Pipeline**
   - Integrate real OCR (EasyOCR, PaddleOCR)
   - Integrate real ASR (Whisper, Vosk)
   - Fine-tune Oumi RL model

2. **Add Database**
   - Store tickets in PostgreSQL/MongoDB
   - Track ticket status updates
   - Generate analytics

3. **Add Authentication**
   - JWT tokens for users
   - Department-specific login

4. **Deploy**
   - Deploy backend to Heroku/AWS
   - Deploy frontend to Vercel
   - Set up CI/CD pipeline

---

**Last Updated:** December 2025
