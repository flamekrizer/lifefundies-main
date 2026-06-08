from typing import Dict, Any
from datetime import datetime
import json
import os
import sqlite3


class MemorySystem:
    """SQLite-backed IRA memory: episodic, semantic, and emotional."""

    def __init__(self):
        self.db_path = self._resolve_sqlite_path()
        self._init_db()

    def _resolve_sqlite_path(self) -> str:
        database_url = os.getenv("DATABASE_URL", "sqlite:///./ira.db")
        if database_url.startswith("sqlite:///"):
            return database_url.replace("sqlite:///", "", 1)
        return "./ira.db"

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at TEXT,
                    last_active TEXT,
                    message_count INTEGER DEFAULT 0
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS episodic_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    timestamp TEXT,
                    emotion TEXT,
                    domain TEXT,
                    summary TEXT,
                    action_taken TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS semantic_memory (
                    session_id TEXT PRIMARY KEY,
                    preferred_domains TEXT,
                    comm_style TEXT,
                    context_notes TEXT,
                    updated_at TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS emotional_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    timestamp TEXT,
                    emotion TEXT,
                    empathy_level REAL,
                    sentiment_score REAL,
                    trigger_domain TEXT
                )
            """)

    def ensure_session(self, session_id: str) -> None:
        now = datetime.utcnow().isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO user_sessions(session_id, created_at, last_active, message_count)
                VALUES (?, ?, ?, 0)
                ON CONFLICT(session_id) DO UPDATE SET last_active = excluded.last_active
                """,
                (session_id, now, now),
            )

    def store_episodic(self, user_id: str, interaction: Dict[str, Any]) -> None:
        """Store a specific session event for continuity."""
        self.ensure_session(user_id)
        now = datetime.utcnow().isoformat()
        user_message = interaction.get("user_message", "")
        assistant_response = interaction.get("assistant_response", "")
        summary = (
            f"User: {user_message[:240]} | Fundoo: {assistant_response[:240]}"
            if assistant_response else user_message[:300]
        )

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO episodic_memory(session_id, timestamp, emotion, domain, summary, action_taken)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    now,
                    interaction.get("emotion", "neutral"),
                    interaction.get("domain", "Personal Growth"),
                    summary,
                    interaction.get("response_type") or interaction.get("intent", "CHAT"),
                ),
            )
            conn.execute(
                """
                UPDATE user_sessions
                SET last_active = ?, message_count = message_count + 1
                WHERE session_id = ?
                """,
                (now, user_id),
            )

    def store_semantic(self, user_id: str, key: str, value: Any) -> None:
        """Store general knowledge about the user/session."""
        self.ensure_session(user_id)
        existing = self.retrieve_context(user_id).get("semantic", {})
        existing[key] = value
        preferred_domains = existing.get("preferred_domains", [])
        context_notes = existing.get("context_notes", "")
        comm_style = existing.get("comm_style", "warm")
        now = datetime.utcnow().isoformat()

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO semantic_memory(session_id, preferred_domains, comm_style, context_notes, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    preferred_domains = excluded.preferred_domains,
                    comm_style = excluded.comm_style,
                    context_notes = excluded.context_notes,
                    updated_at = excluded.updated_at
                """,
                (user_id, json.dumps(preferred_domains), comm_style, context_notes, now),
            )

    def store_emotional(self, user_id: str, emotion_data: Dict[str, Any]) -> None:
        """Store emotional pattern history."""
        self.ensure_session(user_id)
        now = datetime.utcnow().isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO emotional_memory(
                    session_id, timestamp, emotion, empathy_level, sentiment_score, trigger_domain
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    now,
                    emotion_data.get("current_emotion", "neutral"),
                    emotion_data.get("empathy_level", 0.60),
                    emotion_data.get("sentiment_score", 0.0),
                    emotion_data.get("domain", "Personal Growth"),
                ),
            )

    def retrieve_context(self, user_id: str, limit: int = 5) -> Dict[str, Any]:
        """Retrieve relevant memory context for the LLM prompt."""
        self.ensure_session(user_id)
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            episodic_rows = conn.execute(
                """
                SELECT timestamp, emotion, domain, summary, action_taken
                FROM episodic_memory
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (user_id, limit),
            ).fetchall()
            semantic_row = conn.execute(
                "SELECT preferred_domains, comm_style, context_notes, updated_at FROM semantic_memory WHERE session_id = ?",
                (user_id,),
            ).fetchone()
            emotional_rows = conn.execute(
                """
                SELECT timestamp, emotion, empathy_level, sentiment_score, trigger_domain
                FROM emotional_memory
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (user_id, limit),
            ).fetchall()

        semantic = {}
        if semantic_row:
            semantic = {
                "preferred_domains": json.loads(semantic_row["preferred_domains"] or "[]"),
                "comm_style": semantic_row["comm_style"],
                "context_notes": semantic_row["context_notes"],
                "updated_at": semantic_row["updated_at"],
            }

        return {
            "episodic": [dict(row) for row in reversed(episodic_rows)],
            "semantic": semantic,
            "emotional": [dict(row) for row in reversed(emotional_rows)],
        }

    def get_user_profile_summary(self, user_id: str) -> str:
        """Generate a compact profile summary for the LLM."""
        memory = self.retrieve_context(user_id)
        summary_parts = []

        if memory["episodic"]:
            recent = memory["episodic"][-3:]
            summary_parts.append(
                "Recent memories: " + " || ".join(item["summary"] for item in recent)
            )

        if memory["emotional"]:
            latest = memory["emotional"][-1]
            summary_parts.append(
                f"Latest emotion: {latest['emotion']} in {latest['trigger_domain']} "
                f"(empathy {latest['empathy_level']})"
            )

        if memory["semantic"].get("context_notes"):
            summary_parts.append(f"Context notes: {memory['semantic']['context_notes']}")

        return " | ".join(summary_parts) if summary_parts else "New anonymous session"
