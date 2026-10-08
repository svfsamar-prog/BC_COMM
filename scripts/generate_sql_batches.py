import json
import pandas as pd
from backend.app.services.ingestion import parse_and_validate_file, DEFAULT_STATE_ALIASES

# Read excel file
excel_path = r"c:\Users\Samar Raj\Desktop\bc comm\SANJIVANI COMMISSION AUGUST 2026.xlsx"
with open(excel_path, "rb") as f:
    file_bytes = f.read()

# Mock a simple db alias dict for parsing
class DummyDB:
    def query(self, model):
        class MockQuery:
            def all(self):
                return []
        return MockQuery()

df, report = parse_and_validate_file(
    file_bytes=file_bytes,
    filename="SANJIVANI COMMISSION AUGUST 2026.xlsx",
    month=8,
    year=2026,
    days_in_month=31,
    db=DummyDB(),
)

print("Parsed rows:", len(df))

# Prepare Periods SQL
period_sql = """
INSERT INTO sanjivani.periods (month_year, year, month, days_in_month, uploaded_by)
VALUES ('AUGUST 2026', 2026, 8, 31, 'admin')
ON CONFLICT (month_year) DO NOTHING;
"""

# Prepare Agents SQL
agent_values = []
for _, r in df.iterrows():
    aid = str(r["AGENT ID"]).replace("'", "''")
    bca = str(r["BCA_NAME"]).replace("'", "''")
    st = str(r["STATE_NAME"]).replace("'", "''")
    zn = str(r["ZONE_NAME"]).replace("'", "''")
    dt = str(r["DIST"]).replace("'", "''")
    md = str(r.get("Mandal", "")).replace("'", "''")
    br = str(r.get("BASE_BRANCH", "")).replace("'", "''")
    sol = str(r.get("SOL_ID", "")).replace("'", "''")
    vil = str(r.get("VILLAGE_NAME", "")).replace("'", "''")
    doj = str(r.get("DATE OF JOINING", "")).replace("'", "''")
    loc = str(r.get("Location Type", "RURAL")).replace("'", "''")
    comp = str(r.get("Company Name", "SANJIVANI")).replace("'", "''")
    
    agent_values.append(f"('{aid}', '{bca}', '{st}', '{zn}', '{dt}', '{md}', '{br}', '{sol}', '{vil}', '{doj}', '{loc}', '{comp}')")

# Prepare Monthly Records SQL
monthly_values = []
for _, r in df.iterrows():
    aid = str(r["AGENT ID"]).replace("'", "''")
    my = 'AUGUST 2026'
    st = str(r["STATE_NAME"]).replace("'", "''")
    zn = str(r["ZONE_NAME"]).replace("'", "''")
    dt = str(r["DIST"]).replace("'", "''")
    md = str(r.get("Mandal", "")).replace("'", "''")
    br = str(r.get("BASE_BRANCH", "")).replace("'", "''")
    sol = str(r.get("SOL_ID", "")).replace("'", "''")
    vil = str(r.get("VILLAGE_NAME", "")).replace("'", "''")
    bca = str(r["BCA_NAME"]).replace("'", "''")
    dev = str(r.get("Device ID", "")).replace("'", "''")
    
    non_funded = float(r.get("NON FUNDED_NO_OF_ACCT_OPN", 0) or 0)
    comm_non_funded = float(r.get("COMM_ACCT_OPN_NON_FUNDED", 0) or 0)
    funded = float(r.get("FUNDED_NO_OF_ACCT_OPN", 0) or 0)
    comm_funded = float(r.get("COMM_ACCT_OPN_FUNDED", 0) or 0)
    total_acct = float(r.get("TOTAL_NO_OF_ACCT_OPN", 0) or 0)
    comm_acct = float(r.get("COMM_ACCT_OPN_TOTAL", 0) or 0)
    
    fin_txn = float(r.get("FINANCIAL_TXN", 0) or 0)
    txn_amt = float(r.get("TXN_AMT", 0) or 0)
    comm_txn = float(r.get("TXN_COMM", 0) or 0)
    
    rem_cnt = float(r.get("Remmittance count", 0) or 0)
    rem_amt = float(r.get("remmittance/Rs10", 0) or 0)
    login_days = float(r.get("Login days", 0) or 0)
    login_pct = float(r.get("LOGIN_PERCENTAGE", 0) or 0)
    total_comm = float(r.get("NET COMMISSION", 0) or 0)
    
    apy_cnt = float(r.get("APY COUNT", 0) or 0)
    apy_comm = float(r.get("APY COMM", 0) or 0)
    sby_cnt = float(r.get("SBY COUNT", 0) or 0)
    sby_comm = float(r.get("SBY COMM", 0) or 0)
    jby_cnt = float(r.get("JBY COUNT", 0) or 0)
    jby_comm = float(r.get("JBY COMM", 0) or 0)
    sss_inc = float(r.get("10 % INCENTIVE for SSS", 0) or 0)
    
    net_comm = float(r.get("NET COMMISSION", 0) or 0)
    bc_comm = float(r.get("BC_COMM", 0) or 0)
    corp_comm = float(r.get("CORP_COMM", 0) or 0)

    val_str = (
        f"('{aid}', '{my}', '{st}', '{zn}', '{dt}', '{md}', '{br}', '{sol}', '{vil}', '{bca}', '{dev}', "
        f"{non_funded}, {comm_non_funded}, {funded}, {comm_funded}, {total_acct}, {comm_acct}, "
        f"{fin_txn}, {txn_amt}, {comm_txn}, {rem_cnt}, {rem_amt}, {login_days}, {login_pct}, "
        f"{apy_cnt}, {apy_comm}, {sby_cnt}, {sby_comm}, {jby_cnt}, {jby_comm}, {sss_inc}, "
        f"{net_comm}, {bc_comm}, {corp_comm})"
    )
    monthly_values.append(val_str)

# Save chunked queries
import os
os.makedirs("scripts/chunks", exist_ok=True)

with open("scripts/chunks/period.sql", "w", encoding="utf-8") as f:
    f.write(period_sql)

def chunk_list(lst, size=150):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]

for idx, chunk in enumerate(chunk_list(agent_values, 150)):
    sql = "INSERT INTO sanjivani.agents (agent_id, bca_name, state_name, zone_name, dist, mandal, base_branch, sol_id, village_name, date_of_joining, location_type, company_name) VALUES\n" + ",\n".join(chunk) + "\nON CONFLICT (agent_id) DO NOTHING;"
    with open(f"scripts/chunks/agents_{idx}.sql", "w", encoding="utf-8") as f:
        f.write(sql)

for idx, chunk in enumerate(chunk_list(monthly_values, 100)):
    sql = """INSERT INTO sanjivani.monthly_records (
        agent_id, month_year, state_name, zone_name, dist, mandal, base_branch, sol_id, village_name, bca_name, device_id,
        non_funded_acct_opn, comm_non_funded_acct_opn, funded_acct_opn, comm_funded_acct_opn, total_no_of_acct_opn, comm_acct_opn,
        financial_txn, txn_amt, comm_txn, remittance_count, remittance_amt, login_days, login_percentage,
        apy_count, apy_comm, sby_count, sby_comm, jby_count, jby_comm, total_incentive_sss,
        net_commission, bc_comm, corp_comm
    ) VALUES\n""" + ",\n".join(chunk) + ";"
    with open(f"scripts/chunks/monthly_{idx}.sql", "w", encoding="utf-8") as f:
        f.write(sql)

print("Generated all chunk SQL files successfully!")
