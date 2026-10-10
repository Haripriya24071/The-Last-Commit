"""
Decoy Clean File: Database data schema definitions.
"""
from dataclasses import dataclass

@dataclass
class MansionUser:
    id: str
    username: str
    is_active: bool = True
    role: str = "guest"
