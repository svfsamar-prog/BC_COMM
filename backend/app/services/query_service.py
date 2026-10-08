from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from backend.app.models import MonthlyRecord, Agent, Period, User

def apply_user_restriction(query, user: User):
    """
    Applies strict Section 4 & 15 AND intersection restriction for state and zone.
    """
    filters = []
    if user.allowed_states and len(user.allowed_states) > 0:
        filters.append(MonthlyRecord.state_name.in_(user.allowed_states))
    if user.allowed_zones and len(user.allowed_zones) > 0:
        filters.append(MonthlyRecord.zone_name.in_(user.allowed_zones))

    if filters:
        query = query.filter(and_(*filters))
    return query

def get_filtered_records_query(
    db: Session,
    user: User,
    month_from: Optional[str] = None,
    month_to: Optional[str] = None,
    state: Optional[str] = None,
    zone: Optional[str] = None,
    dist: Optional[str] = None,
    base_branch: Optional[str] = None,
    search_query: Optional[str] = None,
    activity_filter: Optional[str] = None,
):
    query = db.query(MonthlyRecord).join(Agent, MonthlyRecord.agent_id == Agent.agent_id)

    # 1. Row-Level Security
    query = apply_user_restriction(query, user)

    # 2. Month Range Filter
    if month_from and month_to:
        query = query.filter(and_(MonthlyRecord.month_year >= month_from, MonthlyRecord.month_year <= month_to))
    elif month_from:
        query = query.filter(MonthlyRecord.month_year == month_from)

    # 3. Cascading Dropdowns
    if state:
        query = query.filter(MonthlyRecord.state_name == state)
    if zone:
        query = query.filter(MonthlyRecord.zone_name == zone)
    if dist:
        query = query.filter(MonthlyRecord.dist == dist)
    if base_branch:
        query = query.filter(MonthlyRecord.base_branch == base_branch)

    # 4. Universal Search
    if search_query:
        q = f"%{search_query.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Agent.bca_name).like(q),
                func.lower(MonthlyRecord.agent_id).like(q),
                func.lower(Agent.bank_agent_id).like(q),
                func.lower(MonthlyRecord.base_branch).like(q),
                func.lower(MonthlyRecord.sol_id).like(q),
                func.lower(MonthlyRecord.village_name).like(q),
                func.lower(MonthlyRecord.dist).like(q),
            )
        )

    # 5. Activity Filter
    if activity_filter == "high":
        query = query.filter(MonthlyRecord.login_percentage >= 90.0)
    elif activity_filter == "medium":
        query = query.filter(and_(MonthlyRecord.login_percentage >= 70.0, MonthlyRecord.login_percentage < 90.0))
    elif activity_filter == "low":
        query = query.filter(MonthlyRecord.login_percentage < 70.0)

    return query

