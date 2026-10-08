import os
import sys

# Add project root to sys.path
sys.path.insert(0, r"c:\Users\Samar Raj\Desktop\bc comm")

from backend.app.database import engine, Base, SessionLocal
from backend.app.services.ingestion import parse_and_validate_file, commit_monthly_dataset
from backend.app.models import MonthlyRecord, Agent, Period

def run_reconciliation_audit():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    sample_path = r"c:\Users\Samar Raj\Desktop\bc comm\SANJIVANI COMMISSION AUGUST 2026.xlsx"
    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    df, report = parse_and_validate_file(
        file_bytes=file_bytes,
        filename="SANJIVANI COMMISSION AUGUST 2026.xlsx",
        month=8,
        year=2026,
        days_in_month=31,
        db=db,
    )

    commit_monthly_dataset(
        df=df,
        month_year="AUGUST 2026",
        year=2026,
        month=8,
        days_in_month=31,
        uploaded_by="admin",
        db=db,
    )

    s = report["summary"]
    
    targets = {
        "Agents": (s["agents_count"], 675),
        "Total Accounts Opened": (s["total_accounts_opened"], 6687),
        "APY Count": (s["apy_count"], 906),
        "SBY Count": (s["sby_count"], 3931),
        "JBY Count": (s["jby_count"], 1574),
        "Financial Txns": (s["financial_txns"], 221293),
        "Txn Amount": (s["txn_amount"], 951122246),
        "Net Commission": (s["net_commission"], 2925439.50),
        "BC Commission": (s["bc_commission"], 2340351.60),
        "Corp Commission": (s["corp_commission"], 585087.90),
    }

    print("=" * 65)
    print("SANJIVANI COMMISSION - SECTION 3 RECONCILIATION AUDIT")
    print("=" * 65)

    all_passed = True
    for metric, (actual, expected) in targets.items():
        diff = abs(actual - expected)
        passed = diff < 0.01
        if not passed:
            all_passed = False
        status = "PASS [OK]" if passed else f"FAIL (Diff: {diff})"
        print(f"{metric:<25} | Actual: {actual:>14,.2f} | Expected: {expected:>14,.2f} | {status}")

    print("=" * 65)
    if all_passed:
        print(">>> ALL SECTION 3 RECONCILIATION TARGETS MATCH 100.0% EXACTLY! <<<")
    else:
        print(">>> RECONCILIATION AUDIT FAILED! <<<")
    print("=" * 65)

    db.close()
    return all_passed

if __name__ == "__main__":
    success = run_reconciliation_audit()
    sys.exit(0 if success else 1)
