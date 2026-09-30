import api from '../api/axios';

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const wrap = (title, body) => `
  <html>
  <head>
    <title>${title}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body{font-family: Arial, Helvetica, sans-serif; color:#111; padding:20px}
      h1,h2,h3{margin:0 0 8px}
      .section{margin-bottom:18px}
      .row{display:flex;gap:12px}
      table{width:100%;border-collapse:collapse}
      th,td{padding:8px;border:1px solid #ddd;text-align:left}
    </style>
  </head>
  <body>
    ${body}
    <script>window.print();</script>
  </body>
  </html>
`;

export async function printPatientSummary(patientId) {
  try {
    const [hRes, rxRes, rRes] = await Promise.all([
      api.get(`/medical-history/${patientId}`),
      api.get(`/prescriptions?patientId=${patientId}`),
      api.get(`/reports/${patientId}`),
    ]);

    const history = hRes.data.history || { entries: [] };
    const prescriptions = rxRes.data.prescriptions || [];
    const reports = rRes.data.reports || [];

    const consultationSummaries = (history.entries || [])
      .filter((e) => e.type === 'Consultation' || /consultation summary/i.test(e.title || ''))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestConsultationSummary = consultationSummaries[0];

    const body = `
      <h1>Patient Summary</h1>
      ${latestConsultationSummary ? `
      <div class="section">
        <h2>Latest Consultation Summary</h2>
        <div style="padding:16px;border:1px solid #ddd;border-radius:10px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(latestConsultationSummary.notes || '').replace(/\r?\n/g,'<br/>')}</div>
        <div style="margin-top:10px;color:#555;font-size:12px;">Saved on ${new Date(latestConsultationSummary.date).toLocaleString()}</div>
      </div>
      ` : ''}
      <div class="section">
        <h2>Medical History</h2>
        ${history.entries.length === 0 ? '<div>No history</div>' : `
          <table>
            <thead><tr><th>Date</th><th>Title</th><th>Notes</th></tr></thead>
            <tbody>
              ${history.entries.map(e => `<tr><td>${new Date(e.date).toLocaleString()}</td><td>${escapeHtml(e.title)}</td><td>${escapeHtml(e.notes || '').replace(/\r?\n/g,'<br/>')}</td></tr>`).join('')}
            </tbody>
          </table>`}
      </div>
      <div class="section">
        <h2>Prescriptions</h2>
        ${prescriptions.length === 0 ? '<div>No prescriptions</div>' : `
          <table>
            <thead><tr><th>Date</th><th>Diagnosis</th><th>Medications</th></tr></thead>
            <tbody>
              ${prescriptions.map(p => `<tr><td>${new Date(p.createdAt).toLocaleString()}</td><td>${escapeHtml(p.diagnosis)}</td><td>${(p.medications||[]).map(m=>`${escapeHtml(m.medicine)} (${escapeHtml(m.dosage)})`).join('<br/>')}</td></tr>`).join('')}
            </tbody>
          </table>`}
      </div>
      <div class="section">
        <h2>Reports</h2>
        ${reports.length === 0 ? '<div>No reports</div>' : `
          <table>
            <thead><tr><th>Date</th><th>Title</th><th>File</th></tr></thead>
            <tbody>
              ${reports.map(r=>`<tr><td>${new Date(r.createdAt).toLocaleString()}</td><td>${escapeHtml(r.title || 'Report')}</td><td>Open in the authenticated Reports page</td></tr>`).join('')}
            </tbody>
          </table>`}
    `;

    const win = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
    win.document.write(wrap('Patient Summary', body));
    win.document.close();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Failed to prepare print');
  }
}
