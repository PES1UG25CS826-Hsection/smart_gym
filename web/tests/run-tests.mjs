// API test cases. Start the app first (npm run dev), then run:
//   node tests/run-tests.mjs
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PASS = 'Password@123';
const results = [];

async function call(method, path, { cookie, body } = {}) {
  const res = await fetch(BASE + path, {
    method, redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, res };
}
async function login(email, role, password = PASS) {
  const r = await call('POST', '/api/auth/login', { body: { email, password, role } });
  const c = r.res.headers.getSetCookie?.().find((x) => x.startsWith('gym_token='));
  return { ...r, cookie: c ? c.split(';')[0] : null };
}
function check(id, name, ok, detail = '') { results.push({ id, name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${name}${ok ? '' : '  -> ' + detail}`); }

const arjun = await login('arjun@mail.com', 'member');
const priya = await login('priya@mail.com', 'member');
const neha = await login('neha@mail.com', 'member');
const ravi = await login('ravi@smartgym.com', 'trainer');
const admin = await login('admin@smartgym.com', 'admin');

check('T01', 'Wrong password is rejected (401)', (await login('arjun@mail.com', 'member', 'wrong-password')).status === 401);
check('T02', 'Valid member login succeeds and sets a cookie', arjun.status === 200 && !!arjun.cookie);
check('T03', 'Correct password with the wrong role is rejected', (await login('arjun@mail.com', 'admin')).status === 401);
check('T04', 'Admin API without login returns 401', (await call('GET', '/api/admin/stats')).status === 401);
check('T05', 'Member calling an admin API returns 403', (await call('GET', '/api/admin/stats', { cookie: arjun.cookie })).status === 403);
check('T06', 'Admin can read dashboard statistics', (await call('GET', '/api/admin/stats', { cookie: admin.cookie })).status === 200);
const mem = await call('GET', '/api/admin/members', { cookie: admin.cookie });
check('T07', 'Password hashes are never returned by member lists', mem.status === 200 && !/password/i.test(mem.text));
const raviMembers = (await call('GET', '/api/trainer/members', { cookie: ravi.cookie })).json?.members ?? [];
const raviIds = new Set(raviMembers.map((m) => m.id));
const otherMember = (mem.json?.members ?? []).find((m) => !raviIds.has(m.id));
const t8 = otherMember ? await call('GET', `/api/trainer/member-analytics?memberId=${otherMember.id}`, { cookie: ravi.cookie }) : null;
check('T08', 'Trainer cannot view a member assigned to another trainer (403)', !!t8 && t8.status === 403, t8 ? t8.text : 'no member outside Ravi\'s list found');

const badWorkout = await call('POST', '/api/member/workouts', { cookie: arjun.cookie, body: { date: '2026-01-01', duration_min: 30, exercises: [{ exercise_id: 1, sets: [{ reps: 0, weight_kg: 50 }] }] } });
check('T09', 'Workout with 0 reps is rejected (400)', badWorkout.status === 400, badWorkout.text);
const goodWorkout = await call('POST', '/api/member/workouts', { cookie: arjun.cookie, body: { date: '2026-01-01', duration_min: 30, notes: 'test', exercises: [{ exercise_id: 1, sets: [{ reps: 5, weight_kg: 50 }] }] } });
check('T10', 'Valid workout is stored in MongoDB (201)', goodWorkout.status === 201, goodWorkout.text);
if (goodWorkout.json?.id) await call('DELETE', `/api/member/workouts/${goodWorkout.json.id}`, { cookie: arjun.cookie });

check('T11', 'Renewal with an invalid plan is rejected (400)', (await call('POST', '/api/member/membership/renew', { cookie: arjun.cookie, body: { plan: 'Free', method: 'UPI' } })).status === 400);

const slotA = await call('POST', '/api/member/appointments', { cookie: arjun.cookie, body: { trainer_id: 1, date: '2030-01-15', start: '10:00', end: '11:00' } });
const slotB = await call('POST', '/api/member/appointments', { cookie: priya.cookie, body: { trainer_id: 1, date: '2030-01-15', start: '10:30', end: '11:30' } });
check('T12', 'Trigger blocks an overlapping slot for the same trainer (400)', slotA.status === 201 && slotB.status === 400 && /already booked/i.test(slotB.text), `${slotA.status}/${slotB.status} ${slotB.text}`);
if (slotA.json?.appointment_id) await call('DELETE', `/api/member/appointments/${slotA.json.appointment_id}`, { cookie: arjun.cookie });

const nehaIn = await call('POST', '/api/member/checkin', { cookie: neha.cookie });
check('T13', 'Trigger blocks check-in for a member with an expired membership (400)', nehaIn.status === 400 && /active membership/i.test(nehaIn.text), nehaIn.text);

const ownMember = raviMembers[0];
const dup = ownMember ? await call('POST', '/api/trainer/plans', { cookie: ravi.cookie, body: { member_id: ownMember.id, goal: 'Test', start_date: '2030-01-01', end_date: '2030-02-01', exercises: [{ exercise_id: 1, set_count: 3, reps: 10 }, { exercise_id: 1, set_count: 3, reps: 10 }] } }) : { status: 0, text: 'Ravi has no assigned members' };
check('T14', 'Plan with a duplicate exercise fails and is rolled back (409)', dup.status === 409, dup.text);

const future = await call('POST', '/api/admin/members', { cookie: admin.cookie, body: { name: 'Test User', email: `t${Date.now()}@mail.com`, gender: 'M', dob: '2099-01-01', password: 'Test@12345' } });
check('T15', 'Date-of-birth trigger rejects a future date (400)', future.status === 400 && /past/i.test(future.text), future.text);
const dupMember = await call('POST', '/api/admin/members', { cookie: admin.cookie, body: { name: 'Dup', email: 'arjun@mail.com', gender: 'M', dob: '2000-01-01', password: 'Test@12345' } });
check('T16', 'Duplicate member email is rejected by UNIQUE (409)', dupMember.status === 409, dupMember.text);
const delMember = await call('DELETE', '/api/admin/members/1', { cookie: admin.cookie });
check('T17', 'Member with payment history cannot be deleted (409, RESTRICT)', delMember.status === 409, delMember.text);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} tests passed`);
process.exit(failed ? 1 : 0);
