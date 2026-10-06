import { useEffect, useMemo, useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoChevronLeft, IcoChevronRight, IcoCalendar, IcoBan, IcoTrash } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { connectSocket } from '../../utils/socket';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const toDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const getMonthDates = (year, month) => {
  const dayCount = new Date(year, month, 0).getDate();
  return Array.from({ length: dayCount }, (_, index) => new Date(year, month - 1, index + 1));
};
const formatDateLabel = (date) => `${WEEK_DAYS[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;

export default function Schedule() {
  const { token } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState({ stats: {}, byDate: {}, daySummary: {}, upcoming: [], unavailableDates: [], unavailableDateHistory: [] });
  const [loading, setLoading] = useState(true);
  const [addingUnavailable, setAddingUnavailable] = useState(false);
  const [unavailableDateValue, setUnavailableDateValue] = useState('');
  const [unavailableReason, setUnavailableReason] = useState('');
  const [unavailableStatus, setUnavailableStatus] = useState({ message: '', type: '' });

  const monthDates = useMemo(() => getMonthDates(year, month), [year, month]);
  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const selectedAppointments = schedule.byDate[selectedKey] || [];
  const selectedSummary = schedule.daySummary[selectedKey] || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  const unavailableDateKeys = useMemo(
    () => new Set((schedule.unavailableDates || []).map((entry) => entry.date)),
    [schedule.unavailableDates]
  );
  const unavailableHistoryKeys = useMemo(
    () => new Set((schedule.unavailableDateHistory || []).map((entry) => entry.date)),
    [schedule.unavailableDateHistory]
  );

  const loadSchedule = async (requestedYear = year, requestedMonth = month) => {
    setLoading(true);
    try {
      const response = await api.get('/doctor/schedule', { params: { year: requestedYear, month: requestedMonth } });
      if (response.data.success) {
        setSchedule(response.data);
        setUnavailableStatus({ message: '', type: '' });
        const monthStart = getMonthDates(requestedYear, requestedMonth)[0];
        setSelectedDate((prev) => {
          if (toDateKey(prev).startsWith(`${requestedYear}-${String(requestedMonth).padStart(2, '0')}`)) {
            return prev;
          }
          return monthStart;
        });
      }
    } catch (err) {
      console.error('Schedule load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule(year, month);
  }, [year, month]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    const refreshHandler = () => {
      loadSchedule(year, month);
    };

    socket.on('doctor_schedule_update', refreshHandler);
    return () => {
      socket.off('doctor_schedule_update', refreshHandler);
    };
  }, [token, year, month]);

  const handlePreviousMonth = () => {
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const handleAddUnavailableSubmit = async (event) => {
    event.preventDefault();
    setUnavailableStatus({ message: '', type: '' });
    if (!unavailableDateValue) {
      setUnavailableStatus({ message: 'Please select a date to block.', type: 'error' });
      return;
    }

    try {
      await api.post('/doctor/unavailable', { date: unavailableDateValue, reason: unavailableReason });
      setUnavailableStatus({ message: 'Day marked unavailable.', type: 'success' });
      setUnavailableDateValue('');
      setUnavailableReason('');
      setAddingUnavailable(false);
      loadSchedule(year, month);
    } catch (err) {
      setUnavailableStatus({ message: err.response?.data?.message || 'Unable to mark unavailable date.', type: 'error' });
    }
  };

  const handleRemoveUnavailableDate = async (date) => {
    setUnavailableStatus({ message: '', type: '' });
    try {
      await api.delete(`/doctor/unavailable/${date}`);
      setUnavailableStatus({ message: 'Blocked date removed.', type: 'success' });
      loadSchedule(year, month);
    } catch (err) {
      setUnavailableStatus({ message: err.response?.data?.message || 'Unable to remove blocked date.', type: 'error' });
    }
  };

  const isUnavailableDate = (dateKey) => unavailableDateKeys.has(dateKey);

  return (
    <DoctorLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ color: '#64748b', marginTop: 4 }}>Review appointments, daily bookings and live updates.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-primary btn-sm" onClick={() => setAddingUnavailable(true)}>
            <IcoPlus size={13} /> Add Unavailable Time
          </button>
        </div>
      </div>

      {addingUnavailable && (
        <div className="card" style={{ marginBottom: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 0 }}>Mark Unavailable Date</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>Block a day so patients cannot book it.</div>
            </div>
            <button
              className="btn-secondary btn-sm"
              type="button"
              onClick={() => {
                setAddingUnavailable(false);
                setUnavailableStatus({ message: '', type: '' });
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              Cancel
            </button>
          </div>

          {unavailableStatus.message && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, color: unavailableStatus.type === 'error' ? '#b91c1c' : '#166534', background: unavailableStatus.type === 'error' ? '#fee2e2' : '#dcfce7', border: unavailableStatus.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
              {unavailableStatus.message}
            </div>
          )}

          <form onSubmit={handleAddUnavailableSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unavailable Date</label>
              <input
                className="form-input"
                type="date"
                value={unavailableDateValue}
                onChange={(e) => setUnavailableDateValue(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason (optional)</label>
              <input
                className="form-input"
                type="text"
                value={unavailableReason}
                onChange={(e) => setUnavailableReason(e.target.value)}
                placeholder="Vacation, emergency, etc."
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ padding: '11px 18px', minWidth: 180 }}>
                Save Unavailable Date
              </button>
            </div>
          </form>
        </div>
      )}

      {!addingUnavailable && schedule.unavailableDates.length > 0 && (
        <div className="card" style={{ marginBottom: 12, padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Blocked dates:</span>
            {(schedule.unavailableDates || []).slice(0, 6).map((entry) => (
              <div key={entry.date} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#f8d7da', color: '#991b1b', fontSize: 12, border: '1px solid #f5c2c7' }}>
                <IcoBan size={12} />
                <span>{entry.date}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveUnavailableDate(entry.date)}
                  style={{ border: 'none', background: 'transparent', color: '#991b1b', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                  title="Remove blocked date"
                >
                  <IcoTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!addingUnavailable && schedule.unavailableDateHistory?.length > 0 && (
        <div className="card" style={{ marginBottom: 12, padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Past unavailable dates:</span>
            {schedule.unavailableDateHistory.slice(0, 6).map((entry) => (
              <span key={`${entry.date}-${entry.archivedAt}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#fff7ed', color: '#9a3412', fontSize: 12, border: '1px solid #fed7aa' }}>
                <IcoBan size={12} />
                <span>{entry.date}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
            <div
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: 'default',
                fontSize: 13,
                fontWeight: 500,
                background: 'white',
                color: 'var(--primary)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}
            >
              Month
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', padding: '5px 8px', color: '#64748b' }}
              onClick={handlePreviousMonth}
            >
              <IcoChevronLeft />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{MONTH_NAMES[month - 1]} {year}</span>
            <button
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', padding: '5px 8px', color: '#64748b' }}
              onClick={handleNextMonth}
            >
              <IcoChevronRight />
            </button>
            <button
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', padding: '5px 12px', color: '#64748b', fontSize: 13 }}
              onClick={() => {
                const today = new Date();
                const todayYear = today.getFullYear();
                const todayMonth = today.getMonth() + 1;
                setYear(todayYear);
                setMonth(todayMonth);
                setSelectedDate(today);
                loadSchedule(todayYear, todayMonth);
              }}
            >
              Today
            </button>
          </div>
        </div>

        <div className="grid-4" style={{ gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Appointments', value: schedule.stats.total, color: '#dbeafe', icon: '#1d4ed8' },
            { label: 'Confirmed', value: schedule.stats.confirmed, color: '#dcfce7', icon: '#15803d' },
            { label: 'Pending', value: schedule.stats.pending, color: '#ede9fe', icon: '#7c3aed' },
            { label: 'Completed', value: schedule.stats.completed, color: '#dcfce7', icon: '#15803d' },
            { label: 'Cancelled', value: schedule.stats.cancelled, color: '#fee2e2', icon: '#dc2626' },
          ].map((card) => (
            <div key={card.label} className="stat-card" style={{ minWidth: 200 }}>
              <div className="stat-icon" style={{ background: card.color, color: card.icon }}><IcoCalendar /></div>
              <div>
                <div className="stat-label" style={{ fontSize: 12, color: '#64748b' }}>{card.label}</div>
                <div className="stat-number" style={{ color: '#0f172a', fontSize: 24 }}>{loading ? '...' : card.value ?? 0}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div className="card" style={{ minHeight: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Month Overview</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{loading ? 'Loading...' : `${monthDates.length} days`}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {monthDates.map((date) => {
              const key = toDateKey(date);
              const summary = schedule.daySummary[key] || { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0 };
              const isSelected = toDateKey(date) === selectedKey;
              const wasUnavailable = unavailableHistoryKeys.has(key);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    background: isSelected ? 'white' : isUnavailableDate(key) ? '#fff1f2' : wasUnavailable ? '#fff7ed' : '#f8fafc',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.25)' : isUnavailableDate(key) ? '1px solid #fca5a5' : wasUnavailable ? '1px dashed #fdba74' : '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    minHeight: 110,
                  }}
                >
                  <div style={{ fontSize: 12, color: isUnavailableDate(key) ? '#b91c1c' : '#64748b' }}>{WEEK_DAYS[date.getDay()]}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{date.getDate()}</div>
                  <div style={{ marginTop: 10, color: '#475569', fontSize: 13 }}>{summary.total} appointment{summary.total === 1 ? '' : 's'}</div>
                  {isUnavailableDate(key) && (
                    <div style={{ marginTop: 6, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <IcoBan size={12} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>Unavailable</span>
                    </div>
                  )}
                  {!isUnavailableDate(key) && wasUnavailable && (
                    <div style={{ marginTop: 6, display: 'inline-flex', gap: 6, alignItems: 'center' }} title="This date was previously blocked and is now archived">
                      <IcoBan size={12} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#c2410c' }}>Past block</span>
                    </div>
                  )}
                  {summary.confirmed > 0 && !isUnavailableDate(key) && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-scheduled">{summary.confirmed} confirmed</span>
                      <span className="badge badge-upcoming">{summary.pending} pending</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ minHeight: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 0 }}>Selected Day</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{formatDateLabel(selectedDate)}</div>
            </div>
            <span className="badge badge-scheduled" style={{ fontSize: 12 }}>
              {selectedSummary.total} total
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            {[
              { label: 'Confirmed', value: selectedSummary.confirmed },
              { label: 'Pending', value: selectedSummary.pending },
              { label: 'Completed', value: selectedSummary.completed },
              { label: 'Cancelled', value: selectedSummary.cancelled },
            ].map((card) => (
              <div key={card.label} style={{ flex: '1 1 45%', padding: 12, background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{card.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{loading ? '...' : card.value ?? 0}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading appointments...</div>
          ) : selectedAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>No appointments for this day.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedAppointments.map((appt) => (
                <div key={appt._id} style={{ padding: 12, borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{appt.patientName}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{appt.patientId}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{appt.time}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>{appt.symptoms || 'General consultation'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span className={`badge ${appt.status === 'Confirmed' ? 'badge-completed' : appt.status === 'Pending' ? 'badge-upcoming' : appt.status === 'Cancelled' ? 'badge-cancelled' : 'badge-completed'}`}>{appt.status}</span>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{appt.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
