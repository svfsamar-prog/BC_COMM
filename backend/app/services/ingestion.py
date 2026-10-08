import io
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from backend.app.models import Period, Agent, MonthlyRecord, StateAlias, AuditLog

# Default State Aliases Mapping (14 raw spellings -> 11 Canonical States)
DEFAULT_STATE_ALIASES = {
    "BIHAR": "BIHAR",
    "Bihar": "BIHAR",
    "JHARKHAND": "JHARKHAND",
    "Jharkhand": "JHARKHAND",
    "ODISHA": "ODISHA",
    "Odisha": "ODISHA",
    "ORISSA": "ODISHA",
    "WEST BENGAL": "WEST BENGAL",
    "West Bengal": "WEST BENGAL",
    "TELANGANA": "TELANGANA",
    "Telangana": "TELANGANA",
    "TELENGANA": "TELANGANA",
    "MAHARASHTRA": "MAHARASHTRA",
    "Maharashtra": "MAHARASHTRA",
    "SIKKIM": "SIKKIM",
    "Sikkim": "SIKKIM",
    "ASSAM": "ASSAM",
    "Assam": "ASSAM",
    "TRIPURA": "TRIPURA",
    "Tripura": "TRIPURA",
    "MEGHALAYA": "MEGHALAYA",
    "Meghalaya": "MEGHALAYA",
    "UTTAR PRADESH": "UTTAR PRADESH",
    "Uttar Pradesh": "UTTAR PRADESH",
}

def clean_str(val: Any) -> str:
    if pd.isna(val) or val is None:
        return ""
    return str(val).strip()

def clean_num(val: Any) -> float:
    if pd.isna(val) or val is None:
        return 0.0
    try:
        if isinstance(val, (int, float)):
            return float(val) if not np.isnan(val) else 0.0
        cleaned = str(val).replace(",", "").strip()
        return float(cleaned) if cleaned else 0.0
    except Exception:
        return 0.0

def canonicalize_state(raw_state: str, custom_aliases: Dict[str, str] = None) -> str:
    state_trimmed = clean_str(raw_state)
    if custom_aliases and state_trimmed in custom_aliases:
        return custom_aliases[state_trimmed]
    if state_trimmed in DEFAULT_STATE_ALIASES:
        return DEFAULT_STATE_ALIASES[state_trimmed]
    return state_trimmed.upper()

