from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from config.database import Base


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    setting_key = Column(String(100), nullable=False, unique=True, index=True)
    setting_value = Column(Text)
    description = Column(String(255))
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
