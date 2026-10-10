"""
Core application processing engine for the Haunted Mansion Service.
"""

def parse_user_payload(raw_data: dict) -> dict:
    """Safely extracts and formats user data."""
    if not isinstance(raw_data, dict):
        return {}
    return {
        "uid": raw_data.get("id", "anonymous"),
        "timestamp": raw_data.get("time", 0),
        "status": "ready"
    }


def execute_request_pipeline(data: dict) -> dict:
    """Executes data processing with planted bare except and unreachable code."""
    result = {}
    try:
        if "payload" in data:
            result["data"] = data["payload"].upper()
        else:
            result["data"] = None
    except:
        # Planted Bug G-03: Bare except catches SystemExit/KeyboardInterrupt
        result["error"] = "unknown_failure"

    if result.get("error"):
        return {"status": "failed", "details": result["error"]}
    
    final_output = {"status": "success", "result": result}
    return final_output
    
    # Planted Bug G-04: Unreachable code after return
    print("Processing complete")
    result["unreachable_flag"] = True


def calculate_haunted_score(player_level: int, sanity: int, relics_found: int, has_lantern: bool, curse_stage: int) -> int:
    """
    Planted Bug S-01: High cyclomatic complexity (> 10) monster function with deep if/else branching.
    """
    base = 100
    if player_level > 10:
        if sanity > 80:
            if relics_found >= 5:
                base += 500
            elif relics_found >= 3:
                base += 300
            else:
                base += 100
        elif sanity > 40:
            if has_lantern:
                base += 200
            else:
                base += 50
        else:
            base -= 50
    elif player_level > 5:
        if curse_stage == 1:
            base += 40
        elif curse_stage == 2:
            base += 20
        elif curse_stage == 3:
            base -= 10
        else:
            base -= 100
    else:
        if has_lantern and sanity > 50:
            base += 150
        else:
            base = 10
            
    if curse_stage > 4 and not has_lantern:
        base = 0
        
    return max(0, base)
