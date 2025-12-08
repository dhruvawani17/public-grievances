import uuid
import json
import os
from ai import extract_structured_data
from fastapi import UploadFile


# ------------------------------
# LOAD DEPARTMENT MAPPING
# ------------------------------
DEPT_FILE = os.path.join(os.path.dirname(__file__), "departments.json")
with open(DEPT_FILE, "r") as f:
    department_map = json.load(f)


# ------------------------------
# ROUTE TO DEPARTMENT BASED ON CATEGORY
# ------------------------------
def route_department(category):
    for key, dept in department_map.items():
        if key.lower() in category.lower():
            return dept
    return "General Administration"


# ------------------------------
# PROCESS COMPLAINT (TEXT + AUDIO + IMAGE)
# ------------------------------
async def process_complaint(text: str = None, file: UploadFile = None):

    # --------------------------
    # 1. Extract content
    # --------------------------
    file_bytes = None
    file_type = None

    if file:
        file_bytes = await file.read()
        file_type = file.content_type  # image/jpeg, audio/mpeg etc

    # --------------------------
    # 2. AI Converts to structured ticket (via Oumi RL model)
    # --------------------------
    ai_output = extract_structured_data(
        text=text,
        file_bytes=file_bytes,
        file_type=file_type
    )

    # ai_output example:
    # {
    #   "category": "Garbage",
    #   "urgency": "Medium",
    #   "location": "Ward 12, XYZ Road",
    #   "description": "Garbage dumped near the bus stop"
    # }

    category = ai_output.get("category", "Other")
    urgency = ai_output.get("urgency", "Low")
    location = ai_output.get("location", "Not specified")
    description = ai_output.get("description", text or "N/A")

    # --------------------------
    # 3. Route to department
    # --------------------------
    department = route_department(category)

    # --------------------------
    # 4. Generate Ticket ID
    # --------------------------
    ticket_id = str(uuid.uuid4())[:8]

    # --------------------------
    # 5. Return final structured ticket
    # --------------------------
    return {
        "ticket_id": ticket_id,
        "category": category,
        "department": department,
        "urgency": urgency,
        "location": location,
        "description": description,
        "status": "Sent to Department"
    }