import { useEffect, useRef, useState, useCallback } from 'react';
import { IcoSearch, IcoSend } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { connectSocket, disconnectSocket } from '../../utils/socket';

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
  const activeIdRef = useRef(null);
  const myIdRef = useRef('');

  // Keep refs in sync
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { myIdRef.current = String(user?.id || user?._id || ''); }, [user]);

  // Connect socket once per token, clean up on unmount
  useEffect(() => {
    if (!token) return;

    const sock = connectSocket(token);
    socketRef.current = sock;

    const handleMessage = (msg) => {
      const myId = myIdRef.current;
      const contactId = activeIdRef.current;
      if (!contactId || !myId) return;

      // Compute expected roomId for current open conversation
      const expectedRoom = [myId, contactId].sort().join('_');
      if (msg.roomId !== expectedRoom) return;

      setMessages(prev => {
        // Replace optimistic message from me with confirmed one
        const optIdx = prev.findIndex(
          m => m.isOptimistic && String(m.sender) === myId && m.text === msg.text
        );
        if (optIdx !== -1) {
          const next = [...prev];
          next[optIdx] = { ...msg, isOptimistic: false };
          return next;
        }
        // Deduplicate by _id
        if (prev.some(m => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };

    sock.on('receive_message', handleMessage);

    // Re-join room if socket reconnects mid-session
    sock.on('connect', () => {
      if (activeIdRef.current) {
        sock.emit('join_room', activeIdRef.current);
      }
    });

    return () => {
      sock.off('receive_message', handleMessage);
      sock.off('connect');
    };
  }, [token]);

  // Load contacts
  useEffect(() => {
    api.get('/messages/contacts')
      .then(res => setContacts(res.data.contacts || []))
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, []);

  // Join room + load history when active contact changes
  useEffect(() => {
    if (!activeId) return;

    setLoadingMsgs(true);
    setMessages([]);

    // Emit join_room with the contact's user _id
    socketRef.current?.emit('join_room', activeId);

    api.get(`/messages/${activeId}`)
      .then(res => setMessages(res.data.messages || []))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback((e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !activeId || !socketRef.current?.connected) return;

    const myId = myIdRef.current;

    // Optimistic message shown immediately
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      sender: myId,
      senderName: user?.name || '',
      senderRole: user?.role || '',
      text: trimmed,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    setText('');

    socketRef.current.emit('send_message', { contactId: activeId, text: trimmed });
  }, [text, activeId, user]);

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

  const isMine = (msg) => String(msg.sender) === myIdRef.current;

  return (
    <Layout>
      <div className="card" style={{ padding: 0, height: 'calc(100vh - 148px)', display: 'flex', overflow: 'hidden' }}>

        {/* Contact list */}
        <div style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <IcoSearch size={13} />
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                style={{ paddingLeft: 28, height: 34, border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, outline: 'none', width: '100%', background: '#f8fafc' }} />
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
                  style={{
                    display: 'flex', gap: 10, padding: '12px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #f8fafc',
                    background: isActive ? '#eff6ff' : 'white',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  }}>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!activeId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div className="doc-avatar">
                  {activeContact?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{activeContact?.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{activeContact?.sub || activeContact?.role}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  Online
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>
                    No messages yet. Say hello!
                  </div>
                ) : messages.map((m, i) => {
                  const mine = isMine(m);
                  return (
                    <div key={m._id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                      {!mine && (
                        <div className="doc-avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                          {m.senderName?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                        </div>
                      )}
                      <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                        {!mine && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 3, paddingLeft: 4 }}>{m.senderName}</div>
                        )}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: 16,
                          background: mine ? 'var(--primary)' : '#f1f5f9',
                          color: mine ? 'white' : '#1e293b',
                          borderBottomRightRadius: mine ? 4 : 16,
                          borderBottomLeftRadius: mine ? 16 : 4,
                          fontSize: 14,
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                          opacity: m.isOptimistic ? 0.7 : 1,
                        }}>
                          {m.text}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                          {formatTime(m.createdAt)}
                          {m.isOptimistic && <span style={{ marginLeft: 4, fontSize: 10 }}>sending...</span>}
                        </div>
                      </div>
                      {mine && (
                        <div className="doc-avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0, background: '#dbeafe', color: 'var(--primary)' }}>
                          {user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'ME'}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={send}
                style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: 24, fontSize: 14, outline: 'none', background: '#f8fafc' }} />
                <button type="submit" className="btn-primary"
                  disabled={!text.trim()}
                  style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, justifyContent: 'center', flexShrink: 0, opacity: text.trim() ? 1 : 0.5 }}>
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
