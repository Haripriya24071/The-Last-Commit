"""
Database client connector and query helpers.
"""
import sqlite3

class DatabaseConnection:
    def __init__(self, db_path: str = "mansion.db"):
        self.db_path = db_path

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def find_user_by_username(self, username: str):
        """
        Planted Bug R-04: SQL Injection via string concatenation.
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM users WHERE username = '" + username + "'"
        cursor.execute(query)
        record = cursor.fetchone()
        conn.close()
        return record
