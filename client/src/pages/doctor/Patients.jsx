import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoSearch, IcoChevronLeft, IcoChevronRight, IcoFilter } from '../../components/ui/Icons';

const PATIENTS = [
  { id:'PT001', name:'Ramesh Sharma', age:58, gender:'Male',  phone:'9876543210', lastVisit:'May 23, 2025', initials:'RS' },
  { id:'PT002', name:'Priya Mehta',   age:32, gender:'Female',phone:'8123456780', lastVisit:'May 23, 2025', initials:'PM' },
  { id:'PT003', name:'Amit Verma',    age:45, gender:'Male',  phone:'8887765855', lastVisit:'May 21, 2025', initials:'AV' },
  { id:'PT004', name:'Sneha Iyer',    age:29, gender:'Female',phone:'8031122344', lastVisit:'May 22, 2025', initials:'SI' },
  { id:'PT005', name:'Vikram Singh',  age:60, gender:'Male',  phone:'9876071333', lastVisit:'May 19, 2025', initials:'VS' },
  { id:'PT006', name:'Neha Kapoor',   age:38, gender:'Female',phone:'8888000988', lastVisit:'May 18, 2025', initials:'NK' },
  { id:'PT007', name:'Rajesh Kumar',  age:55, gender:'Male',  phone:'9009886776', lastVisit:'May 17, 2025', initials:'RK' },
  { id:'PT008', name:'Anita Desai',   age:42, gender:'Female',phone:'8123450000', lastVisit:'May 16, 2025', initials:'AD' },
];

export default function Patients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All Patients');

  const filtered = PATIENTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchGender = genderFilter === 'All Patients' || p.gender === genderFilter.replace('All ','');
    return matchSearch && matchGender;
  });

  return (
    <DoctorLayout searchBar>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>Patients</div>
          <div style={{ color:'#64748b', fontSize:13 }}>Manage and view your patients</div>
        </div>
        <button className="btn-primary" onClick={() => {}}>
          <IcoPlus size={14} /> Add New Patient
        </button>
      </div>

      <div className="card">
        {/* Filters row */}
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:240 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
              <IcoSearch size={14} />
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patients by name, phone or ID..."
              style={{ paddingLeft:32, paddingRight:12, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%', background:'white' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }}
            value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            <option>All Patients</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }}>
            <option>All Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }}>
            <option>Sort by: Recent</option>
            <option>Sort by: Name</option>
            <option>Sort by: Age</option>
          </select>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>ID</th><th>Age</th><th>Gender</th>
                <th>Phone</th><th>Last Visit</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="doc-avatar">{p.initials}</div>
                      <span style={{ fontWeight:500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'#64748b', fontSize:13 }}>{p.id}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td style={{ color:'#64748b', fontSize:13 }}>{p.phone}</td>
                  <td style={{ color:'#64748b', fontSize:13 }}>{p.lastVisit}</td>
                  <td>
                    <button className="btn-outline btn-sm"
                      onClick={() => navigate('/doctor/patient-detail')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16, paddingTop:12, borderTop:'1px solid #f1f5f9' }}>
          <div style={{ fontSize:13, color:'#64748b' }}>
            Showing 1 to {filtered.length} of {PATIENTS.length} patients
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {[1,2,3,'...',16,9,8].slice(0,5).map((n,i) => (
              <button key={i} style={{
                width:32, height:32, borderRadius:6, border:'1px solid #e2e8f0',
                background: n===1 ? 'var(--primary)' : 'white',
                color: n===1 ? 'white' : '#64748b',
                cursor:'pointer', fontSize:13, fontWeight:500
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
