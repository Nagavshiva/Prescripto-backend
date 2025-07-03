import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";

// Sequelize models
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    }

    res.json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get All Appointments
export const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Cancel Appointment
export const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    await Appointment.update(
      { cancelled: true },
      { where: { id: appointmentId } }
    );

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Add New Doctor
export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address
    } = req.body;

    const imageFile = req.file;

    // Validation
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    const newDoctor = await Doctor.create({
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      available: true,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
      slots_booked: {}
    });

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get All Doctors (hide password)
export const allDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ["password"] }
    });

    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin Dashboard Data
export const adminDashboard = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    const users = await User.findAll();
    const appointments = await Appointment.findAll();

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse()
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
