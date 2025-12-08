# 🎯 LocalGrievance — COMPLETE CONNECTION SUMMARY

## ✅ All Components Connected

### Frontend ↔ Backend
- **Frontend:** `http://localhost:3000` (LiveServer)
- **Backend:** `http://localhost:8000` (FastAPI)
- **Connection:** HTTP POST to `/api/complaint`
- **CORS:** ✅ Enabled for cross-origin requests
- **Data Format:** FormData (text + file)

### Backend → Router → AI Pipeline
- **app.py** imports `process_complaint` from **router.py**
- **router.py** imports `extract_structured_data` from **ai.py**
- **router.py** loads `departments.json` for routing
- **ai.py** processes text/audio/images through AI pipeline

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│              (index.html + app.js + style.css)              │
│                   Port: 3000                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP POST
                   (FormData)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI SERVER                             │
│                      app.py                                  │
│                   Port: 8000                                 │
│  Endpoint: POST /api/complaint                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Import → Call
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 COMPLAINT ROUTER                             │
│                    router.py                                 │
│     • Receives text/file from app.py                        │
│     • Forwards to AI pipeline                               │
│     • Routes category to department                         │
│     • Generates ticket ID                                   │
│     • Loads departments.json                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Import → Call
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI PIPELINE                                │
│                      ai.py                                   │
│     • OCR: extract_text_from_image()                        │
│     • ASR: speech_to_text()                                 │
│     • NLP: run_oumi_model()                                 │
│     • Returns: structured JSON                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Return JSON
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DEPARTMENT MAPPING                          │
│               departments.json (JSON)                        │
│  • garbage → Solid Waste Management                         │
│  • pothole → Roads & Infrastructure                         │
│  • sewage → Sewage & Drainage                               │
│  • etc...                                                    │
└─────────────────────────────────────────────────────────────┘
                         │
                    Return Routed
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  TICKET GENERATED                            │
│  {                                                           │
│    "ticket_id": "a1b2c3d4",                                 │
│    "category": "Pothole",                                   │
│    "department": "Roads & Infrastructure Department",        │
│    "urgency": "High",                                        │
│    "location": "Main Street",                               │
│    "description": "Pothole on Main Street",                │
│    "status": "Sent to Department"                           │
│  }                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP Response
                    (JSON)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND DISPLAY                            │
│            app.js displayTicket()                            │
│             Shows structured ticket                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Connection Points Checklist

### ✅ Frontend Files
- [x] **index.html** — Form inputs (text, file)
- [x] **app.js** — Sends POST to `http://localhost:8000/api/complaint`
- [x] **style.css** — Visual styling (no connection needed)

### ✅ Backend Files
- [x] **app.py** — FastAPI server, imports router, handles HTTP
- [x] **router.py** — Processes complaints, imports ai.py, loads departments.json
- [x] **ai.py** — AI pipeline (OCR, ASR, NLP)
- [x] **departments.json** — Category to department mapping

### ✅ Configuration Files
- [x] **package.json** — npm scripts (dev, start)
- [x] **requirements.txt** — Python dependencies
- [x] **START.bat** — Windows startup script
- [x] **start.sh** — Linux/macOS startup script

### ✅ Documentation
- [x] **README.md** — Complete setup and usage guide
- [x] **INTEGRATION_GUIDE.md** — Detailed connection explanations
- [x] **QUICK_REFERENCE.md** — Quick lookup reference
- [x] **CONNECTION_SUMMARY.md** — This file

---

## 🚀 How to Start Everything

### Option 1: Automated (Windows)
```batch
START.bat
```
- Installs dependencies automatically
- Opens backend and frontend in separate windows
- Shows startup confirmation

### Option 2: Automated (macOS/Linux)
```bash
chmod +x start.sh
./start.sh
```
- Installs dependencies automatically
- Starts backend and frontend
- Shows startup confirmation

### Option 3: Manual (All Platforms)

**Terminal 1 — Backend:**
```bash
cd grievance-agent/server
pip install -r requirements.txt
python app.py
```

