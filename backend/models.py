from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime
from uuid import uuid4

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to sessions
    sessions = relationship("DrillSession", back_populates="user")

class DrillSession(Base):
    """
    Stores the full state of a GRE drill session.
    Using 'DrillSession' to avoid naming conflicts with SQLAlchemy 'Session'.
    """
    __tablename__ = "drill_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # nullable for now (guest mode)
    
    # Session Metadata
    difficulty = Column(String)
    exam_date = Column(String) # ISO format string
    
    # Content (Stored as JSON/Text to simplify retrieval)
    passage_title = Column(String)
    passage_text = Column(Text)
    questions_data = Column(JSON) # List of questions
    
    # Progress & Results
    original_score = Column(String, nullable=True)
    final_mastery = Column(String, nullable=True)
    traps_identified = Column(JSON, nullable=True) # List of strings
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="sessions")
