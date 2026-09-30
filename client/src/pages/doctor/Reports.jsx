import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../utils/socket';
import { downloadReportFile, openReportFile } from '../../utils/reportFiles';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoEye, IcoDownload, IcoRefresh } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function Reports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTitle, setFilterTitle] = useState('All Reports');
  const [filterPatient, setFilterPatient] = useState('All Patients');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/doctor');
      setReports(data.reports || []);
      if (data.reports?.length) setSelectedReport(data.reports[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    const handleUpdate = () => {
      fetchReports();
    };
    socket.on('report_update', handleUpdate);
    return () => {
      socket.off('report_update', handleUpdate);
    };
  }, [token]);

  const reportTitles = useMemo(() => {
    const titles = new Set(reports.map(r => r.title || 'Report'));
    return ['All Reports', ...titles];
  }, [reports]);

  const patientNames = useMemo(() => {
    const names = new Set(reports.map(r => r.patient?.name || 'Unknown'));
    return ['All Patients', ...names];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterTitle !== 'All Reports' && (r.title || 'Report') !== filterTitle) return false;
      if (filterPatient !== 'All Patients' && (r.patient?.name || 'Unknown') !== filterPatient) return false;
      if (search && !((r.patient?.name || '').toLowerCase().includes(search.toLowerCase()) || (r.title || '').toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [reports, filterTitle, filterPatient, search]);

  return (
    <DoctorLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ color:'#64748b', fontSize:13 }}>View and manage patient reports</div>
        </div>
        <button className="btn-outline btn-sm" onClick={fetchReports}>
          <IcoRefresh /> Refresh
        </button>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
          <select className="form-select" style={{ width:'auto', height:38 }} value={filterTitle} onChange={e => setFilterTitle(e.target.value)}>
            {reportTitles.map(title => <option key={title}>{title}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={filterPatient} onChange={e => setFilterPatient(e.target.value)}>
            {patientNames.map(name => <option key={name}>{name}</option>)}
          </select>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding:'8px 10px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', height:38, minWidth:180 }}
            placeholder="Search reports" />
        </div>

        {loading ? (
          <div style={{ padding:24, color:'#64748b' }}>Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding:24, color:'#64748b' }}>No reports found.</div>
        ) : (
          <div style={{ display:'grid', gap:14 }}>
            {filteredReports.map((report) => (
              <div key={report._id} className="report-card" style={{ padding:18, border:'1px solid #e2e8f0', borderRadius:14, display:'grid', gridTemplateColumns:'1fr auto', gap:14 }}>
                <div>
                  <div style={{ fontWeight:700, marginBottom:6 }}>{report.title || 'Report'}</div>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', color:'#64748b', fontSize:13 }}>
                    <span>{report.patient?.name || 'Patient'}</span>
                    <span>{report.patient?.patientId || ''}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                  {report.notes && <div style={{ marginTop:10, color:'#475569' }}>{report.notes}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                  <button type="button" onClick={() => openReportFile(report._id).catch(() => alert('Unable to open this report.'))} className="btn-outline" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <IcoEye /> View
                  </button>
                  <button type="button" onClick={() => downloadReportFile(report._id).catch(() => alert('Unable to download this report.'))} className="btn-sm" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <IcoDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
