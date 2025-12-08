# ⚡ Quick Reference

## 🚀 5-Minute Setup

```bash
# Terminal 1: Backend
cd grievance-agent\server
pip install -r requirements.txt
python app.py

# Terminal 2: Frontend
cd grievance-agent
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📡 API Quick Reference

### POST /api/complaint
```bash
curl -X POST "http://localhost:8000/api/complaint" \
  -F "text=Pothole on Main Street"
```

**Response:**
```json
{
  "ticket_id": "a1b2c3d4",
  "category": "Pothole",
  "department": "Roads & Infrastructure Department",
  "urgency": "High",
  "location": "Not specified",
  "description": "Pothole on Main Street",
  "status": "Sent to Department"
}
```

### GET /health
```bash
curl http://localhost:8000/health
```

---

## 🗂️ File Map

| File | Purpose | Edit When |
|------|---------|-----------|
| `index.html` | UI Form | Change form fields or styling |
| `app.js` | Frontend Logic | Modify submission/display logic |
| `app.py` | Backend Server | Add endpoints, change settings |
| `router.py` | Complaint Processing | Change routing logic |
| `ai.py` | AI Pipeline | Integrate real OCR/ASR/LLM |
| `departments.json` | Category Mapping | Add new departments |

---

## 🔧 Common Tasks

### Add New Department
1. Edit `departments.json`
2. Add keyword → department mapping
3. No code changes needed

### Change Backend Port
In `app.py`, line ~80:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Change 8000 to 8001
```

### Change Frontend Port
In `package.json`:
```json
"dev": "live-server --port=3001 --open=index.html"
```

### Add Custom AI Model
In `ai.py`, function `run_oumi_model()`:
```python
def run_oumi_model(prompt):
    # Replace with your model API call
    response = my_model.predict(prompt)
    return response
```

---

## 🐛 Debugging Tips

### Check Backend Logs
```
INFO:     Received complaint: text=True, file=None
INFO:     Generated ticket: a1b2c3d4
```

### Check Frontend Console
Press `F12` in browser → Console tab

### Test API Endpoints
Use Swagger UI: http://localhost:8000/docs

### Monitor Network Requests
1. Press `F12` in browser
2. Go to "Network" tab
3. Submit complaint
4. Check request/response

---

## 📦 Dependencies

### Backend (Python)
- `fastapi` — Web framework
- `uvicorn` — ASGI server
- `python-multipart` — Form handling

### Frontend (JavaScript)
- `live-server` — Development server

### AI Optional (Future)
- `easyocr` — Image text extraction
- `openai-whisper` — Audio transcription
- `ollama` — Local LLM inference

---

## 🎯 Data Flow at a Glance

```
User Input (HTML Form)
    ↓ (JavaScript)
fetch POST /api/complaint
    ↓ (HTTP, CORS)
FastAPI app.py
    ↓ (Import)
router.py process_complaint()
    ↓ (await)
ai.py extract_structured_data()
    ↓ (Process)
Structured Ticket
    ↓ (JSON)
Response to Frontend
    ↓ (JavaScript)
Display in UI
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend won't load | Check npm is installed, run `npm install` |
| Can't submit complaint | Backend must be running on port 8000 |
| CORS error | Both services must be running |
| ModuleNotFoundError | Run `pip install -r requirements.txt` |
| Port in use | Find process: `lsof -i :8000`, kill it, restart |

---

## 🔗 Key Connections

```
Frontend (app.js)
    ↔ HTTP POST
Backend (app.py)
    ↔ Import
Router (router.py)
    ↔ Import
AI (ai.py)
    ↔ Load JSON
Departments (departments.json)
```

---

## 📝 Code Examples

### Send complaint from JavaScript
```javascript
const formData = new FormData();
formData.append("text", "Garbage at bus stop");
const response = await fetch("http://localhost:8000/api/complaint", {
    method: "POST",
    body: formData
});
const ticket = await response.json();
console.log(ticket);
```

### Get complaint category in Python
```python
from ai import extract_structured_data

result = extract_structured_data(text="Pothole on road")
print(result["category"])  # "Pothole"
print(result["urgency"])   # "High"
```

### Add route endpoint
```python
@app.post("/api/custom")
async def custom_endpoint(data: str = Form(...)):
    return {"received": data}
```

---

## 🚢 Deployment Checklist

- [ ] Backend runs without errors
- [ ] Frontend connects to backend
- [ ] All complaints process correctly
- [ ] Tickets routed to correct departments
- [ ] Logging works
- [ ] Error handling works
- [ ] CORS is configured
- [ ] Requirements.txt up to date
- [ ] No hardcoded localhost URLs
- [ ] Environment variables set

---

## 📚 Resources

- FastAPI: https://fastapi.tiangolo.com
- Live Server: https://github.com/tapio/live-server
- Pydantic: https://docs.pydantic.dev
- Uvicorn: https://www.uvicorn.org

---

**Last Updated:** December 2025
**Hackathon:** LocalGrievance Agent v1.0
