import { useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoChevronLeft, IcoChevronRight } from '../../components/ui/Icons';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DATES = [18, 19, 20, 21, 22, 23, 24];
const HOURS = ['08:00','09:00','10:00','11:00','12:00','01:00','02:00','03:00','04:00'];

const BLOCKS = [
  { day:1, startH:1, label:'Ramesh Sharma',  sub:'09:00 – 09:30', color:'#dbeafe', border:'#1d4ed8' },
  { day:2, startH:2, label:'Priya Mehta',    sub:'10:30 – 11:00', color:'#dcfce7', border:'#15803d' },
  { day:3, startH:3, label:'Amit Verma',     sub:'11:30 – 12:00', color:'#ede9fe', border:'#7c3aed' },
  { day:4, startH:4, label:'Lunch Break',    sub:'01:00 – 02:00', color:'#fef9c3', border:'#b45309', span:2 },
  { day:6, startH:5, label:'Vikram Singh',   sub:'02:00 – 02:30', color:'#dbeafe', border:'#1d4ed8' },
  { day:5, startH:7, label:'Sneha Iyer',     sub:'03:30 – 04:00', color:'#dcfce7', border:'#15803d' },
];

export default function Schedule() {
  const [view, setView] = useState('Week');
  const CELL_H = 56;

  return (
    <DoctorLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700 }}>Schedule</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className="btn-primary btn-sm" onClick={() => {}}>
            <IcoPlus size={13} /> Add Unavailable Time
          </button>
        </div>
      </div>

      <div className="card">
        {/* Controls */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:8, padding:3 }}>
            {['Week','Month'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'6px 16px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
                  background: view===v ? 'white' : 'transparent',
                  color: view===v ? 'var(--primary)' : '#64748b',
                  boxShadow: view===v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {v}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#64748b' }}>
              <IcoChevronLeft />
            </button>
            <span style={{ fontSize:14, fontWeight:600 }}>May 2025</span>
            <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#64748b' }}>
              <IcoChevronRight />
            </button>
            <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 12px', color:'#64748b', fontSize:13 }}>
              Today
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div style={{ overflowX:'auto' }}>
          <div style={{ minWidth:700 }}>
            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', borderBottom:'1px solid #e2e8f0' }}>
              <div/>
              {DAYS.map((d, i) => (
                <div key={d} style={{ padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:12, color:'#94a3b8', fontWeight:500 }}>{d}</div>
                  <div style={{ fontSize:18, fontWeight:700, marginTop:2,
                    color: i===4 ? 'white' : '#1e293b',
                    background: i===4 ? 'var(--primary)' : 'transparent',
                    width: i===4 ? 34 : 'auto', height: i===4 ? 34 : 'auto',
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    margin: i===4 ? '2px auto 0' : '2px 0 0',
                  }}>
                    {DATES[i]}
                  </div>
                </div>
              ))}
            </div>

            {/* Time rows */}
            <div style={{ position:'relative' }}>
              {HOURS.map((h, hi) => (
                <div key={h} style={{ display:'grid', gridTemplateColumns:'60px repeat(7, 1fr)', borderBottom:'1px solid #f1f5f9', minHeight: CELL_H }}>
                  <div style={{ fontSize:12, color:'#94a3b8', padding:'8px 8px 0', borderRight:'1px solid #f1f5f9', textAlign:'right', paddingRight:10 }}>
                    {h}
                  </div>
                  {DAYS.map((_, di) => (
                    <div key={di} style={{ borderRight:'1px solid #f8fafc', position:'relative', minHeight: CELL_H }}>
                      {BLOCKS.filter(b => b.day === di && b.startH === hi).map((b, bi) => (
                        <div key={bi} style={{
                          position:'absolute', top:4, left:4, right:4, zIndex:1,
                          background: b.color, borderLeft:`3px solid ${b.border}`,
                          borderRadius:6, padding:'4px 8px',
                          height: b.span ? CELL_H * b.span - 8 : CELL_H - 8,
                          cursor:'pointer',
                        }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'#1e293b' }}>{b.label}</div>
                          <div style={{ fontSize:11, color:'#64748b' }}>{b.sub}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
