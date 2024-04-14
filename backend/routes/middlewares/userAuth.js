const jwt = require("jsonwebtoken");
const Patient = require("../../models/patientModels");
const Doctor = require("../../models/doctorModels");
const mongoose = require("mongoose");

async function userAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);

    req.sender = {
      id: payload.id,
      userType: payload.userType,
    };

    switch (payload.userType) {
      case "Admin":
        break;
      case "Doctor":
        const doctor = await Doctor.findOne({
          userId: mongoose.Types.ObjectId(req.sender.id),
        });
        if (!doctor) {
          return res.status(404).json({ message: "Doctor not found" });
        }
        req.sender.doctorId = doctor._id;
        break;
      case "Patient":
        const patient = await Patient.findOne({
          userId: mongoose.Types.ObjectId(req.sender.id),
        });
        if (!patient) {
          return res.status(404).json({ message: "Patient not found" });
        }
        req.sender.patientId = patient._id;
        break;
      default:
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = userAuth;
