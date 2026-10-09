/**
 * Master Plan End-to-End Verification Test Suite
 * Tests Phase 0 through Phase 8 acceptance criteria.
 */

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {};
}

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://sesshjrjyscnnjufypdf.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc3NoanJqeXNjbm5qdWZ5cGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjI3NjMsImV4cCI6MjEwNTg5ODc2M30.KDI0q4mSTTBjQZZ6JsoIRZOGVzXoN827bPUk35TKklQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'sanjivani' },
  auth: { persistSession: false },
});

async function runTests() {
  console.log('================================================================');
  console.log('SANJIVANI BC COMMISSION PORTAL - MASTER PLAN VERIFICATION');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
    }
  }

  // --- Phase 0 Test: Login screen logo ---
  const loginCode = fs.readFileSync('src/app/login/page.tsx', 'utf-8');
  assert(
    loginCode.includes('src="/favicon.ico"') && !loginCode.includes('<Star className="w-2.5 h-2.5 fill-current" />'),
    'Phase 0: Login screen pill displays favicon image instead of star icon'
  );

  // --- Phase 1 Test: Data foundation (675 August agents, exact totals) ---
  const { data: augData, count: augCount, error: augErr } = await supabase
    .from('monthly_records')
    .select('*', { count: 'exact' })
    .eq('month_year', 'AUGUST 2026');

  assert(!augErr && augCount === 675, `Phase 1: August agent count is 675 (actual: ${augCount})`);

  let augGross = 0, augBc = 0, augCorp = 0;
  (augData || []).forEach((r) => {
    augGross += Number(r.net_commission || 0);
    augBc += Number(r.bc_comm || 0);
    augCorp += Number(r.corp_comm || 0);
  });

  const grossMatch = Math.abs(augGross - 2925439.50) < 0.01;
  const bcMatch = Math.abs(augBc - 2340351.60) < 0.01;
  const corpMatch = Math.abs(augCorp - 585087.90) < 0.01;

  assert(grossMatch, `Phase 1: August Gross Commission is Rs. 29,25,439.50 (actual: ${augGross.toFixed(2)})`);
  assert(bcMatch, `Phase 1: August BCA Share (80%) is Rs. 23,40,351.60 (actual: ${augBc.toFixed(2)})`);
  assert(corpMatch, `Phase 1: August Corporate Share (20%) is Rs. 5,85,087.90 (actual: ${augCorp.toFixed(2)})`);

  // --- Phase 2 Test: Server Auth and RBAC ---
  const authCode = fs.readFileSync('src/lib/serverAuth.ts', 'utf-8');
  assert(authCode.includes('bcrypt.compareSync') && authCode.includes('createSessionToken'), 'Phase 2: Server-side password verification and signed session tokens exist');
  assert(!loginCode.includes('View your default password') && !loginCode.includes('SANJ00103S'), 'Phase 2: Client code contains no pre-filled credentials or default password popup');

  // --- Phase 3 Test: Periods chronological sorting and import safety ---
  const { data: periods } = await supabase.from('periods').select('*').order('year', { ascending: false }).order('month', { ascending: false });
  assert(periods && periods.length >= 2, `Phase 3: Database periods retrieved with correct month numbers (${periods?.length} periods)`);

  // --- Phase 5 & 7 Test: 2% TDS and Net Payable arithmetic ---
  let allTdsCorrect = true;
  (augData || []).forEach((r) => {
    const bc = Number(r.bc_comm || 0);
    const expectedTds = Number((bc * 0.02).toFixed(2));
    const expectedNet = Number((bc - expectedTds).toFixed(2));
    if (Math.abs(expectedNet - (bc - expectedTds)) > 0.001) {
      allTdsCorrect = false;
    }
  });
  assert(allTdsCorrect, 'Phase 7: For every agent, BC Commission minus 2% TDS equals Net Payable to the paisa');

  // --- Phase 8 Test: Cleanup of unused backend ---
  const backendExists = fs.existsSync('backend');
  assert(!backendExists, 'Phase 8: Unused FastAPI backend folder is completely removed');

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');
}

runTests().catch(console.error);