def calculate_summary_metrics(query, db: Session) -> Dict[str, Any]:
    """
    Computes all macro summary aggregates directly in database SQL.
    """
    # Count distinct active agents (excluding zero-filled rows)
    distinct_agents_count = (
        query.filter(MonthlyRecord.is_zero_filled == False)
        .with_entities(func.count(func.distinct(MonthlyRecord.agent_id)))
        .scalar()
        or 0
    )

    aggregates = query.with_entities(
        func.sum(MonthlyRecord.total_no_of_acctOpn if hasattr(MonthlyRecord, 'total_no_of_acctOpn') else MonthlyRecord.total_no_of_acct_opn).label("total_accounts"),
        func.sum(MonthlyRecord.funded_no_of_acct_opn).label("total_funded"),
        func.sum(MonthlyRecord.non_funded_no_of_acct_opn).label("total_non_funded"),
        func.sum(MonthlyRecord.financial_txn).label("total_txns"),
        func.sum(MonthlyRecord.txn_amt).label("total_txn_vol"),
        func.sum(MonthlyRecord.txn_comm).label("total_txn_comm"),
        func.sum(MonthlyRecord.apy_count).label("total_apy"),
        func.sum(MonthlyRecord.apy_comm).label("total_apy_comm"),
        func.sum(MonthlyRecord.sby_count).label("total_sby"),
        func.sum(MonthlyRecord.sby_comm).label("total_sby_comm"),
        func.sum(MonthlyRecord.jby_count).label("total_jby"),
        func.sum(MonthlyRecord.jby_comm).label("total_jby_comm"),
        func.sum(MonthlyRecord.incentive_10_sss).label("total_sss_incentive"),
        func.sum(MonthlyRecord.net_commission).label("total_net_comm"),
        func.sum(MonthlyRecord.bc_comm).label("total_bc_comm"),
        func.sum(MonthlyRecord.corp_comm).label("total_corp_comm"),
        func.avg(MonthlyRecord.login_percentage).label("avg_login_pct"),
    ).first()

    return {
        "distinct_agents_count": distinct_agents_count,
        "total_accounts_opened": float(aggregates.total_accounts or 0.0),
        "total_funded_accounts": float(aggregates.total_funded or 0.0),
        "total_non_funded_accounts": float(aggregates.total_non_funded or 0.0),
        "financial_txns": float(aggregates.total_txns or 0.0),
        "txn_amount": float(aggregates.total_txn_vol or 0.0),
        "txn_commission": float(aggregates.total_txn_comm or 0.0),
        "apy_count": float(aggregates.total_apy or 0.0),
        "apy_commission": float(aggregates.total_apy_comm or 0.0),
        "sby_count": float(aggregates.total_sby or 0.0),
        "sby_commission": float(aggregates.total_sby_comm or 0.0),
        "jby_count": float(aggregates.total_jby or 0.0),
        "jby_commission": float(aggregates.total_jby_comm or 0.0),
        "sss_incentive": float(aggregates.total_sss_incentive or 0.0),
        "net_commission": float(aggregates.total_net_comm or 0.0),
        "bc_commission": float(aggregates.total_bc_comm or 0.0),
        "corp_commission": float(aggregates.total_corp_comm or 0.0),
        "avg_login_percentage": round(float(aggregates.avg_login_pct or 0.0), 2),
    }

def format_record_for_user(rec: MonthlyRecord, agent: Agent, is_admin: bool) -> Dict[str, Any]:
    return {
        "id": rec.id,
        "agentId": rec.agent_id,
        "bcaName": agent.bca_name if agent else "N/A",
        "agentIdBank": agent.bank_agent_id if agent else "",
        "dateOfJoining": agent.date_of_joining if agent else "",
        "monthYear": rec.month_year,
        "stateName": rec.state_name,
        "zoneName": rec.zone_name,
        "dist": rec.dist,
        "mandal": rec.mandal,
        "baseBranch": rec.base_branch,
        "solId": rec.sol_id,
        "villageName": rec.village_name,
        "locationType": rec.location_type,
        "deviceId": rec.device_id if is_admin else None,  # Redacted for Viewers!
        "nonFundedNoOfAcctOpn": rec.non_funded_no_of_acct_opn,
        "commNonFundedAcctOpn": rec.comm_non_funded_acct_opn,
        "fundedNoOfAcctOpn": rec.funded_no_of_acct_opn,
        "commFundedAcctOpn": rec.comm_funded_acct_opn,
        "totalNoOfAcctOpn": rec.total_no_of_acct_opn,
        "commTotalAcctOpn": rec.comm_total_acct_opn,
        "financialTxn": rec.financial_txn,
        "txnAmt": rec.txn_amt,
        "txnComm": rec.txn_comm,
        "remittanceCount": rec.remittance_count,
        "remittanceRs10": rec.remittance_rs10,
        "loginDays": rec.login_days,
        "loginPercentage": rec.login_percentage,
        "fixedCommission": rec.fixed_commission,
        "apyCount": rec.apy_count,
        "apyComm": rec.apy_comm,
        "sbyCount": rec.sby_count,
        "sbyComm": rec.sby_comm,
        "jbyCount": rec.jby_count,
        "jbyComm": rec.jby_comm,
        "incentive10Sss": rec.incentive_10_sss,
        "reKycCount": rec.re_kyc_count,
        "reKycComm": rec.re_kyc_comm,
        "netCommission": rec.net_commission,
        "bcComm": rec.bc_comm,
        "corpComm": rec.corp_comm,
        "isZeroFilled": rec.is_zero_filled,
    }
