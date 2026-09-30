import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoUsers, IcoCalendar, IcoReport, IcoDownload } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/reports')
      .then(({ data }) => setReport(data))
      .catch(() => setError('Unable to load report analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label:'Total Patients', value:report?.kpis.totalPatients || 0, Icon:IcoUsers, color:'#dbeafe', ic:'#1d4ed8' },
    { label:'Total Appointments', value:report?.kpis.totalAppointments || 0, Icon:IcoCalendar, color:'#dcfce7', ic:'#15803d' },
    { label:'Completed Revenue', value:`₹${(report?.kpis.totalRevenue || 0).toLocaleString('en-IN')}`, Icon:IcoReport, color:'#fef9c3', ic:'#92400e' },
    { label:'Active Services', value:report?.kpis.activeServices || 0, Icon:IcoReport, color:'#ede9fe', ic:'#7c3aed' },
  ];
  const monthlyAppointments = report?.monthlyAppointments || [];
  const monthlyPatients = report?.monthlyPatients || [];
  const departments = report?.departmentPerformance || [];
  const downloadReport = () => {
    const rows = [['Department', 'Patients', 'Appointments', 'Completed', 'Revenue'], ...departments.map((item) => [item._id, item.patients, item.appointments, item.completed, item.revenue])];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'citycare-department-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const maxAppointments = Math.max(1, ...monthlyAppointments.map(item => item.count));
  const maxPatients = Math.max(1, ...monthlyPatients.map(item => item.count));

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div className="page-header-title">Reports &amp; Analytics</div>
          <div className="page-header-sub">Live totals and activity from recorded hospital data.</div>
        </div>
        {report?.range && <div style={{ fontSize:13, color:'#64748b' }}>Last 12 months</div>}
      </div>

      {error && <div role="alert" className="notification-error">{error}</div>}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {kpis.map(({ label, value, Icon, color, ic }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:ic }}><Icon /></div>
            <div>
              <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
              <div className="stat-number" style={{ fontSize:22, color:ic }}>{loading ? '...' : value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:12 }}>Appointments Overview</div>
          {monthlyAppointments.length ? <div className="analytics-bars">
            {monthlyAppointments.map(item => <div key={item._id} className="analytics-bar-row"><time>{item._id}</time><span className="analytics-bar-track"><span style={{ width:`${Math.max(2, item.count / maxAppointments * 100)}%` }}/></span><strong>{item.count}</strong></div>)}
          </div> : <div className="notification-empty">{loading ? 'Loading...' : 'No appointments recorded in this period.'}</div>}
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:12 }}>Patient Growth</div>
          {monthlyPatients.length ? <div className="analytics-bars">
            {monthlyPatients.map(item => <div key={item._id} className="analytics-bar-row"><time>{item._id}</time><span className="analytics-bar-track patients"><span style={{ width:`${Math.max(2, item.count / maxPatients * 100)}%` }}/></span><strong>{item.count}</strong></div>)}
          </div> : <div className="notification-empty">{loading ? 'Loading...' : 'No patient registrations in this period.'}</div>}
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontWeight:600 }}>Department Performance</div>
          <button className="btn-outline btn-sm" onClick={downloadReport} disabled={!departments.length} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <IcoDownload /> Download Report
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Department</th><th>Patients</th><th>Appointments</th><th>Completed</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            {departments.map(department=>(
              <tr key={department._id}>
                <td style={{ fontWeight:500 }}>{department._id}</td>
                <td>{department.patients}</td>
                <td>{department.appointments}</td>
                <td>{department.completed}</td>
                <td style={{ fontWeight:600 }}>₹{department.revenue.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {!loading && departments.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No department activity recorded in this period.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
