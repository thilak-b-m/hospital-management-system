import Appointment from "../models/appointment.js";
import { notifyUser } from "./notificationService.js";

const dateKey = (date) => date.toISOString().slice(0, 10);

export const sendAppointmentReminders = async (now = new Date()) => {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setUTCDate(dayAfterTomorrow.getUTCDate() + 1);

  const reminders = [
    { start: today, end: tomorrow, key: "day_of", label: "today" },
    { start: tomorrow, end: dayAfterTomorrow, key: "day_before", label: "tomorrow" },
  ];
  let sentCount = 0;

  for (const reminder of reminders) {
    const appointments = await Appointment.find({
      appointmentDate: { $gte: reminder.start, $lt: reminder.end },
      status: { $in: ["Pending", "Confirmed"] },
    })
      .populate("patient", "_id")
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .lean();

    for (const appointment of appointments) {
      if (!appointment.patient?._id) continue;
      const doctorName = appointment.doctor?.user?.name || "your doctor";
      const notification = await notifyUser(appointment.patient._id, {
        type: "appointment",
        title: `Appointment reminder for ${reminder.label}`,
        message: `Reminder: your appointment with ${doctorName} is ${reminder.label}, ${dateKey(appointment.appointmentDate)} at ${appointment.appointmentTime}.`,
        link: "/patient/appointments",
        metadata: { appointmentId: String(appointment._id), reminder: reminder.key },
        dedupeKey: `appointment:${appointment._id}:${reminder.key}`,
      });
      if (notification) sentCount += 1;
    }
  }

  return sentCount;
};
