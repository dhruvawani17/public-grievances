import json
data = {
  "garbage": "Solid Waste Management Department",
  "pothole": "Roads & Infrastructure Department",
  "water leak": "Water Supply Department",
  "sewage": "Sewage & Drainage Department",
  "streetlight": "Electrical & Street Lighting Department",
  "noise": "Public Safety & Enforcement Department",
  "animal": "Animal Control Department",
  "tree": "Parks & Horticulture Department",
  "general": "General Administration"
}
with open('departments.json', 'w', encoding='utf-8-sig') as f:
    json.dump(data, f, indent=2)
print("Fixed departments.json!")
