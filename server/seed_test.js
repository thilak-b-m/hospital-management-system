import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(serverDir, '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'fs';

import User from './src/models/user.js';
import Doctor from './src/models/doctor.js';
import Appointment from './src/models/appointment.js';
import Prescription from './src/models/prescription.js';
import MedicalHistory from './src/models/medicalHistory.js';
import Report from './src/models/report.js';

const run = async () => {
  if (!process.env.TEST_MONGO_URI) {
    throw new Error('TEST_MONGO_URI is required; point it at an isolated disposable test database.');
  }
  await mongoose.connect(process.env.TEST_MONGO_URI);

  // Doctor user
  let doctorUser = await User.findOne({ email: 'doctor@citycare.com' });
  if (!doctorUser) {
    const hashed = await bcrypt.hash('Doctor@1234', 10);
    doctorUser = await User.create({ name: 'Dr. Test', email: 'doctor@citycare.com', phone: '9111111111', password: hashed, role: 'doctor', status: 'Active' });
    console.log('Created doctor user: doctor@citycare.com / Doctor@1234');
  } else console.log('Doctor exists');

  let doctor = await Doctor.findOne({ user: doctorUser._id });
  if (!doctor) {
    doctor = await Doctor.create({ user: doctorUser._id, department: 'Cardiology', experience: 10, qualification: 'MD' });
    console.log('Created doctor profile');
  }

  // Patient user
  let patient = await User.findOne({ email: 'patient@citycare.com' });
  if (!patient) {
    const hashed = await bcrypt.hash('Patient@1234', 10);
    patient = await User.create({ name: 'Test Patient', email: 'patient@citycare.com', phone: '9222222222', password: hashed, role: 'patient', status: 'Active', patientId: 'PT9999' });
    console.log('Created patient user: patient@citycare.com / Patient@1234');
  } else console.log('Patient exists');

  // Appointment
  let appt = await Appointment.findOne({ patient: patient._id, doctor: doctor._id });
  if (!appt) {
    appt = await Appointment.create({ patient: patient._id, doctor: doctor._id, appointmentDate: new Date(), appointmentTime: '10:00 AM', symptoms: 'Headache', status: 'Pending' });
    console.log('Created appointment');
  }

  // Prescription
  let rx = await Prescription.findOne({ patient: patient._id });
  if (!rx) {
    rx = await Prescription.create({ patient: patient._id, doctor: doctor._id, diagnosis: 'Migraine', medications: [{ medicine: 'Paracetamol', dosage: '500mg', frequency: 'Thrice daily', duration: '3 days' }], notes: 'Take with food' });
    console.log('Created prescription');
  }

  // Medical history
  let mh = await MedicalHistory.findOne({ patient: patient._id });
  if (!mh) {
    mh = await MedicalHistory.create({ patient: patient._id, entries: [{ date: new Date(), title: 'Initial Visit', type: 'Diagnosis', notes: 'Patient reports headaches', doctor: doctor._id, appointment: appt._id, medications: ['Paracetamol'], vitals: { bloodPressure: '120/80', heartRate: '78', temperature: '98.6 F', respiratoryRate: '18' } }] });
    console.log('Created medical history');
  }

  // Dummy report file
  const uploadsDir = path.join(serverDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const fname = `test-report-${Date.now()}.txt`;
  const fpath = path.join(uploadsDir, fname);
  fs.writeFileSync(fpath, 'This is a test report');
  const host = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const fileUrl = `${host}/uploads/${fname}`;

  await Report.create({ patient: patient._id, doctor: doctor._id, appointment: appt._id, title: 'Test Report', notes: 'Uploaded by seed', fileUrl });
  console.log('Created test report:', fileUrl);

  await mongoose.disconnect();
  console.log('Seed complete');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
