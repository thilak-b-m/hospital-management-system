import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoSearch, IcoTrash } from '../../components/ui/Icons';
import api from '../../api/axios';

const ROLE_COLORS = {
  doctor:  { bg:'#dbeafe', color:'#1d4ed8' },
  patient: { bg:'#dcfce7', color:'#15803d' },
  admin:   { bg:'#fef9c3', color:'#92400e' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(res => setUsers(res.data.users || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = users.filter(u => {
    const matchTab = tab === 'all' || u.role === tab;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    all: users.length,
    doctor: users.filter(u => u.role === 'doctor').length,
    patient: users.filter(u => u.role === 'patient').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Users</div>
          <div className="page-header-sub">Manage all users in the system.</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:4, marginBottom:18, borderBottom:'1px solid #e2e8f0' }}>
          {[['all','All Users'],['doctor','Doctors'],['patient','Patients'],['admin','Admins']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding:'8px 18px', border:'none', background:'none', cursor:'pointer', fontSize:14, fontWeight:500,
                color: tab===key ? 'var(--primary)' : '#64748b',
                borderBottom: tab===key ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom:'-1px' }}>
              {label} <span style={{ fontSize:12, color:'#94a3b8', marginLeft:4 }}>({counts[key]})</span>
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
              <IcoSearch size={14}/>
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading users...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const initials = u.name?.split(' ').slice(0,2).map(w => w[0]).join('') || 'U';
                  const rc = ROLE_COLORS[u.role] || { bg:'#f1f5f9', color:'#64748b' };
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="doc-avatar" style={{ width:34, height:34, fontSize:12 }}>{initials}</div>
                          <span style={{ fontWeight:500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background:rc.bg, color:rc.color, borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:500, textTransform:'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color:'#64748b', fontSize:13 }}>{u.email}</td>
                      <td style={{ fontSize:13 }}>{u.phone}</td>
                      <td><span className={`badge ${u.status==='Active' ? 'badge-active' : 'badge-inactive'}`}>{u.status}</span></td>
                      <td>
                        <button onClick={() => deleteUser(u._id)}
                          style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}>
                          <IcoTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop:12, fontSize:13, color:'#64748b' }}>Showing {filtered.length} of {users.length} users</div>
      </div>
    </AdminLayout>
  );
}
