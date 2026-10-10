"""
Unit tests for application core engine.
"""
# Planted Bug G-05: Unused imports
import math
import sys
import os

from src.core import parse_user_payload, execute_request_pipeline


def test_parse_user_payload():
    payload = {"id": "player_1", "time": 100}
    result = parse_user_payload(payload)
    assert result["uid"] == "player_1"
    assert result["status"] == "ready"


def test_execute_request_pipeline():
    data = {"payload": "curse"}
    res = execute_request_pipeline(data)
    assert res["status"] == "success"


def unused_phantom_calculation():
    """
    Planted Bug S-02: Dead code - function defined but never invoked anywhere.
    """
    dead_val = 666 * 2
    return dead_val
