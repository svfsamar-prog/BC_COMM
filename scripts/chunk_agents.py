import sqlite3

conn = sqlite3.connect('sanjivani_bc.db')
cursor = conn.cursor()

agents = cursor.execute('SELECT agent_id, bca_name, bank_agent_id, date_of_joining, first_seen_period FROM agents').fetchall()

# Split into 3 chunks of 225
chunks = [agents[i:i + 225] for i in range(0, len(agents), 225)]
for idx, chunk in enumerate(chunks):
    agent_vals = []
    for a in chunk:
        bca_name = (a[1] or '').replace("'", "''")
        bank_id = f"'{a[2]}'" if a[2] else 'NULL'
        doj = f"'{a[3]}'" if a[3] else 'NULL'
        fsp = f"'{a[4]}'" if a[4] else 'NULL'
        agent_vals.append(f"('{a[0]}', '{bca_name}', {bank_id}, {doj}, {fsp})")
    
    sql = f"INSERT INTO sanjivani.agents (agent_id, bca_name, bank_agent_id, date_of_joining, first_seen_period) VALUES {','.join(agent_vals)} ON CONFLICT (agent_id) DO NOTHING;"
    with open(f'seed_agents_part_{idx}.sql', 'w', encoding='utf-8') as f:
        f.write(sql)

print('Generated 3 agent chunk files')
