from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import re

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'domain_model.pkl')
model = None

try:
    model = pickle.load(open(MODEL_PATH, "rb"))
    print("✓ ML Model loaded successfully")
except Exception as e:
    print(f"✗ Error loading model: {e}")

# Priority detection keywords
HIGH_KEYWORDS = [
    "urgent", "immediately", "asap", "critical",
    "server down", "system crash", "system down",
    "ransomware", "security breach", "data breach",
    "not working", "critical", "downtime", "data loss", 
    "critical failure", "complete failure", "totally broken",
    "can't access", "cannot access", "emergency"
]

MEDIUM_KEYWORDS = [
    "slow", "error", "issue", "problem", 
    "warning", "glitch", "performance", 
    "bug", "minor", "sometimes", "intermittent",
    "delayed", "lagging"
]

# Technician routing based on category/domain
TECHNICIAN_ROUTING = {
    "Network": "Network Team",
    "Hardware": "Hardware Team",
    "Software": "Software Team",
    "Access": "Access & Security Team",
    "Security": "Security Team",
    "Gmail": "Email & Communication Team",
    "Others": "General Support Team"
}

def detect_priority(text):
    """Detect priority based on keywords in the issue text"""
    text_lower = text.lower()
    
    # Check for high priority keywords
    for keyword in HIGH_KEYWORDS:
        if keyword in text_lower:
            return "High"
    
    # Check for medium priority keywords
    for keyword in MEDIUM_KEYWORDS:
        if keyword in text_lower:
            return "Medium"
    
    # Default to low
    return "Low"

def route_technician(category):
    """Route to appropriate technician team based on category"""
    return TECHNICIAN_ROUTING.get(category, "General Support Team")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/analyze', methods=['POST'])
def analyze_ticket():
    """
    Analyze ticket and predict category, priority, and routing
    
    Request body:
    {
        "issue": "Server is down and needs urgent fix"
    }
    
    Response:
    {
        "success": true,
        "data": {
            "category": "Network",
            "priority": "High",
            "assignedTeam": "Network Team",
            "confidence": 0.95
        }
    }
    """
    try:
        if not model:
            return jsonify({
                "success": False,
                "error": "ML model not loaded"
            }), 500
        
        data = request.get_json()
        issue_text = data.get('issue', '').strip()
        
        if not issue_text:
            return jsonify({
                "success": False,
                "error": "Issue text is required"
            }), 400
        
        # Step 1: Predict category using trained model
        predicted_category = model.predict([issue_text])[0]
        
        # Get prediction probability (confidence)
        try:
            probabilities = model.predict_proba([issue_text])[0]
            confidence = float(max(probabilities))
        except:
            confidence = 0.85  # Default confidence
        
        # Step 2: Detect priority based on keywords
        predicted_priority = detect_priority(issue_text)
        
        # Step 3: Route to appropriate technician team
        assigned_team = route_technician(predicted_category)
        
        # Return analysis result
        result = {
            "success": True,
            "data": {
                "category": predicted_category,
                "priority": predicted_priority,
                "assignedTeam": assigned_team,
                "confidence": round(confidence, 2),
                "originalIssue": issue_text
            }
        }
        
        print(f"✓ Analyzed: {issue_text[:50]}... -> {predicted_category} | {predicted_priority} | {assigned_team}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"✗ Error analyzing ticket: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('ML_SERVICE_PORT', 5001))
    print(f"\n🚀 ML Service starting on port {port}...")
    print(f"📊 Model path: {MODEL_PATH}")
    app.run(host='0.0.0.0', port=port, debug=True)
