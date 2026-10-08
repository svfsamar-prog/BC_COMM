import openpyxl
import json

wb = openpyxl.load_workbook(r'c:\Users\Samar Raj\Desktop\bc comm\SANJIVANI COMMISSION AUGUST 2026.xlsx', data_only=True)
sheet = wb.active

records = []
total_days = 31

for r, row in enumerate(sheet.iter_rows(values_only=True)):
    if r == 0:
        continue
    if not row or not row[0]:
        continue
    
    def num(val):
        if val is None or val == '':
            return 0
        try:
            return float(str(val).replace(',', '').strip())
        except:
            return 0
            
    def s(val):
        if val is None:
            return ''
        return str(val).strip()

    login_days = num(row[26])
    login_pct = round((login_days / total_days) * 100, 2)

    rec = {
        'id': f"{s(row[7]) or r}_AUG_2026",
        'stateName': s(row[0]),
        'zoneName': s(row[1]),
        'dist': s(row[2]),
        'mandal': s(row[3]),
        'baseBranch': s(row[4]),
        'solId': s(row[5]),
        'villageName': s(row[6]),
        'agentId': s(row[7]),
        'bcaName': s(row[8]),
        'agentIdBank': s(row[9]),
        'settAccNo': s(row[10]),
        'dateOfJoining': s(row[11]),
        'deviceId': s(row[12]),
        'companyName': s(row[13]) or 'SANJIVANI',
        'locationType': s(row[14]) or 'RURAL',
        'nonFundedNoOfAcctOpn': num(row[15]),
        'commNonFundedAcctOpn': num(row[16]),
        'fundedNoOfAcctOpn': num(row[17]),
        'commFundedAcctOpn': num(row[18]),
        'totalNoOfAcctOpn': num(row[19]),
        'commTotalAcctOpn': num(row[20]),
        'financialTxn': num(row[21]),
        'txnAmt': num(row[22]),
        'txnComm': num(row[23]),
        'remittanceCount': num(row[24]),
        'remittanceRs10': num(row[25]),
        'loginDays': login_days,
        'loginPercentage': login_pct,
        'fixedCommission': num(row[27]),
        'apyCount': num(row[28]),
        'apyComm': num(row[29]),
        'sbyCount': num(row[30]),
        'sbyComm': num(row[31]),
        'jbyCount': num(row[32]),
        'jbyComm': num(row[33]),
        'incentive10Sss': num(row[34]),
        'reKycCount': num(row[35]),
        'reKycComm': num(row[36]),
        'netCommission': num(row[37]),
        'bcComm': num(row[38]),
        'corpComm': num(row[39]),
        'statementMonth': 'AUGUST 2026',
        'totalDaysInMonth': total_days
    }
    records.append(rec)

print(f"Total records parsed: {len(records)}")

with open(r'c:\Users\Samar Raj\Desktop\bc comm\src\lib\preloadedData.ts', 'w', encoding='utf-8') as f:
    f.write('import { CommissionRecord } from "@/types/commission";\n\n')
    f.write('export const INITIAL_COMMISSION_RECORDS: CommissionRecord[] = ')
    f.write(json.dumps(records, indent=2))
    f.write(';\n')
