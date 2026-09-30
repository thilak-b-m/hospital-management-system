import { useEffect, useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoReport, IcoEye, IcoDownload } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../utils/socket';
import { downloadReportFile, openReportFile } from '../../utils/reportFiles';
import api from '../../api/axios';

export default function PatientReports() {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const patientId = user?._id || user?.id;

  const fetchReports = async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/reports/${patientId}`);
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;
    fetchReports();
  }, [patientId]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    const handleReportUpdate = () => {
      fetchReports();
    };
    socket.on('report_update', handleReportUpdate);
    return () => {
      socket.off('report_update', handleReportUpdate);
    };
  }, [token, user?._id]);

  return (
    <PatientLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>Medical Reports</div>
          <div style={{ color:'#64748b', fontSize:13 }}>View and download your latest reports.</div>
        </div>
        <button className="btn-outline btn-sm" onClick={fetchReports}>Refresh</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding:24, color:'#64748b' }}>Loading your reports...</div>
        ) : error ? (
          <div style={{ padding:24, color:'#b91c1c' }}>{error}</div>
        ) : reports.length === 0 ? (
          <div style={{ padding:24, color:'#64748b' }}>No reports available yet.</div>
        ) : (
          <div style={{ display:'grid', gap:14 }}>
            {reports.map((report) => (
              <div key={report._id} style={{ padding:18, border:'1px solid #e2e8f0', borderRadius:14, display:'grid', gridTemplateColumns:'1fr auto', gap:14 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <div className="doc-avatar" style={{ width:40, height:40, fontSize:14 }}>{report.title?.slice(0,2).toUpperCase() || 'RP'}</div>
                    <div>
                      <div style={{ fontWeight:700 }}>{report.title || 'Report'}</div>
                      <div style={{ color:'#64748b', fontSize:13 }}>{new Date(report.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                    </div>
                  </div>
                  {report.notes && <div style={{ marginTop:8, color:'#475569' }}>{report.notes}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                  <button type="button" onClick={() => openReportFile(report._id).catch(() => setError('Unable to open this report.'))} className="btn-outline" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <IcoEye /> View
                  </button>
                  <button type="button" onClick={() => downloadReportFile(report._id).catch(() => setError('Unable to download this report.'))} className="btn-sm" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <IcoDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
