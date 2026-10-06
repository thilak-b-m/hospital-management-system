import Doctor from "../models/doctor.js";

const getUTCMidnight = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const archiveExpiredUnavailableDates = async (doctor = null, now = new Date()) => {
  const cutoff = getUTCMidnight(now);
  const doctors = doctor
    ? [doctor]
    : await Doctor.find({ "unavailableDates.date": { $lt: cutoff } });
  let archivedCount = 0;

  for (const record of doctors) {
    const activeDates = [];
    const expiredDates = [];

    for (const entry of record.unavailableDates || []) {
      if (entry?.date && new Date(entry.date) < cutoff) {
        expiredDates.push({
          date: entry.date,
          reason: entry.reason || "",
          archivedAt: now,
        });
      } else {
        activeDates.push(entry);
      }
    }

    if (expiredDates.length) {
      record.unavailableDates = activeDates;
      record.unavailableDateHistory = [...(record.unavailableDateHistory || []), ...expiredDates];
      await record.save();
      archivedCount += expiredDates.length;
    }
  }

  return archivedCount;
};
