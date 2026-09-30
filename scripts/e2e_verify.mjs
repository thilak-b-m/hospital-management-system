import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = process.env.API_BASE || 'http://localhost:5000';

const doctorCreds = { email: 'doctor@citycare.com', password: 'Doctor@1234' };

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
};

const main = async () => {
  console.log('Starting E2E verification against', BASE);
  // login doctor
  let r = await fetchJson(`${BASE}/api/auth/login`, { method: 'POST', body: JSON.stringify(doctorCreds) });
  if (!r.ok) { console.error('Login failed', r.status, r.data); process.exit(1); }
  const token = r.data.token;
  console.log('Logged in as doctor, token length', token?.length || 0);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // get doctor patients
  r = await fetchJson(`${BASE}/api/doctor/patients`, { method: 'GET', headers: authHeaders });
  if (!r.ok) { console.error('Failed fetching doctor patients', r.status, r.data); process.exit(1); }
  const patients = r.data.patients || [];
  if (patients.length === 0) { console.error('No patients found for doctor'); process.exit(1); }
  const patient = patients[0];
  console.log('Using patient', patient.name, patient._id);

  // create appointment
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = tomorrow.toISOString().split('T')[0];
  const appointmentTime = '10:00';
  r = await fetchJson(`${BASE}/api/appointments`, { method: 'POST', headers: { ...authHeaders }, body: JSON.stringify({ appointmentDate, appointmentTime, patientId: patient._id }) });
  if (!r.ok) { console.error('Create appointment failed', r.status, r.data); process.exit(1); }
  const appointment = r.data.appointment;
  console.log('Created appointment', appointment._id);

  // add consultation entry
  const entryPayload = { title: 'E2E Consultation', type: 'Consultation', notes: 'Automated test entry', medications: ['TestMed'], appointmentId: appointment._id, vitals: { bloodPressure: '120/80', heartRate: '75', temperature: '98.6', respiratoryRate: '16' } };
  r = await fetchJson(`${BASE}/api/medical-history/${patient._id}/entries`, { method: 'POST', headers: { ...authHeaders }, body: JSON.stringify(entryPayload) });
  if (!r.ok) { console.error('Add history entry failed', r.status, r.data); process.exit(1); }
  console.log('Added history entry');

  // update health summary
  const summary = { bloodGroup: 'O+', height: '172 cm', weight: '70 kg', allergies: 'None', chronicConditions: 'None' };
  r = await fetchJson(`${BASE}/api/medical-history/${patient._id}/health-summary`, { method: 'PUT', headers: { ...authHeaders }, body: JSON.stringify(summary) });
  if (!r.ok) { console.error('Update health summary failed', r.status, r.data); process.exit(1); }
  console.log('Updated health summary');

  // Skipping report upload in automated script (multipart handling varies).
  console.log('Skipping report upload (manual test recommended)');

  // mark appointment completed
  r = await fetchJson(`${BASE}/api/appointments/${appointment._id}/status`, { method: 'PATCH', headers: { ...authHeaders }, body: JSON.stringify({ status: 'Completed' }) });
  if (!r.ok) { console.error('Mark complete failed', r.status, r.data); process.exit(1); }
  console.log('Marked appointment completed');

  // fetch final medical history
  r = await fetchJson(`${BASE}/api/medical-history/${patient._id}`, { method: 'GET', headers: { ...authHeaders } });
  if (!r.ok) { console.error('Fetch history failed', r.status, r.data); process.exit(1); }
  console.log('Medical history entries:', (r.data.history?.entries || []).length);

  console.log('E2E verification completed successfully');
};

main().catch(err => { console.error('E2E script error', err); process.exit(1); });
