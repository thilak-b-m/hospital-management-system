import { useEffect, useRef, useState } from 'react';
import { IcoSearch, IcoSend } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { connectSocket, getSocket } from '../../utils/socket';

export default function ChatUI({ Layout }) {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  // Connect socket once
  useEffect(() => {
    socketRef.current = connectSocket(token);
    const sock = socketRef.current;

    sock.on('receive_message', (msg) => {
      setMessages(prev => {
        // avoid duplicates
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      sock.off('receive_message');
    };
  }, [token]);

  // Load contacts
  useEffect(() => {
    api.get('/messages/contacts').then(res => {
      setContacts(res.data.contacts || []);
    }).catch(console.error).finally(() => setLoadingContacts(false));
  }, []);

  // Load messages when active contact changes
  useEffect(() => {
    if (!activeId) return;
    setLoadingMsgs(true);
    setMessages([]);

    // Join socket room
    socketRef.current?.emit('join_room', activeId);

    api.get(`/messages/${activeId}`).then(res => {
      setMessages(res.data.messages || []);
    }).catch(console.error).finally(() => setLoadingMsgs(false));
  }, [activeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    socketRef.current?.emit('send_message', { contactId: activeId, text: text.trim() });
    setText('');
  };

  const activeContact = contacts.find(c => String(c._id) === String(activeId));
  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const isMine = (msg) => String(msg.sender) === String(user?.id);

  return (
    <Layout>
      <div className="card" style={{ padding: 0, height: 'calc(100vh - 140px)', display: 'flex', overflow: 'hidden' }}>

        {/* Contact list */}
        <div style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <IcoSearch size={13} />
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                style={{ paddingLeft: 28, height: 34, border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, outline: 'none', width: '100%', background: '#f8fafc' }}/>
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingContacts ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No contacts found</div>
            ) : filteredContacts.map(c => {
              const initials = c.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
              const isActive = String(c._id) === String(activeId);
              return (
                <div key={c._id} onClick={() => setActiveId(String(c._id))}
                  style={{ display: 'flex', gap: 10, padding: '12px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #f8fafc',
                    background: isActive ? '#eff6ff' : 'white',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent' }}>
                  <div className="doc-avatar" style={{ width: 40, height: 40, flexShrink: 0, fontSize: 13 }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>{c.sub || c.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="doc-avatar">
                  {activeContact?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{activeContact?.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{activeContact?.sub || activeContact?.role}</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} title="Online"/>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>
                    No messages yet. Say hello!
                  </div>
                ) : messages.map((m, i) => {
                  const mine = isMine(m);
                  return (
                    <div key={m._id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      {!mine && (
                        <div className="doc-avatar" style={{ width: 28, height: 28, fontSize: 10, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                          {m.senderName?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '65%', padding: '10px 14px', borderRadius: 12,
                        background: mine ? 'var(--primary)' : '#f1f5f9',
                        color: mine ? 'white' : '#1e293b',
                        borderBottomRightRadius: mine ? 2 : 12,
                        borderBottomLeftRadius: mine ? 12 : 2,
                      }}>
                        {!mine && (
                          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, opacity: 0.7 }}>{m.senderName}</div>
                        )}
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4, textAlign: mine ? 'right' : 'left' }}>
                          {formatTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <form onSubmit={send}
                style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'center' }}>
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 24, fontSize: 14, outline: 'none', background: '#f8fafc' }}/>
                <button type="submit" className="btn-primary"
                  style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, justifyContent: 'center', flexShrink: 0 }}>
                  <IcoSend />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
