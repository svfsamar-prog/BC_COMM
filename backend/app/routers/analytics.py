from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from backend.app.database import get_db
from backend.app.models import User, MonthlyRecord, Period
from backend.app.services.auth_service import get_current_user
from backend.app.services.query_service import (
    get_filtered_records_query,
    calculate_summary_metrics,
    apply_user_restriction,
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Aggregations"])

@router.get("/summary")
def get_summary(
    month_from: Optional[str] = None,
    month_to: Optional[str] = None,
    state: Optional[str] = None,
    zone: Optional[str] = None,
    dist: Optional[str] = None,
    base_branch: Optional[str] = None,
    search_query: Optional[str] = None,
    activity_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = get_filtered_records_query(
        db=db,
        user=current_user,
        month_from=month_from,
        month_to=month_to,
        state=state,
        zone=zone,
        dist=dist,
        base_branch=base_branch,
        search_query=search_query,
        activity_filter=activity_filter,
    )
    return calculate_summary_metrics(query, db)

@router.get("/hierarchy")
def get_hierarchy(
    type: str = Query("district", pattern="^(state|zone|district|branch)$"),
    month_from: Optional[str] = None,
    month_to: Optional[str] = None,
    state: Optional[str] = None,
    zone: Optional[str] = None,
    dist: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = get_filtered_records_query(
        db=db,
        user=current_user,
        month_from=month_from,
        month_to=month_to,
        state=state,
        zone=zone,
        dist=dist,
    )

    group_col = (
        MonthlyRecord.state_name if type == "state"
        else MonthlyRecord.zone_name if type == "zone"
        else MonthlyRecord.dist if type == "district"
        else MonthlyRecord.base_branch
    )

    results = (
        query.with_entities(
            group_col.label("name"),
            func.count(func.distinct(MonthlyRecord.agent_id)).label("agent_count"),
            func.sum(MonthlyRecord.total_no_of_acct_opn).label("total_accounts"),
            func.sum(MonthlyRecord.financial_txn).label("total_txns"),
            func.sum(MonthlyRecord.txn_amt).label("txn_volume"),
            func.sum(MonthlyRecord.apy_count).label("apy_count"),
            func.sum(MonthlyRecord.sby_count).label("sby_count"),
            func.sum(MonthlyRecord.jby_count).label("jby_count"),
            func.sum(MonthlyRecord.net_commission).label("total_net_commission"),
            func.sum(MonthlyRecord.bc_comm).label("total_bc_commission"),
            func.sum(MonthlyRecord.corp_comm).label("total_corp_commission"),
            func.avg(MonthlyRecord.login_percentage).label("avg_login_pct"),
        )
        .group_by(group_col)
        .order_by(func.sum(MonthlyRecord.net_commission).desc())
        .all()
    )

    return [
        {
            "name": r.name or "UNSPECIFIED",
            "agentCount": int(r.agent_count or 0),
            "totalAccounts": float(r.total_accounts or 0.0),
            "totalTxn": float(r.total_txns or 0.0),
            "txnVolume": float(r.txn_volume or 0.0),
            "apyCount": float(r.apy_count or 0.0),
            "sbyCount": float(r.sby_count or 0.0),
            "jbyCount": float(r.jby_count or 0.0),
            "totalNetCommission": float(r.total_net_commission or 0.0),
            "totalBcCommission": float(r.total_bc_commission or 0.0),
            "totalCorpCommission": float(r.total_corp_commission or 0.0),
            "avgLoginPct": round(float(r.avg_login_pct or 0.0), 2),
        }
        for r in results
    ]

@router.get("/filters-data")
def get_filters_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = db.query(MonthlyRecord)
    base_query = apply_user_restriction(base_query, current_user)

    states = [s[0] for s in base_query.with_entities(MonthlyRecord.state_name).distinct().order_by(MonthlyRecord.state_name).all() if s[0]]
    zones = [z[0] for z in base_query.with_entities(MonthlyRecord.zone_name).distinct().order_by(MonthlyRecord.zone_name).all() if z[0]]
    districts = [d[0] for d in base_query.with_entities(MonthlyRecord.dist).distinct().order_by(MonthlyRecord.dist).all() if d[0]]
    branches = [b[0] for b in base_query.with_entities(MonthlyRecord.base_branch).distinct().order_by(MonthlyRecord.base_branch).all() if b[0]]
    periods = [p[0] for p in db.query(Period.month_year).order_by(Period.year.desc(), Period.month.desc()).all()]

    return {
        "states": states,
        "zones": zones,
        "districts": districts,
        "branches": branches,
        "periods": periods,
    }
