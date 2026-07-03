import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoSearch, IcoEye, IcoEdit, IcoTrash, IcoChevronLeft, IcoChevronRight } from '../../components/ui/Icons';

const ALL_USERS = [
  { name:'Dr. Arjun Patel',  role:'Doctor',  email:'arjunpatel@citycare.com', phone:'9876543210', status:'Active',   initials:'AP' },
  { name:'Dr. Neha Verma',   role:'Doctor',  email:'nehaverma@citycare.com',  phone:'9876543211', status:'Active',   initials:'NV' },
  { name:'Ramesh Sharma',    role:'Patient', email:'ramesh@gmail.com',         phone:'9876543212', status:'Active',   initials:'RS' },
  { name:'Priya Mehta',      role:'Patient', email:'priyamehta@gmail.com',     phone:'9876543213', status:'Active',   initials:'PM' },
  { name:'Amit Verma',       role:'Patient', email:'amitverma@gmail.com',      phone:'9876543214', status:'Active',   initials:'AV' },
  { name:'Anjali Singh',     role:'Staff',   email:'anjali@citycare.com',      phone:'9876543215', status:'Active',   initials:'AS' },
  { name:'Rohit Kumar',      role:'Staff',   email:'rohit@citycare.com',       phone:'9876543216', status:'Inactive', initials:'RK' },
];

const ROLE_COLORS = { Doctor:'#dbeafe:#1d4ed8', Patient:'#dcfce7:#15803d', Staff:'#ede9fe:#7c3aed', Admin:'#fef9c3:#92400e' };

export default function AdminUsers() {
  const [tab, setTab]           = useState('All Users');
  const [search, setSearch]     = useState('');
  const [roleF, setRoleF]       = useState('All Roles');
  const [statusF, setStatusF]   = useState('All Status');
  const [users, setUsers]       = useState(ALL_USERS);

  const filtered = users.filter(u => {
    const matchTab   = tab==='All Users' || u.role===tab.slice(0,-1) || (tab==='Staff' && u.role==='Staff');
    const matchSrch  = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole  = roleF==='All Roles' || u.role===roleF;
    const matchSt    = statusF==='All Status' || u.status===statusF;
    return matchTab && matchSrch && matchRole && matchSt;
  });

  const remove = (idx) => setUsers(u => u.filter((_,i) => i!==idx));

  const badgeStyle = (role) => {
    const [bg,clr] = (ROLE_COLORS[role]||'#f1f5f9:#64748b').split(':');
    return { background:bg, color:clr, borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:500 };
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Users</div>
          <div className="page-header-sub">Manage all users in the system.</div>
        </div>
        <button className="btn-primary"><IcoPlus size={14}/> Add User</button>
      </div>

      <div className="card">
        {/* Sub-tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:18, borderBottom:'1px solid #e2e8f0', paddingBottom:0 }}>
          {['All Users','Doctors','Patients','Staff'].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:'8px 18px', border:'none', background:'none', cursor:'pointer', fontSize:14, fontWeight:500,
                color: tab===t ? 'var(--primary)' : '#64748b',
                borderBottom: tab===t ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom:'-1px' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}><IcoSearch size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search users..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }} value={roleF} onChange={e=>setRoleF(e.target.value)}>
            <option>All Roles</option><option>Doctor</option><option>Patient</option><option>Staff</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option>All Status</option><option>Active</option><option>Inactive</option>
          </select>
          <button className="btn-primary btn-sm"><IcoPlus size={13}/> Add User</button>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((u,i)=>(
                <tr key={i}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="doc-avatar" style={{ width:34, height:34, fontSize:12 }}>{u.initials}</div>
                      <span style={{ fontWeight:500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td><span style={badgeStyle(u.role)}>{u.role}</span></td>
                  <td style={{ color:'#64748b', fontSize:13 }}>{u.email}</td>
                  <td style={{ fontSize:13 }}>{u.phone}</td>
                  <td>
                    <span className={`badge ${u.status==='Active'?'badge-active':'badge-inactive'}`}>{u.status}</span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={{ background:'#dbeafe', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#1d4ed8' }}><IcoEye /></button>
                      <button style={{ background:'#fef9c3', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#92400e' }}><IcoEdit /></button>
                      <button style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }} onClick={()=>remove(users.indexOf(u))}><IcoTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid #f1f5f9' }}>
          <span style={{ fontSize:13, color:'#64748b' }}>Showing 1 to {filtered.length} of {ALL_USERS.length} users</span>
          <div style={{ display:'flex', gap:4 }}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} style={{ width:30, height:30, borderRadius:6, border:'1px solid #e2e8f0', background: n===1?'var(--primary)':'white', color: n===1?'white':'#64748b', cursor:'pointer', fontSize:13 }}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
