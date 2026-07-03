import { useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoSearch, IcoSend } from '../../components/ui/Icons';

const CONVOS = [
  { id: 1, name: 'Dr. Robert Smith', role: 'Cardiologist', initials: 'RS', last: 'Please continue the medicine for one week.', time: '10:50 AM', unread: 1 },
  { id: 2, name: 'Dr. Emily Johnson', role: 'Neurologist', initials: 'EJ', last: 'Your report looks stable.', time: '10:15 AM', unread: 0 },
  { id: 3, name: 'Dr. Sarah Davis', role: 'Dermatologist', initials: 'SD', last: 'Apply the cream twice daily.', time: 'Yesterday', unread: 0 },
  { id: 4, name: 'Hospital Admin', role: 'Support', initials: 'HA', last: 'Your appointment has been confirmed.', time: 'May 30', unread: 0 },
];

const CHAT = {
  1: [
    { from: 'doctor', text: 'Hello John, how are you feeling today?', time: '09:10 AM' },
    { from: 'patient', text: 'Hello Doctor, I feel better but still have slight chest discomfort.', time: '09:15 AM' },
    { from: 'doctor', text: 'Please continue the medicine for one week and avoid heavy exercise.', time: '09:20 AM' },
    { from: 'patient', text: 'Okay doctor, thank you.', time: '09:25 AM' },
  ],
  2: [
    { from: 'doctor', text: 'Your report looks stable. We can review again next month.', time: '10:15 AM' },
  ],
  3: [
    { from: 'doctor', text: 'Apply the cream twice daily and keep the area dry.', time: 'Yesterday' },
  ],
  4: [
    { from: 'admin', text: 'Your appointment has been confirmed.', time: 'May 30' },
  ],
};

export default function PatientMessages() {
  const [active, setActive] = useState(1);
  const [msg, setMsg] = useState('');
  const [chats, setChats] = useState(CHAT);

  const convo = CONVOS.find(c => c.id === active);
  const msgs = chats[active] || [];

  const send = e => {
    e.preventDefault();
    if (!msg.trim()) return;
    setChats(prev => ({
      ...prev,
      [active]: [...(prev[active] || []), { from: 'patient', text: msg.trim(), time: 'Now' }],
    }));
    setMsg('');
  };

  return (
    <PatientLayout>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Messages</div>
      <div className="card" style={{ padding: 0, height: 'calc(100vh - 160px)', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <IcoSearch size={13} />
              </span>
              <input
                placeholder="Search conversations..."
                style={{ paddingLeft: 28, paddingRight: 8, height: 34, border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, outline: 'none', width: '100%', background: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {CONVOS.map(c => (
              <div
                key={c.id}
                onClick={() => setActive(c.id)}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f8fafc',
                  background: active === c.id ? '#eff6ff' : 'white',
                  borderLeft: active === c.id ? '3px solid var(--primary)' : '3px solid transparent',
                }}
              >
                <div className="doc-avatar" style={{ width: 40, height: 40, flexShrink: 0, fontSize: 13 }}>{c.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.time}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.role}</div>
                  <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{c.last}</div>
                </div>
                {c.unread > 0 && (
                  <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {c.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {convo && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="doc-avatar">{convo.initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{convo.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{convo.role}</div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'patient' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '65%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: m.from === 'patient' ? 'var(--primary)' : '#f1f5f9',
                    color: m.from === 'patient' ? 'white' : '#1e293b',
                    borderBottomRightRadius: m.from === 'patient' ? 2 : 12,
                    borderBottomLeftRadius: m.from === 'patient' ? 12 : 2,
                  }}
                >
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: m.from === 'patient' ? 'right' : 'left' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 24, fontSize: 14, outline: 'none', background: '#f8fafc' }}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, justifyContent: 'center' }}>
              <IcoSend />
            </button>
          </form>
        </div>
      </div>
    </PatientLayout>
  );
}
