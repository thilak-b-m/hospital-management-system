import { canAccessPatient } from "../utils/patientAccess.js";

export const authorizePatientAccess = async (req, res, next) => {
  try {
    if (!await canAccessPatient(req.user, req.params.patientId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's records." });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};