import sqlite3
import json

def generate_seed_queries():
    conn = sqlite3.connect('sanjivani_bc.db')
    cursor = conn.cursor()

    # Period
    p = cursor.execute('SELECT month_year, year, month, calendar_days, uploaded_by, rows_count FROM periods').fetchone()
    period_sql = f"INSERT INTO sanjivani.periods (month_year, year, month, calendar_days, uploaded_by, rows_count) VALUES ('{p[0]}', {p[1]}, {p[2]}, {p[3]}, '{p[4]}', {p[5]}) ON CONFLICT (month_year) DO NOTHING;"

    # Agents
    agents = cursor.execute('SELECT agent_id, bca_name, bank_agent_id, date_of_joining, first_seen_period FROM agents').fetchall()
    agent_vals = []
    for a in agents:
        bca_name = (a[1] or '').replace("'", "''")
        bank_id = f"'{a[2]}'" if a[2] else 'NULL'
        doj = f"'{a[3]}'" if a[3] else 'NULL'
        fsp = f"'{a[4]}'" if a[4] else 'NULL'
        agent_vals.append(f"('{a[0]}', '{bca_name}', {bank_id}, {doj}, {fsp})")
    agent_sql = f"INSERT INTO sanjivani.agents (agent_id, bca_name, bank_agent_id, date_of_joining, first_seen_period) VALUES {','.join(agent_vals)} ON CONFLICT (agent_id) DO NOTHING;"

    # Monthly Records
    records = cursor.execute('''SELECT 
        id, agent_id, month_year, state_name, zone_name, dist, mandal, base_branch, sol_id, village_name, company_name, location_type, device_id,
        non_funded_no_of_acct_opn, comm_non_funded_acct_opn, funded_no_of_acct_opn, comm_funded_acct_opn, total_no_of_acct_opn, comm_total_acct_opn,
        financial_txn, txn_amt, txn_comm, remittance_count, remittance_rs10, login_days, login_percentage, fixed_commission,
        apy_count, apy_comm, sby_count, sby_comm, jby_count, jby_comm, incentive_10_sss, re_kyc_count, re_kyc_comm,
        net_commission, bc_comm, corp_comm, is_zero_filled
    FROM monthly_records''').fetchall()

    rec_batches = []
    current_batch = []
    for r in records:
        def esc(val):
            if val is None:
                return 'NULL'
            if isinstance(val, str):
                return f"'{val.replace('\'', '\'\'')}'"
            if isinstance(val, bool):
                return 'TRUE' if val else 'FALSE'
            return str(val)

        row_str = f"({','.join(esc(c) for c in r)})"
        current_batch.append(row_str)
        if len(current_batch) >= 150:
            rec_batches.append(current_batch)
            current_batch = []
    if current_batch:
        rec_batches.append(current_batch)

    cols = """id, agent_id, month_year, state_name, zone_name, dist, mandal, base_branch, sol_id, village_name, company_name, location_type, device_id,
        non_funded_no_of_acct_opn, comm_non_funded_acct_opn, funded_no_of_acct_opn, comm_funded_acct_opn, total_no_of_acct_opn, comm_total_acct_opn,
        financial_txn, txn_amt, txn_comm, remittance_count, remittance_rs10, login_days, login_percentage, fixed_commission,
        apy_count, apy_comm, sby_count, sby_comm, jby_count, jby_comm, incentive_10_sss, re_kyc_count, re_kyc_comm,
        net_commission, bc_comm, corp_comm, is_zero_filled"""

    rec_sqls = [f"INSERT INTO sanjivani.monthly_records ({cols}) VALUES {','.join(b)} ON CONFLICT (id) DO NOTHING;" for b in rec_batches]

    return period_sql, agent_sql, rec_sqls

if __name__ == '__main__':
    p_sql, a_sql, r_sqls = generate_seed_queries()
    with open('seed_p.sql', 'w', encoding='utf-8') as f:
        f.write(p_sql)
    with open('seed_a.sql', 'w', encoding='utf-8') as f:
        f.write(a_sql)
    for idx, r in enumerate(r_sqls):
        with open(f'seed_r_{idx}.sql', 'w', encoding='utf-8') as f:
            f.write(r)
    print(f'Done generating {len(r_sqls)} monthly record batch files!')
