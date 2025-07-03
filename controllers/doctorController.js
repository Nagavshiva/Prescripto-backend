import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";

// Doctor Login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ where: { email } });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Doctor's Appointments
export const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.user.id;
    const appointments = await Appointment.findAll({ where: { docId } });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Cancel Appointment
export const appointmentCancel = async (req, res) => {
  try {
     const docId = req.user.id;
    const { appointmentId } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (appointment && appointment.docId == docId) {
      await appointment.update({ cancelled: true });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.json({ success: false, message: "Appointment not found or invalid" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Complete Appointment
export const appointmentComplete = async (req, res) => {
  try {
     const docId = req.user.id;
    const { appointmentId } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (appointment && appointment.docId == docId) {
      await appointment.update({ isCompleted: true });
      return res.json({ success: true, message: "Appointment Completed" });
    }

    res.json({ success: false, message: "Appointment not found or invalid" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Doctor List (Hide password & email)
export const doctorList = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ["password", "email"] }
    });
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Change Doctor Availability
export const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const doctor = await Doctor.findByPk(docId);
    await doctor.update({ available: !doctor.available });

    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Doctor Profile
export const doctorProfile = async (req, res) => {
  try {
     const docId = req.user.id;
    const doctor = await Doctor.findByPk(docId, {
      attributes: { exclude: ["password"] }
    });

    res.json({ success: true, profileData: doctor });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  try {
     const docId = req.user.id;
    const { fees, address, available } = req.body;

    await Doctor.update(
      { fees, address, available },
      { where: { id: docId } }
    );

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor Dashboard
export const doctorDashboard = async (req, res) => {
  try {
     const docId = req.user.id;
    const appointments = await Appointment.findAll({ where: { docId } });

    let earnings = 0;
    let patients = new Set();

    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) earnings += item.amount;
      patients.add(item.userId);
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.size,
      latestAppointments: appointments.reverse()
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
