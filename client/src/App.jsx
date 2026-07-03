import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient
import PatientDashboard  from './pages/patient/Dashboard';
import BookAppointment   from './pages/patient/BookAppointment';
import MyAppointments    from './pages/patient/MyAppointments';
import DoctorDetails     from './pages/patient/DoctorDetails';
import MyPrescriptions   from './pages/patient/MyPrescriptions';
import MyProfile         from './pages/patient/MyProfile';
import ChangePassword    from './pages/patient/ChangePassword';

// Doctor
import DoctorDashboard    from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients     from './pages/doctor/Patients';
import PatientDetail      from './pages/doctor/PatientDetail';
import Schedule           from './pages/doctor/Schedule';
import DoctorRx           from './pages/doctor/Prescriptions';
import NewPrescription    from './pages/doctor/NewPrescription';
import DoctorReports      from './pages/doctor/Reports';
import Messages           from './pages/doctor/Messages';
import DoctorProfile      from './pages/doctor/Profile';
import DoctorSettings     from './pages/doctor/Settings';

// Admin
import AdminDashboard     from './pages/admin/Dashboard';
import AdminUsers         from './pages/admin/Users';
import AdminDoctors       from './pages/admin/Doctors';
import AdminPatients      from './pages/admin/Patients';
import AdminAppointments  from './pages/admin/Appointments';
import AdminDepartments   from './pages/admin/Departments';
import AdminServices      from './pages/admin/Services';
import AdminPayments      from './pages/admin/Payments';
import AdminReports       from './pages/admin/Reports';
import AdminSettings      from './pages/admin/Settings';
import AdminNotifications from './pages/admin/Notifications';

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<Navigate to="/login" replace />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Patient ── */}
      <Route path="/patient/dashboard"        element={<PatientDashboard />} />
      <Route path="/patient/book-appointment" element={<BookAppointment />} />
      <Route path="/patient/appointments"     element={<MyAppointments />} />
      <Route path="/patient/doctor-details"   element={<DoctorDetails />} />
      <Route path="/patient/prescriptions"    element={<MyPrescriptions />} />
      <Route path="/patient/profile"          element={<MyProfile />} />
      <Route path="/patient/change-password"  element={<ChangePassword />} />

      {/* ── Doctor ── */}
      <Route path="/doctor/dashboard"        element={<DoctorDashboard />} />
      <Route path="/doctor/appointments"     element={<DoctorAppointments />} />
      <Route path="/doctor/patients"         element={<DoctorPatients />} />
      <Route path="/doctor/patient-detail"   element={<PatientDetail />} />
      <Route path="/doctor/schedule"         element={<Schedule />} />
      <Route path="/doctor/prescriptions"    element={<DoctorRx />} />
      <Route path="/doctor/new-prescription" element={<NewPrescription />} />
      <Route path="/doctor/reports"          element={<DoctorReports />} />
      <Route path="/doctor/messages"         element={<Messages />} />
      <Route path="/doctor/profile"          element={<DoctorProfile />} />
      <Route path="/doctor/settings"         element={<DoctorSettings />} />

      {/* ── Admin ── */}
      <Route path="/admin/dashboard"     element={<AdminDashboard />} />
      <Route path="/admin/users"         element={<AdminUsers />} />
      <Route path="/admin/doctors"       element={<AdminDoctors />} />
      <Route path="/admin/patients"      element={<AdminPatients />} />
      <Route path="/admin/appointments"  element={<AdminAppointments />} />
      <Route path="/admin/departments"   element={<AdminDepartments />} />
      <Route path="/admin/services"      element={<AdminServices />} />
      <Route path="/admin/payments"      element={<AdminPayments />} />
      <Route path="/admin/reports"       element={<AdminReports />} />
      <Route path="/admin/settings"      element={<AdminSettings />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
    </Routes>
  );
}
