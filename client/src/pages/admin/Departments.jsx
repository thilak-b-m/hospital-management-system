import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoEdit, IcoTrash } from '../../components/ui/Icons';

const INIT_DEPTS = [
  { name:'Cardiology',      head:'Dr. Arjun Patel',  doctors:12, patients:320, status:'Active' },
  { name:'Orthopedics',     head:'Dr. Rohit Kumar',  doctors:8,  patients:280, status:'Active' },
  { name:'Dermatology',     head:'Dr. Neha Verma',   doctors:6,  patients:210, status:'Active' },
  { name:'Neurology',       head:'Dr. Anjali Singh', doctors:9,  patients:180, status:'Active' },
  { name:'Pediatrics',      head:'Dr. Vivek Mishra', doctors:7,  patients:250, status:'Active' },
  { name:'Gynecology',      head:'Dr. Pooja Shah',   doctors:5,  patients:190, status:'Inactive'},
];

export default function AdminDepartments() {
  const [list, setList]   = useState(INIT_DEPTS);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ name:'', head:'', doctors:'', patients:'', status:'Active' });

  const add = (e) => {
    e.preventDefault();
    setList(l=>[...l,{...form,doctors:Number(form.doctors),patients:Number(form.patients)}]);
    setModal(false); setForm({name:'',head:'',doctors:'',patients:'',status:'Active'});
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div><div className="page-header-title">Departments</div><div className="page-header-sub">Manage hospital departments.</div></div>
        <button className="btn-primary" onClick={()=>setModal(true)}><IcoPlus size={14}/> Add Department</button>
      </div>

      <div className="grid-3">
        {list.map((d,i)=>(
          <div key={i} className="card" style={{ borderTop:`3px solid ${['#4f46e5','#0891b2','#f59e0b','#10b981','#ef4444','#8b5cf6'][i%6]}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{d.name}</div>
              <span className={`badge ${d.status==='Active'?'badge-active':'badge-inactive'}`}>{d.status}</span>
            </div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>Head: <strong style={{ color:'#374151' }}>{d.head}</strong></div>
            <div style={{ display:'flex', gap:16, marginBottom:14 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'var(--primary)' }}>{d.doctors}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Doctors</div>
              </div>
              <div style={{ width:1, background:'#e2e8f0' }}/>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#10b981' }}>{d.patients}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Patients</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }}><IcoEdit /> Edit</button>
              <button onClick={()=>setList(l=>l.filter((_,j)=>j!==i))}
                style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'6px 10px', color:'#dc2626' }}>
                <IcoTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:420, maxWidth:'90vw' }}>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>Add Department</div>
            <form onSubmit={add} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Department Name</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/>
              </div>
              <div className="form-group"><label className="form-label">Department Head</label>
                <input className="form-input" value={form.head} onChange={e=>setForm(p=>({...p,head:e.target.value}))} required/>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Doctors</label>
                  <input className="form-input" type="number" value={form.doctors} onChange={e=>setForm(p=>({...p,doctors:e.target.value}))} required/>
                </div>
                <div className="form-group"><label className="form-label">Patients</label>
                  <input className="form-input" type="number" value={form.patients} onChange={e=>setForm(p=>({...p,patients:e.target.value}))} required/>
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Add</button>
                <button type="button" className="btn-outline" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
