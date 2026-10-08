from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="viewer", nullable=False)  # 'admin' or 'viewer'
    allowed_states = Column(JSON, default=list)  # List of state names, empty means all allowed
    allowed_zones = Column(JSON, default=list)   # List of zone names, empty means all allowed
    created_at = Column(DateTime, default=datetime.utcnow)

class Period(Base):
    __tablename__ = "periods"

    month_year = Column(String(30), primary_key=True, index=True)  # e.g. "AUGUST 2026"
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    calendar_days = Column(Integer, nullable=False, default=31)
    uploaded_by = Column(String(50), default="admin")
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    rows_count = Column(Integer, default=0)

    records = relationship("MonthlyRecord", back_populates="period", cascade="all, delete-orphan")

class Agent(Base):
    __tablename__ = "agents"

    agent_id = Column(String(50), primary_key=True, index=True)
    bca_name = Column(String(150), index=True, nullable=False)
    bank_agent_id = Column(String(50), index=True, nullable=True)
    date_of_joining = Column(String(30), nullable=True)
    first_seen_period = Column(String(30), nullable=True)

    records = relationship("MonthlyRecord", back_populates="agent", cascade="all, delete-orphan")

class MonthlyRecord(Base):
    __tablename__ = "monthly_records"

    id = Column(String(100), primary_key=True, index=True)  # {agent_id}_{month_year}
    agent_id = Column(String(50), ForeignKey("agents.agent_id"), index=True, nullable=False)
    month_year = Column(String(30), ForeignKey("periods.month_year"), index=True, nullable=False)

    # Location & Hierarchy
    state_name = Column(String(80), index=True, nullable=False)
    zone_name = Column(String(80), index=True, nullable=False)
    dist = Column(String(80), index=True, nullable=False)
    mandal = Column(String(100), nullable=True)
    base_branch = Column(String(100), index=True, nullable=True)
    sol_id = Column(String(30), index=True, nullable=True)
    village_name = Column(String(100), nullable=True)
    company_name = Column(String(80), default="SANJIVANI")
    location_type = Column(String(30), default="RURAL")

    # Hardware (Admin visible only)
    device_id = Column(String(50), nullable=True)

    # Account Opening
    non_funded_no_of_acct_opn = Column(Float, default=0.0)
    comm_non_funded_acct_opn = Column(Float, default=0.0)
    funded_no_of_acct_opn = Column(Float, default=0.0)
    comm_funded_acct_opn = Column(Float, default=0.0)
    total_no_of_acct_opn = Column(Float, default=0.0)
    comm_total_acct_opn = Column(Float, default=0.0)

    # Financial Transactions
    financial_txn = Column(Float, default=0.0)
    txn_amt = Column(Float, default=0.0)
    txn_comm = Column(Float, default=0.0)
    remittance_count = Column(Float, default=0.0)
    remittance_rs10 = Column(Float, default=0.0)

    # Attendance
    login_days = Column(Float, default=0.0)
    login_percentage = Column(Float, default=0.0)
    fixed_commission = Column(Float, default=0.0)

    # SSS Schemes
    apy_count = Column(Float, default=0.0)
    apy_comm = Column(Float, default=0.0)
    sby_count = Column(Float, default=0.0)
    sby_comm = Column(Float, default=0.0)
    jby_count = Column(Float, default=0.0)
    jby_comm = Column(Float, default=0.0)
    incentive_10_sss = Column(Float, default=0.0)

    # Re-KYC
    re_kyc_count = Column(Float, default=0.0)
    re_kyc_comm = Column(Float, default=0.0)

    # Commission & Split
    net_commission = Column(Float, default=0.0)
    bc_comm = Column(Float, default=0.0)
    corp_comm = Column(Float, default=0.0)

    # Section 5a Zero-Filling flag
    is_zero_filled = Column(Boolean, default=False, nullable=False)

    agent = relationship("Agent", back_populates="records")
    period = relationship("Period", back_populates="records")

class StateAlias(Base):
    __tablename__ = "state_aliases"

    raw_alias = Column(String(80), primary_key=True)
    canonical_state = Column(String(80), nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
