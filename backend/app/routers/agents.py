from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional
from backend.app.database import get_db
from backend.app.models import User, Agent, MonthlyRecord, Period
from backend.app.services.auth_service import get_current_user
from backend.app.services.query_service import get_filtered_records_query, format_record_for_user

router = APIRouter(prefix="/agents", tags=["Agent Directory & Drawer"])

@router.get("")
def list_agents(
    month_from: Optional[str] = None,
    month_to: Optional[str] = None,
    state: Optional[str] = None,
    zone: Optional[str] = None,
    dist: Optional[str] = None,
    base_branch: Optional[str] = None,
    search_query: Optional[str] = None,
    activity_filter: Optional[str] = None,
    sort_by: str = "net_commission",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=200),
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

    total_records = query.count()

    # Dynamic sorting
    sort_col = getattr(MonthlyRecord, sort_by, MonthlyRecord.net_commission)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    records = query.offset((page - 1) * page_size).limit(page_size).all()
    is_admin = current_user.role == "admin"

    items = []
    for rec in records:
        agent = db.query(Agent).filter(Agent.agent_id == rec.agent_id).first()
        items.append(format_record_for_user(rec, agent, is_admin))

    return {
        "items": items,
        "total": total_records,
        "page": page,
        "pageSize": page_size,
        "totalPages": (total_records + page_size - 1) // page_size if total_records > 0 else 1,
    }

@router.get("/{agent_id}")
def get_agent_detail(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    is_admin = current_user.role == "admin"

    # Fetch all historical monthly records for this agent
    monthly_records = (
        db.query(MonthlyRecord)
        .join(Period, MonthlyRecord.month_year == Period.month_year)
        .filter(MonthlyRecord.agent_id == agent_id)
        .order_by(Period.year.desc(), Period.month.desc())
        .all()
    )

    history = [format_record_for_user(r, agent, is_admin) for r in monthly_records]
    latest = history[0] if history else None

    return {
        "agentId": agent.agent_id,
        "bcaName": agent.bca_name,
        "bankAgentId": agent.bank_agent_id,
        "dateOfJoining": agent.date_of_joining,
        "firstSeenPeriod": agent.first_seen_period,
        "latestRecord": latest,
        "monthlyHistory": history,  # Contains zero-filled months marked isZeroFilled=True (Section 5a)
    }
