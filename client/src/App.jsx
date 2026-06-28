import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import DoctorDetails from './pages/patient/DoctorDetails';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import MyProfile from './pages/patient/MyProfile';
import ChangePassword from './pages/patient/ChangePassword';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/patient/dashboard" element={<Dashboard />} />
      <Route path="/patient/book-appointment" element={<BookAppointment />} />
      <Route path="/patient/appointments" element={<MyAppointments />} />
      <Route path="/patient/doctor-details" element={<DoctorDetails />} />
      <Route path="/patient/prescriptions" element={<MyPrescriptions />} />
      <Route path="/patient/profile" element={<MyProfile />} />
      <Route path="/patient/change-password" element={<ChangePassword />} />
    </Routes>
  );
}
