import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/admin/settings/runtime')
      .then(({ data }) => setSettings(data))
      .catch(() => setError('Unable to load runtime status.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    api.get('/admin/settings/runtime').then(({ data }) => {
      if (active) setSettings(data);
    }).catch(() => {
      if (active) setError('Unable to load runtime status.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">System Status</div>
          <div className="page-header-sub">Live application and database runtime information.</div>
        </div>
        <button className="btn-outline btn-sm" onClick={load} disabled={loading}>Refresh</button>
      </div>

      {error && <div role="alert" className="notification-error">{error}</div>}
      {loading ? (
        <div className="card" style={{ color:'#64748b' }}>Loading system status...</div>
      ) : settings ? (
        <div className="grid-2">
          <section className="card">
            <h2 className="section-title">Application</h2>
            <dl className="runtime-list">
              <div><dt>Name</dt><dd>{settings.appName}</dd></div>
              <div><dt>Environment</dt><dd>{settings.environment}</dd></div>
              <div><dt>API port</dt><dd>{settings.port}</dd></div>
              <div><dt>Server time</dt><dd>{new Date(settings.serverTime).toLocaleString()}</dd></div>
            </dl>
          </section>
          <section className="card">
            <h2 className="section-title">Database</h2>
            <dl className="runtime-list">
              <div><dt>Connection</dt><dd><span className={`badge ${settings.databaseReady ? 'badge-active' : 'badge-inactive'}`}>{settings.databaseStatus}</span></dd></div>
              <div><dt>Readiness</dt><dd>{settings.databaseReady ? 'Ready' : 'Unavailable'}</dd></div>
            </dl>
          </section>
        </div>
      ) : (
        <div className="card" style={{ color:'#64748b' }}>Runtime status is unavailable.</div>
      )}
    </AdminLayout>
  );
}