def parse_and_validate_file(
    file_bytes: bytes,
    filename: str,
    month: int,
    year: int,
    days_in_month: int,
    db: Session,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Parses XLSX/CSV into standardized DataFrame and produces Section 5 Pre-Validation report.
    """
    if filename.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes), dtype=str)
    else:
        df = pd.read_excel(io.BytesIO(file_bytes), dtype=str)

    # 1. Rename columns by positional mapping to resolve 3x COMM_ACCT_OPN and trailing spaces
    # Standard column layout has 40 columns
    expected_cols = [
        "STATE_NAME", "ZONE_NAME", "DIST", "Mandal", "BASE_BRANCH", "SOL_ID", "VILLAGE_NAME",
        "AGENT ID", "BCA_NAME", "AGENT ID BANK", "SETT_ACCNO", "DATE OF JOINING", "Device ID",
        "Company Name", "Location Type", "NON FUNDED_NO_OF_ACCT_OPN", "COMM_ACCT_OPN_NON_FUNDED",
        "FUNDED_NO_OF_ACCT_OPN", "COMM_ACCT_OPN_FUNDED", "TOTAL_NO_OF_ACCT_OPN", "COMM_ACCT_OPN_TOTAL",
        "FINANCIAL_TXN", "TXN_AMT", "TXN_COMM", "Remmittance count", "remmittance/Rs10",
        "Login days", "fixd commission", "APY COUNT", "APY COMM", "SBY COUNT", "SBY COMM",
        "JBY COUNT", "JBY COMM", "10 % INCENTIVE for SSS", "Re-KYC Count", "Re-KYC Comm",
        "NET COMMISSION", "BC_COMM", "CORP_COMM"
    ]

    if len(df.columns) == 40:
        df.columns = expected_cols
    else:
        # Standardize header names
        cleaned_headers = []
        comm_seen = 0
        for h in df.columns:
            h_str = str(h).strip()
            if h_str.upper() == "COMM_ACCT_OPN":
                comm_seen += 1
                if comm_seen == 1:
                    cleaned_headers.append("COMM_ACCT_OPN_NON_FUNDED")
                elif comm_seen == 2:
                    cleaned_headers.append("COMM_ACCT_OPN_FUNDED")
                else:
                    cleaned_headers.append("COMM_ACCT_OPN_TOTAL")
            elif h_str.upper() == "AGENT ID" or h_str.upper() == "AGENT ID ":
                cleaned_headers.append("AGENT ID")
            else:
                cleaned_headers.append(h_str)
        df.columns = cleaned_headers

    # Fetch custom aliases from DB
    alias_rows = db.query(StateAlias).all()
    custom_alias_dict = {a.raw_alias: a.canonical_state for a in alias_rows}

    # Normalize state names
    df["STATE_NAME"] = df["STATE_NAME"].apply(lambda s: canonicalize_state(s, custom_alias_dict))
    df["ZONE_NAME"] = df["ZONE_NAME"].apply(clean_str)
    df["DIST"] = df["DIST"].apply(clean_str)
    df["BASE_BRANCH"] = df["BASE_BRANCH"].apply(clean_str)
    df["SOL_ID"] = df["SOL_ID"].apply(lambda s: clean_str(s).zfill(4) if clean_str(s) else "")
    df["AGENT ID"] = df["AGENT ID"].apply(clean_str)
    df["BCA_NAME"] = df["BCA_NAME"].apply(clean_str)
    df["Device ID"] = df["Device ID"].apply(clean_str)

    # Convert numeric fields
    numeric_cols = [
        "NON FUNDED_NO_OF_ACCT_OPN", "COMM_ACCT_OPN_NON_FUNDED", "FUNDED_NO_OF_ACCT_OPN",
        "COMM_ACCT_OPN_FUNDED", "TOTAL_NO_OF_ACCT_OPN", "COMM_ACCT_OPN_TOTAL", "FINANCIAL_TXN",
        "TXN_AMT", "TXN_COMM", "Remmittance count", "remmittance/Rs10", "Login days",
        "fixd commission", "APY COUNT", "APY COMM", "SBY COUNT", "SBY COMM", "JBY COUNT",
        "JBY COMM", "10 % INCENTIVE for SSS", "Re-KYC Count", "Re-KYC Comm", "NET COMMISSION",
        "BC_COMM", "CORP_COMM"
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].apply(clean_num)
        else:
            df[col] = 0.0

    # Calculate Login Percentage
    df["LOGIN_PERCENTAGE"] = df["Login days"].apply(lambda d: round((d / days_in_month) * 100, 2) if days_in_month > 0 else 0.0)

    # Validation Checks
    rows_read = len(df)
    valid_df = df[df["AGENT ID"] != ""].copy()
    rows_valid = len(valid_df)
    rows_rejected = rows_read - rows_valid

    # Duplicate Agent IDs
    duplicate_agents = valid_df[valid_df.duplicated(subset=["AGENT ID"], keep=False)]["AGENT ID"].unique().tolist()

    # Net Commission == BC_COMM + CORP_COMM integrity check
    valid_df["COMM_DIFF"] = (valid_df["NET COMMISSION"] - (valid_df["BC_COMM"] + valid_df["CORP_COMM"])).abs()
    mismatch_rows = valid_df[valid_df["COMM_DIFF"] > 0.1]
    is_comm_balanced = len(mismatch_rows) == 0

    # Summary Totals for Pre-Validation
    total_accounts = float(valid_df["TOTAL_NO_OF_ACCT_OPN"].sum())
    total_txns = float(valid_df["FINANCIAL_TXN"].sum())
    total_txn_amt = float(valid_df["TXN_AMT"].sum())
    total_net_comm = float(valid_df["NET COMMISSION"].sum())
    total_bc_comm = float(valid_df["BC_COMM"].sum())
    total_corp_comm = float(valid_df["CORP_COMM"].sum())
    total_apy = float(valid_df["APY COUNT"].sum())
    total_sby = float(valid_df["SBY COUNT"].sum())
    total_jby = float(valid_df["JBY COUNT"].sum())

    # Check against Previous Months (Section 5a delta analysis)
    current_agent_ids = set(valid_df["AGENT ID"].tolist())
    all_known_agents = {a.agent_id for a in db.query(Agent.agent_id).all()}

    new_agents_count = len(current_agent_ids - all_known_agents)
    missing_agents_count = len(all_known_agents - current_agent_ids) if all_known_agents else 0

    report = {
        "period_label": f"{pd.to_datetime(f'{year}-{month}-01').strftime('%B %Y').upper()}",
        "rows_read": rows_read,
        "rows_valid": rows_valid,
        "rows_rejected": rows_rejected,
        "duplicate_agents": duplicate_agents,
        "is_comm_balanced": is_comm_balanced,
        "mismatched_comm_count": len(mismatch_rows),
        "new_agents_count": new_agents_count,
        "missing_agents_to_zerofill": missing_agents_count,
        "summary": {
            "agents_count": rows_valid,
            "total_accounts_opened": total_accounts,
            "financial_txns": total_txns,
            "txn_amount": total_txn_amt,
            "net_commission": total_net_comm,
            "bc_commission": total_bc_comm,
            "corp_commission": total_corp_comm,
            "apy_count": total_apy,
            "sby_count": total_sby,
            "jby_count": total_jby,
        }
    }

    return valid_df, report

def commit_monthly_dataset(
    df: pd.DataFrame,
    month_year: str,
    year: int,
    month: int,
    days_in_month: int,
    uploaded_by: str,
    db: Session,
) -> Dict[str, Any]:
    """
    Executes Section 5 & 5a: Inserts/Updates master records, generates zero-filled rows across history.
    """
    # 1. Upsert or Replace Period
    period = db.query(Period).filter(Period.month_year == month_year).first()
    if period:
        # Delete old monthly_records for this period before replacing
        db.query(MonthlyRecord).filter(MonthlyRecord.month_year == month_year).delete()
    else:
        period = Period(
            month_year=month_year,
            year=year,
            month=month,
            calendar_days=days_in_month,
            uploaded_by=uploaded_by,
            rows_count=len(df),
        )
        db.add(period)

    db.commit()

    # 2. Upsert Agents into agents master table
    for _, row in df.iterrows():
        agent_id = row["AGENT ID"]
        existing_agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
        if not existing_agent:
            new_agent = Agent(
                agent_id=agent_id,
                bca_name=row["BCA_NAME"],
                bank_agent_id=row.get("AGENT ID BANK", ""),
                date_of_joining=row.get("DATE OF JOINING", ""),
                first_seen_period=month_year,
            )
            db.add(new_agent)

    db.commit()

    # 3. Insert reported MonthlyRecords for this period
    records_to_insert = []
    for _, row in df.iterrows():
        agent_id = row["AGENT ID"]
        record_id = f"{agent_id}_{month_year}"

        rec = MonthlyRecord(
            id=record_id,
            agent_id=agent_id,
            month_year=month_year,
            state_name=row["STATE_NAME"],
            zone_name=row["ZONE_NAME"],
            dist=row["DIST"],
            mandal=row.get("Mandal", ""),
            base_branch=row.get("BASE_BRANCH", ""),
            sol_id=row.get("SOL_ID", ""),
            village_name=row.get("VILLAGE_NAME", ""),
            company_name=row.get("Company Name", "SANJIVANI"),
            location_type=row.get("Location Type", "RURAL"),
            device_id=row.get("Device ID", ""),
            non_funded_no_of_acct_opn=row["NON FUNDED_NO_OF_ACCT_OPN"],
            comm_non_funded_acct_opn=row["COMM_ACCT_OPN_NON_FUNDED"],
            funded_no_of_acct_opn=row["FUNDED_NO_OF_ACCT_OPN"],
            comm_funded_acct_opn=row["COMM_ACCT_OPN_FUNDED"],
            total_no_of_acct_opn=row["TOTAL_NO_OF_ACCT_OPN"],
            comm_total_acct_opn=row["COMM_ACCT_OPN_TOTAL"],
            financial_txn=row["FINANCIAL_TXN"],
            txn_amt=row["TXN_AMT"],
            txn_comm=row["TXN_COMM"],
            remittance_count=row["Remmittance count"],
            remittance_rs10=row["remmittance/Rs10"],
            login_days=row["Login days"],
            login_percentage=row["LOGIN_PERCENTAGE"],
            fixed_commission=row["fixd commission"],
            apy_count=row["APY COUNT"],
            apy_comm=row["APY COMM"],
            sby_count=row["SBY COUNT"],
            sby_comm=row["SBY COMM"],
            jby_count=row["JBY COUNT"],
            jby_comm=row["JBY COMM"],
            incentive_10_sss=row["10 % INCENTIVE for SSS"],
            re_kyc_count=row["Re-KYC Count"],
            re_kyc_comm=row["Re-KYC Comm"],
            net_commission=row["NET COMMISSION"],
            bc_comm=row["BC_COMM"],
            corp_comm=row["CORP_COMM"],
            is_zero_filled=False,
        )
        records_to_insert.append(rec)

    db.bulk_save_objects(records_to_insert)
    db.commit()

    # 4. Section 5a Zero-Filling Pipeline across ALL uploaded periods
    all_periods = db.query(Period).all()
    all_agents = db.query(Agent).all()

    zero_fill_inserts = []
    for p in all_periods:
        # Get existing agent IDs for period p
        existing_in_period = {
            r.agent_id for r in db.query(MonthlyRecord.agent_id).filter(MonthlyRecord.month_year == p.month_year).all()
        }

        for ag in all_agents:
            if ag.agent_id not in existing_in_period:
                # Find nearest known record for location details
                nearest_rec = (
                    db.query(MonthlyRecord)
                    .filter(MonthlyRecord.agent_id == ag.agent_id, MonthlyRecord.is_zero_filled == False)
                    .first()
                )

                state_name = nearest_rec.state_name if nearest_rec else "UNSPECIFIED"
                zone_name = nearest_rec.zone_name if nearest_rec else "UNSPECIFIED"
                dist = nearest_rec.dist if nearest_rec else "UNSPECIFIED"
                base_branch = nearest_rec.base_branch if nearest_rec else ""
                sol_id = nearest_rec.sol_id if nearest_rec else ""
                device_id = nearest_rec.device_id if nearest_rec else ""

                zf_rec = MonthlyRecord(
                    id=f"{ag.agent_id}_{p.month_year}",
                    agent_id=ag.agent_id,
                    month_year=p.month_year,
                    state_name=state_name,
                    zone_name=zone_name,
                    dist=dist,
                    base_branch=base_branch,
                    sol_id=sol_id,
                    device_id=device_id,
                    is_zero_filled=True,
                )
                zero_fill_inserts.append(zf_rec)

    if zero_fill_inserts:
        db.bulk_save_objects(zero_fill_inserts)
        db.commit()

    # Audit log
    audit = AuditLog(
        username=uploaded_by,
        action="IMPORT_MONTHLY_STATEMENT",
        details=f"Committed period {month_year} with {len(df)} reported rows and {len(zero_fill_inserts)} zero-filled rows.",
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "month_year": month_year,
        "reported_records": len(df),
        "zero_filled_records": len(zero_fill_inserts),
    }
