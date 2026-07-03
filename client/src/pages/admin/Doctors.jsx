import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoSearch, IcoEye, IcoEdit, IcoTrash, IcoChevronLeft, IcoChevronRight } from '../../components/ui/Icons';

const DOCTORS = [
  { name:'Dr. Arjun Patel',  dept:'Cardiology',  exp:'10 Years', email:'arjunpatel@citycare.com',  status:'Active',   initials:'AP' },
  { name:'Dr. Neha Verma',   dept:'Dermatology', exp:'8 Years',  email:'nehaverma@citycare.com',   status:'Active',   initials:'NV' },
  { name:'Dr. Rohit Kumar',  dept:'Orthopedics', exp:'12 Years', email:'rohitkumar@citycare.com',  status:'Active',   initials:'RK' },
  { name:'Dr. Anjali Singh', dept:'Neurology',   exp:'6 Years',  email:'anjalisingh@citycare.com', status:'Active',   initials:'AS' },
  { name:'Dr. Vivek Mishra', dept:'Pediatrics',  exp:'7 Years',  email:'vivekmishra@citycare.com', status:'Inactive', initials:'VM' },
  { name:'Dr. Pooja Shah',   dept:'Gynecology',  exp:'11 Years', email:'poojashah@citycare.com',   status:'Active',   initials:'PS' },
];

export default function AdminDoctors() {
  const [search, setSearch]   = useState('');
  const [deptF, setDeptF]     = useState('All Departments');
  const [statusF, setStatusF] = useState('All Status');
  const [list, setList]       = useState(DOCTORS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState({ name:'', dept:'Cardiology', exp:'', email:'', status:'Active' });

  const filtered = list.filter(d => {
    const s = d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase());
    const dept = deptF==='All Departments' || d.dept===deptF;
    const st   = statusF==='All Status'    || d.status===statusF;
    return s && dept && st;
  });

  const addDoctor = (e) => {
    e.preventDefault();
    const initials = form.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    setList(l => [...l, { ...form, initials }]);
    setShowModal(false);
    setForm({ name:'', dept:'Cardiology', exp:'', email:'', status:'Active' });
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Doctors</div>
          <div className="page-header-sub">Manage doctors and their information.</div>
        </div>
        <button className="btn-primary" onClick={()=>setShowModal(true)}><IcoPlus size={14}/> Add Doctor</button>
      </div>

      <div className="card">
        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}><IcoSearch size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search doctors..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }} value={deptF} onChange={e=>setDeptF(e.target.value)}>
            <option>All Departments</option>
            {[...new Set(DOCTORS.map(d=>d.dept))].map(d=><option key={d}>{d}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option>All Status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Doctor</th><th>Department</th><th>Experience</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((d,i)=>(
                <tr key={i}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="doc-avatar" style={{ background:'#ede9fe', color:'#7c3aed' }}>{d.initials}</div>
                      <span style={{ fontWeight:500 }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:13 }}>{d.dept}</td>
                  <td style={{ fontSize:13, color:'#64748b' }}>{d.exp}</td>
                  <td style={{ fontSize:13, color:'#64748b' }}>{d.email}</td>
                  <td><span className={`badge ${d.status==='Active'?'badge-active':'badge-inactive'}`}>{d.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={{ background:'#dbeafe', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#1d4ed8' }}><IcoEye /></button>
                      <button style={{ background:'#fef9c3', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#92400e' }}><IcoEdit /></button>
                      <button style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}
                        onClick={()=>setList(l=>l.filter((_,j)=>j!==list.indexOf(d)))}><IcoTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid #f1f5f9' }}>
          <span style={{ fontSize:13, color:'#64748b' }}>Showing 1 to {filtered.length} of {list.length} doctors</span>
          <div style={{ display:'flex', gap:4 }}>
            {[1,2,3,4].map(n=>(
              <button key={n} style={{ width:30, height:30, borderRadius:6, border:'1px solid #e2e8f0', background: n===1?'var(--primary)':'white', color: n===1?'white':'#64748b', cursor:'pointer', fontSize:13 }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:460, maxWidth:'90vw' }}>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>Add New Doctor</div>
            <form onSubmit={addDoctor} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Dr. First Last" required/>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={form.dept} onChange={e=>setForm(p=>({...p,dept:e.target.value}))}>
                    {['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Gynecology'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input className="form-input" value={form.exp} onChange={e=>setForm(p=>({...p,exp:e.target.value}))} placeholder="e.g. 5 Years" required/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="doctor@citycare.com" required/>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Add Doctor</button>
                <button type="button" className="btn-outline" style={{ flex:1 }} onClick={()=>setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