**Terminal 2 — Frontend:**
```bash
cd grievance-agent
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📡 API Endpoints Reference

### POST /api/complaint
**Purpose:** Submit a grievance complaint

**Input:**
```
text (optional): String
file (optional): Image/Audio file
```

**Output:**
```json
{
  "ticket_id": "a1b2c3d4",
  "category": "Garbage",
  "department": "Solid Waste Management Department",
  "urgency": "Medium",
  "location": "Ward 12",
  "description": "Garbage dumped near bus stop",
  "status": "Sent to Department"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/complaint" \
  -F "text=Garbage pile at bus stop"
```

### GET /health
**Purpose:** Check backend health status

**Output:**
```json
{
  "status": "ok",
  "service": "grievance-agent"
}
```

### GET /
**Purpose:** Get API information

**Output:**
```json
{
  "status": "backend running",
  "endpoints": {
    "submit_complaint": "POST /api/complaint",
    "health": "GET /"
  }
}
```

---

## 🔄 Request/Response Flow

### Step 1: User Submits Complaint
```
User fills form in index.html:
- Text: "Garbage piled up at Ward 12"
- File: (optional) image.jpg
- Clicks "Submit Complaint"
```

### Step 2: Frontend Sends Request
```javascript
// app.js - sendComplaint() function
const response = await fetch("http://localhost:8000/api/complaint", {
    method: "POST",
    body: formData
});
```

**HTTP Request:**
```
POST /api/complaint HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data

text=Garbage piled up at Ward 12
```

### Step 3: Backend Receives & Validates
```python
# app.py - complaint_endpoint() function
async def complaint_endpoint(text: str = Form(None), file: UploadFile = None):
    # Validates input
    # Logs request
    # Calls router.process_complaint()
```

### Step 4: Router Processes
```python
# router.py - process_complaint() function
async def process_complaint(text: str = None, file: UploadFile = None):
    # Extracts file bytes if present
    # Calls ai.extract_structured_data()
    # Routes to department via route_department()
    # Generates ticket_id
    # Returns structured ticket
```

### Step 5: AI Pipeline Processes
```python
# ai.py - extract_structured_data() function
def extract_structured_data(text=None, file_bytes=None, file_type=None):
    # If image: OCR
    # If audio: ASR
    # Run Oumi model for extraction
    # Return structured JSON
```

### Step 6: Department Routing
```python
# router.py - route_department() function
def route_department(category):
    # Looks up category in departments.json
    # Returns matching department
    # Example: "garbage" → "Solid Waste Management Department"
```

### Step 7: Ticket Generation
```python
# router.py - final return
return {
    "ticket_id": "a1b2c3d4",
    "category": "Garbage",
    "department": "Solid Waste Management Department",
    "urgency": "Medium",
    "location": "Ward 12",
    "description": "Garbage piled up at Ward 12",
    "status": "Sent to Department"
}
```

### Step 8: Backend Sends Response
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ticket_id": "a1b2c3d4",
  "category": "Garbage",
  "department": "Solid Waste Management Department",
  "urgency": "Medium",
  "location": "Ward 12",
  "description": "Garbage piled up at Ward 12",
  "status": "Sent to Department"
}
```

### Step 9: Frontend Displays Result
```javascript
// app.js - displayTicket() function
function displayTicket(ticket) {
    outputBox.innerHTML = `
        <div class="card">
            <h2>📄 Structured Ticket</h2>
            <p><b>Category:</b> ${ticket.category}</p>
            <p><b>Department:</b> ${ticket.department}</p>
            <p><b>Urgency:</b> ${ticket.urgency}</p>
            <p><b>Location:</b> ${ticket.location}</p>
            <p><b>Description:</b> ${ticket.description}</p>
            <p><b>Status:</b> ${ticket.status}</p>
            <p><b>Ticket ID:</b> ${ticket.ticket_id}</p>
        </div>
    `;
}
```

### Step 10: User Sees Result
```
┌─────────────────────────────────────────┐
│       📄 Structured Ticket              │
│                                          │
│  Category: Garbage                      │
│  Department: Solid Waste Management...  │
│  Urgency: Medium                        │
│  Location: Ward 12                      │
│  Description: Garbage piled up at...    │
│  Status: Sent to Department             │
│  Ticket ID: a1b2c3d4                    │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Each Connection

### 1. Test Frontend Loads
```
Open: http://localhost:3000
Expect: Form with text input, file input, submit button
```

### 2. Test Backend is Running
```bash
curl http://localhost:8000/health
Expect: {"status": "ok", "service": "grievance-agent"}
```

### 3. Test API Endpoint
```bash
curl -X POST "http://localhost:8000/api/complaint" \
  -F "text=Test complaint"
Expect: Structured ticket JSON response
```

### 4. Test Frontend → Backend Connection
```
1. Navigate to http://localhost:3000
2. Enter text: "Pothole on Main Street"
3. Click "Submit Complaint"
4. Expect: Ticket displayed on page
```

### 5. Test Full System
```
1. Submit text complaint
2. Submit image complaint
3. Check backend logs for processing
4. Verify category/department routing
5. Confirm ticket IDs are unique
```

---

## 🐛 Debugging Commands

### Check if ports are in use
```bash
# Windows PowerShell
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :8000
lsof -i :3000
```

### Kill process on port
```bash
# Windows
taskkill /PID <PID> /F

# Linux/macOS
kill -9 <PID>
```

### View backend logs
```
Check terminal running app.py
Look for INFO/ERROR messages
```

### View frontend errors
```
1. Open http://localhost:3000
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Submit complaint and check for errors
```

### Test API manually
```
Visit: http://localhost:8000/docs
Click on POST /api/complaint
Click "Try it out"
Enter text/file
Click "Execute"
View response
```

---

## 📊 System Status

All connections are now complete and verified:

| Component | Status | Port | Purpose |
|-----------|--------|------|---------|
| Frontend | ✅ Active | 3000 | User interface |
| Backend | ✅ Active | 8000 | API server |
| Router | ✅ Connected | - | Complaint routing |
| AI Pipeline | ✅ Connected | - | Text processing |
| Departments | ✅ Loaded | - | Category mapping |
| CORS | ✅ Enabled | - | Cross-origin requests |
| Logging | ✅ Enabled | - | Debugging |
| Error Handling | ✅ Active | - | Exception handling |

---

## 📚 Documentation Index

1. **README.md** — Setup, architecture, API endpoints, troubleshooting
2. **INTEGRATION_GUIDE.md** — Detailed connection explanations and data flow
3. **QUICK_REFERENCE.md** — Quick lookup, commands, common tasks
4. **CONNECTION_SUMMARY.md** — This file, complete overview

---

## 🎓 Learning Path

1. **Understand Structure** → Read README.md
2. **Learn Connections** → Read INTEGRATION_GUIDE.md
3. **Quick Lookup** → Check QUICK_REFERENCE.md
4. **Hands-On Setup** → Follow START.bat or start.sh
5. **Test Everything** → Use testing section above
6. **Extend System** → Modify files based on INTEGRATION_GUIDE.md

---

## 🚀 Next Steps to Extend

1. **Add Real AI Models**
   - Integrate EasyOCR for images
   - Integrate Whisper for audio
   - Fine-tune LLM for classification

2. **Add Database**
   - PostgreSQL/MongoDB for tickets
   - Track status updates
   - Generate reports

3. **Add Authentication**
   - JWT tokens
   - User login
   - Role-based access

4. **Add Integrations**
   - WhatsApp API for direct submission
   - Email notifications
   - SMS updates

5. **Deploy**
   - Docker containerization
   - AWS/Heroku deployment
   - CI/CD pipeline

---

**System Status:** ✅ FULLY CONNECTED  
**Last Updated:** December 2025  
**Version:** 1.0.0  
**Hackathon:** LocalGrievance Agent
