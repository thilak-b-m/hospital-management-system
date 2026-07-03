import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoSearch, IcoEye, IcoEdit, IcoTrash } from '../../components/ui/Icons';

const PATIENTS = [
  { name:'Ramesh Sharma', pid:'PT001', age:58, gender:'Male',   phone:'9876543210', lastVisit:'May 22, 2025', status:'Active',   initials:'RS' },
  { name:'Priya Mehta',   pid:'PT002', age:32, gender:'Female', phone:'8123456780', lastVisit:'May 22, 2025', status:'Active',   initials:'PM' },
  { name:'Amit Verma',    pid:'PT003', age:45, gender:'Male',   phone:'8887765855', lastVisit:'May 21, 2025', status:'Active',   initials:'AV' },
  { name:'Sneha Iyer',    pid:'PT004', age:29, gender:'Female', phone:'8031122344', lastVisit:'May 20, 2025', status:'Active',   initials:'SI' },
  { name:'Vikram Singh',  pid:'PT005', age:60, gender:'Male',   phone:'9876071333', lastVisit:'May 18, 2025', status:'Inactive', initials:'VS' },
  { name:'Neha Kapoor',   pid:'PT006', age:38, gender:'Female', phone:'8888000988', lastVisit:'May 17, 2025', status:'Active',   initials:'NK' },
  { name:'Rajesh Kumar',  pid:'PT007', age:55, gender:'Male',   phone:'9009886776', lastVisit:'May 16, 2025', status:'Active',   initials:'RK' },
  { name:'Anita Desai',   pid:'PT008', age:42, gender:'Female', phone:'8123450000', lastVisit:'May 15, 2025', status:'Active',   initials:'AD' },
];

export default function AdminPatients() {
  const [search, setSearch]   = useState('');
  const [genderF, setGenderF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [list, setList]       = useState(PATIENTS);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ name:'', age:'', gender:'Male', phone:'', pid:'' });

  const filtered = list.filter(p => {
    const s  = p.name.toLowerCase().includes(search.toLowerCase()) || p.pid.includes(search);
    const g  = genderF==='All' || p.gender===genderF;
    const st = statusF==='All' || p.status===statusF;
    return s && g && st;
  });

  const add = (e) => {
    e.preventDefault();
    const initials = form.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    setList(l=>[...l,{...form,age:Number(form.age),initials,lastVisit:'Today',status:'Active'}]);
    setModal(false); setForm({name:'',age:'',gender:'Male',phone:'',pid:''});
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Patients</div>
          <div className="page-header-sub">Manage and view all patients.</div>
        </div>
        <button className="btn-primary" onClick={()=>setModal(true)}><IcoPlus size={14}/> Add New Patient</button>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}><IcoSearch size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, phone or ID..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }} value={genderF} onChange={e=>setGenderF(e.target.value)}>
            <option value="All">All Gender</option><option>Male</option><option>Female</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="All">All Status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>ID</th><th>Age</th><th>Gender</th><th>Phone</th><th>Last Visit</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((p,i)=>(
                <tr key={i}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="doc-avatar">{p.initials}</div>
                      <span style={{ fontWeight:500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'#64748b', fontSize:12 }}>{p.pid}</td>
                  <td>{p.age}</td>
                  <td style={{ color:'#64748b' }}>{p.gender}</td>
                  <td style={{ fontSize:13 }}>{p.phone}</td>
                  <td style={{ color:'#64748b', fontSize:13 }}>{p.lastVisit}</td>
                  <td><span className={`badge ${p.status==='Active'?'badge-active':'badge-inactive'}`}>{p.status}</span></td>
                  <td>
                    <button className="btn-outline btn-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid #f1f5f9' }}>
          <span style={{ fontSize:13, color:'#64748b' }}>Showing 1 to {filtered.length} of {list.length} patients</span>
          <div style={{ display:'flex', gap:4 }}>
            {[1,2,3,'...',16].map((n,i)=>(
              <button key={i} style={{ minWidth:30, height:30, borderRadius:6, border:'1px solid #e2e8f0', background: n===1?'var(--primary)':'white', color: n===1?'white':'#64748b', cursor:'pointer', fontSize:13 }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:440, maxWidth:'90vw' }}>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>Add New Patient</div>
            <form onSubmit={add} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Age</label>
                  <input className="form-input" type="number" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} required/>
                </div>
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} required/>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Add Patient</button>
                <button type="button" className="btn-outline" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
