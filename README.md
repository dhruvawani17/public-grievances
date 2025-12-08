# 🏛️ LocalGrievance — Citizen → Ticket → Resolution

A comprehensive AI-powered municipal grievance management system that converts citizen complaints (text, audio, images) into structured tickets routed to appropriate departments.

## 🏗️ Architecture Overview

```
Frontend (JavaScript)          Backend (Python/FastAPI)         AI Pipeline
┌─────────────────┐          ┌─────────────────┐           ┌──────────────┐
│  index.html     │◄────────►│  app.py         │◄────────►│  ai.py       │
│  app.js         │ HTTP     │  (FastAPI)      │ Process  │  (OCR/ASR)   │
│  style.css      │ POST     │  router.py      │ Logic    │  (Oumi RL)   │
└─────────────────┘          └─────────────────┘           └──────────────┘
   Port: 3000                   Port: 8000                 
   Live Server              CORS Enabled
```

## 📁 Project Structure

```
grievance-agent/
├── app.js                    # Frontend logic (send complaints)
├── index.html                # UI form (text, file upload)
├── style.css                 # Styling
├── server/
│   ├── app.py                # FastAPI server (main)
│   ├── router.py             # Complaint routing logic
│   ├── ai.py                 # AI pipeline (OCR, ASR, RL)
│   └── departments.json      # Department mapping
├── cline/
│   └── config.json           # Cline automation config
├── kestra/
│   └── flows/
│       └── ticket-summary.yaml  # Workflow orchestration
└── package.json              # NPM dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 14+** (for live-server)
- **pip** (Python package manager)

### Installation & Setup

#### 1️⃣ Install Python Dependencies

```bash
cd grievance-agent/server
pip install fastapi uvicorn python-multipart
```

#### 2️⃣ Install Frontend Dependencies

```bash
cd ..
npm install  # Installs live-server
```

#### 3️⃣ Start the Backend (FastAPI)

```bash
cd server
python app.py
```

Expected output:
```
Starting Grievance Agent Backend on http://localhost:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Backend is now running at:** `http://localhost:8000`

#### 4️⃣ Start the Frontend (Live Server)

In a new terminal:

```bash
npm run dev
```

Expected output:
```
Starting up http-server, serving ./

Hit CTRL-C to stop the server
http://localhost:3000
```

**Frontend is now running at:** `http://localhost:3000`

---

## 📡 API Endpoints

### Submit a Complaint

**Endpoint:** `POST /api/complaint`

**Parameters:**
- `text` (optional): Text description of complaint
- `file` (optional): Audio/Image file

**Request (cURL):**

```bash
curl -X POST "http://localhost:8000/api/complaint" \
  -F "text=There is garbage piled up near the bus stop at Ward 12"
```

**Response:**

```json
{
  "ticket_id": "a1b2c3d4",
  "category": "Garbage",
  "department": "Solid Waste Management Department",
  "urgency": "Medium",
  "location": "Ward 12",
  "description": "Garbage piled up near the bus stop",
  "status": "Sent to Department"
}
```

### Health Check

**Endpoint:** `GET /health`

```bash
curl http://localhost:8000/health
```

---

## 🔄 Data Flow

1. **User submits complaint** (text/audio/image) via `index.html`
2. **Frontend sends** POST request to `/api/complaint`
3. **Backend (app.py)** receives and validates input
4. **Router (router.py)** forwards to AI pipeline
5. **AI Pipeline (ai.py)**:
   - Extracts text from images (OCR)
   - Converts audio to text (ASR)
   - Runs Oumi RL model for structured extraction
6. **Router classifies** complaint into department
7. **Ticket is generated** with ID, category, urgency, location
8. **Response sent** back to frontend for display

---

## 🎯 Supported Complaint Categories

| Category | Department | Urgency |
|----------|-----------|---------|
| Garbage | Solid Waste Management | Medium |
| Pothole | Roads & Infrastructure | High |
| Sewage Leak | Sewage & Drainage | High |
| Street Light | Electrical & Street Lighting | Medium |
| Animal | Animal Control | Low |
| Tree Fall | Parks & Horticulture | Medium |

See `server/departments.json` for complete mapping.

---

## 🧠 AI Pipeline

### Current Implementation

The AI pipeline is modularized into:

1. **OCR** (Placeholder) — Extract text from images
   - Future: Replace with EasyOCR, PaddleOCR, Tesseract

2. **ASR** (Placeholder) — Convert audio to text
   - Future: Replace with Whisper, Vosk, SpeechBrain

3. **Oumi RL Model** (Simulated) — Structured extraction
   - Current: Rule-based extractor with keyword matching
   - Future: Fine-tune Oumi RL with RLHF/DPO for complaint classification

4. **Confidence Scoring** — Validate extracted data
   - Current: 0.82 placeholder
   - Future: LLM-as-a-Judge validation

### Extending the AI Pipeline

**Edit `server/ai.py`:**

```python
def run_oumi_model(prompt):
    # Replace with actual Oumi inference API
    response = ollama.generate(
        model="oumi",
        prompt=f"Extract complaint details: {prompt}",
        format="json"
    )
    return json.loads(response)
```

---

## 🔧 Troubleshooting

### Backend won't start
```
ModuleNotFoundError: No module named 'fastapi'
```
**Fix:** Run `pip install fastapi uvicorn python-multipart`

### Frontend can't connect to backend
```
❌ Error connecting to the backend: TypeError: failed to fetch
```
**Fix:** Ensure backend is running on port 8000 and CORS is enabled

### CORS errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Check that `app.py` includes proper CORS middleware (already configured)

### Port already in use
```
Address already in use: ('127.0.0.1', 8000)
```
**Fix:** Kill existing process or change port in `app.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

## 📊 Logging & Debugging

All requests are logged in the terminal. Example:

```
INFO:     Received complaint: text=True, file=None
INFO:     Generated ticket: a1b2c3d4
```

To enable verbose logging, edit `server/app.py`:
```python
logging.basicConfig(level=logging.DEBUG)
```

---

## 🛠️ Development

### Running Tests

```bash
pytest server/
```

### Code Quality

```bash
black server/
flake8 server/
pylint server/
```

### Adding a New Department

1. Edit `server/departments.json`
2. Add new category keywords
3. Router will automatically route complaints

---

## 🚢 Deployment

### Deploy Backend (Heroku)

```bash
heroku create grievance-agent
git push heroku main
```

### Deploy Frontend (Vercel)

```bash
vercel --prod
```

See `cline/config.json` for automated PR reviews.

---

## 📚 Additional Resources

- **FastAPI Docs:** http://localhost:8000/docs
- **Swagger UI:** http://localhost:8000/redoc
- **Kestra Workflows:** `kestra/flows/ticket-summary.yaml`

---

## 📞 Support

For issues or questions:
1. Check logs in terminal
2. Verify both servers are running (ports 3000 & 8000)
3. Check browser console (F12) for frontend errors

---

## 📜 License

ISC

---

**Last Updated:** December 2025
