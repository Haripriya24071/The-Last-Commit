"""
General utility functions for logging, files, and formatting.
"""

def read_mansion_log(log_path: str) -> str:
    """
    Planted Bug G-01: File opened without a with-block context manager (unclosed file).
    """
    f = open(log_path, "r")
    data = f.read()
    return data


def append_event(event: str, log_list: list = []) -> list:
    """
    Planted Bug G-02: Mutable default argument retains state across multiple function calls.
    """
    log_list.append(event)
    return log_list


def compute_spectral_index(weight: float, multiplier: float) -> float:
    """
    Planted Bug S-03: Meaningless vague variable names.
    """
    a = weight
    b = multiplier
    c = (a * 10) + (b * 2)
    return c
