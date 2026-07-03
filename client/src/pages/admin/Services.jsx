import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoEdit, IcoTrash } from '../../components/ui/Icons';

const SERVICES = [
  { name:'General Consultation', dept:'General Medicine', fee:'₹500',  duration:'30 min', status:'Active'  },
  { name:'ECG',                   dept:'Cardiology',       fee:'₹800',  duration:'20 min', status:'Active'  },
  { name:'X-Ray',                 dept:'Radiology',        fee:'₹1,200',duration:'15 min', status:'Active'  },
  { name:'Blood Test (CBC)',       dept:'Pathology',        fee:'₹600',  duration:'1 day',  status:'Active'  },
  { name:'MRI Scan',              dept:'Radiology',        fee:'₹4,500',duration:'45 min', status:'Inactive'},
  { name:'Dermatology Consult',   dept:'Dermatology',      fee:'₹700',  duration:'30 min', status:'Active'  },
];

export default function AdminServices() {
  const [list, setList]   = useState(SERVICES);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ name:'', dept:'', fee:'', duration:'', status:'Active' });

  const add = (e) => {
    e.preventDefault();
    setList(l=>[...l,{...form}]);
    setModal(false); setForm({name:'',dept:'',fee:'',duration:'',status:'Active'});
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div><div className="page-header-title">Services</div><div className="page-header-sub">Manage hospital services.</div></div>
        <button className="btn-primary" onClick={()=>setModal(true)}><IcoPlus size={14}/> Add Service</button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>Service Name</th><th>Department</th><th>Fee</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((s,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:500 }}>{s.name}</td>
                <td style={{ color:'#64748b' }}>{s.dept}</td>
                <td style={{ fontWeight:600, color:'#15803d' }}>{s.fee}</td>
                <td style={{ color:'#64748b' }}>{s.duration}</td>
                <td><span className={`badge ${s.status==='Active'?'badge-active':'badge-inactive'}`}>{s.status}</span></td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={{ background:'#fef9c3', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#92400e' }}><IcoEdit /></button>
                    <button style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}
                      onClick={()=>setList(l=>l.filter((_,j)=>j!==i))}><IcoTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:420, maxWidth:'90vw' }}>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:20 }}>Add Service</div>
            <form onSubmit={add} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Service Name'],['dept','Department'],['fee','Fee (₹)'],['duration','Duration']].map(([k,l])=>(
                <div key={k} className="form-group"><label className="form-label">{l}</label>
                  <input className="form-input" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} required/>
                </div>
              ))}
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
