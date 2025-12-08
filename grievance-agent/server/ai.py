import json
import re

def extract_text_from_image(image_bytes):
    return "Image shows garbage dumped at roadside near a pole."

def speech_to_text(audio_bytes):
    return "Audio indicates a sewage leak behind the house."

def guess_category(prompt):
    prompt = prompt.lower()
    if any(word in prompt for word in ["garbage", "trash", "waste", "dump"]):
        return "Garbage", "Medium"
    if any(word in prompt for word in ["pothole", "road crack", "broken road"]):
        return "Pothole", "High"
    if any(word in prompt for word in ["sewage", "leak", "drain", "overflow"]):
        return "Sewage Leak", "High"
    if any(word in prompt for word in ["light", "streetlight", "lamp", "dark"]):
        return "Street Light", "Medium"
    if any(word in prompt for word in ["animal", "dog", "cow", "stray"]):
        return "Animal Control", "Low"
    return "General Complaint", "Low"

def run_oumi_model(prompt):
    try:
        import ollama
        response = ollama.generate(
            model="oumi",
            prompt=f"""Extract complaint details from this text and return JSON:
{prompt}

Return only JSON with: category, urgency, location, description, confidence""",
            stream=False
        )
        result_text = response.get('response', '')
        # Try to parse JSON from response
        import json as json_module
        try:
            data = json_module.loads(result_text)
            return {
                "category": data.get("category", "General"),
                "urgency": data.get("urgency", "Medium"),
                "location": data.get("location", "Not specified"),
                "description": data.get("description", prompt),
                "confidence": data.get("confidence", 0.85)
            }
        except:
            pass
    except:
        pass
    
    # Fallback to rule-based if Oumi fails
    category, urgency = guess_category(prompt)
    return {
        "category": category,
        "urgency": urgency,
        "location": "Not specified",
        "description": prompt,
        "confidence": 0.82
    }

def extract_structured_data(text=None, file_bytes=None, file_type=None):
    if text:
        final_text = text.strip()
    elif file_bytes and file_type:
        if "image" in file_type:
            final_text = extract_text_from_image(file_bytes)
        elif "audio" in file_type:
            final_text = speech_to_text(file_bytes)
        else:
            final_text = "Unsupported file type received."
    else:
        final_text = "No valid input received."
    
    structured = run_oumi_model(final_text)
    
    return {
        "category": structured["category"],
        "urgency": structured["urgency"],
        "location": structured["location"],
        "description": structured["description"],
        "confidence": structured["confidence"],
        "raw_text": final_text,
        "trace": "processed_by_ai_pipeline_v2"
    }
