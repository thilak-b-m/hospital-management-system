import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoSearch, IcoDownload } from '../../components/ui/Icons';

const PAYMENTS = [
  { id:'TXN001', patient:'Ramesh Sharma', initials:'RS', service:'ECG',                  amount:'₹800',   date:'May 22, 2025', method:'UPI',        status:'Paid'    },
  { id:'TXN002', patient:'Priya Mehta',   initials:'PM', service:'Consultation',          amount:'₹500',   date:'May 22, 2025', method:'Card',       status:'Paid'    },
  { id:'TXN003', patient:'Amit Verma',    initials:'AV', service:'X-Ray',                 amount:'₹1,200', date:'May 21, 2025', method:'Cash',       status:'Paid'    },
  { id:'TXN004', patient:'Sneha Iyer',    initials:'SI', service:'Blood Test',             amount:'₹600',   date:'May 21, 2025', method:'UPI',        status:'Pending' },
  { id:'TXN005', patient:'Vikram Singh',  initials:'VS', service:'MRI Scan',              amount:'₹4,500', date:'May 20, 2025', method:'Insurance',  status:'Paid'    },
  { id:'TXN006', patient:'Neha Kapoor',   initials:'NK', service:'Dermatology Consult',   amount:'₹700',   date:'May 20, 2025', method:'Card',       status:'Refunded'},
];

const ST = { Paid:'badge-completed', Pending:'badge-pending', Refunded:'badge-cancelled' };

export default function AdminPayments() {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('All');
  const [methodF, setMethodF] = useState('All');

  const filtered = PAYMENTS.filter(p => {
    const s  = p.patient.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const st = statusF==='All' || p.status===statusF;
    const m  = methodF==='All' || p.method===methodF;
    return s && st && m;
  });

  const total = filtered.filter(p=>p.status==='Paid').length;

  return (
    <AdminLayout>
      <div className="page-header">
        <div><div className="page-header-title">Payments</div><div className="page-header-sub">Manage and track all payments.</div></div>
        <button className="btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:6 }}><IcoDownload /> Export</button>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:'Total Revenue', value:'₹12,45,300', color:'#dcfce7', tc:'#15803d' },
          { label:'Paid',          value:'₹11,80,000', color:'#dbeafe', tc:'#1d4ed8' },
          { label:'Pending',       value:'₹65,300',    color:'#fef9c3', tc:'#92400e' },
        ].map(({ label, value, color, tc }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:tc }}>₹</div>
            <div>
              <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
              <div className="stat-number" style={{ fontSize:22, color:tc }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}><IcoSearch size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="All">All Status</option><option>Paid</option><option>Pending</option><option>Refunded</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={methodF} onChange={e=>setMethodF(e.target.value)}>
            <option value="All">All Methods</option><option>UPI</option><option>Card</option><option>Cash</option><option>Insurance</option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Txn ID</th><th>Patient</th><th>Service</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={i}>
                <td style={{ color:'#94a3b8', fontSize:12 }}>{p.id}</td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{p.initials}</div>
                    <span style={{ fontWeight:500 }}>{p.patient}</span>
                  </div>
                </td>
                <td style={{ color:'#64748b', fontSize:13 }}>{p.service}</td>
                <td style={{ fontWeight:600 }}>{p.amount}</td>
                <td style={{ color:'#64748b', fontSize:13 }}>{p.date}</td>
                <td>
                  <span style={{ background:'#f1f5f9', borderRadius:6, padding:'2px 10px', fontSize:12, color:'#475569', fontWeight:500 }}>{p.method}</span>
                </td>
                <td><span className={`badge ${ST[p.status]}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
