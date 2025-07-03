import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import stripe from "stripe";
import razorpay from "razorpay";

// Sequelize Models
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing Details" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Please enter a valid email" });

    if (password.length < 8)
      return res.json({ success: false, message: "Please enter a strong password" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.json({ success: false, message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address_line1,address_line2, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender)
      return res.json({ success: false, message: "Data Missing" });

    await User.update(
      {
        name, phone, address_line1, address_line2,
        dob, gender
      },
      { where: { id: userId } }
    );

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      const imageURL = imageUpload.secure_url;
      await User.update({ image: imageURL }, { where: { id: userId } });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {docId, slotDate, slotTime } = req.body;
    const docData = await Doctor.findByPk(docId);

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }

    let slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot Not Available" });
    }

    slots_booked[slotDate] = [...(slots_booked[slotDate] || []), slotTime];

    const userData = await User.findByPk(userId);

    const appointmentData = await Appointment.create({
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      date: Date.now(),
    });

    await Doctor.update({ slots_booked }, { where: { id: docId } });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await Appointment.update({ cancelled: true }, { where: { id: appointmentId } });

    const { docId, slotDate, slotTime } = appointment;
    const doctor = await Doctor.findByPk(docId);

    let slots_booked = doctor.slots_booked || {};
    slots_booked[slotDate] = slots_booked[slotDate]?.filter(e => e !== slotTime) || [];

    await Doctor.update({ slots_booked }, { where: { id: docId } });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const listAppointment = async (req, res) => {
  try {
    const userId  = req.user.id;
    const appointments = await Appointment.findAll({ where: { userId } });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment || appointment.cancelled)
      return res.json({ success: false, message: "Appointment Cancelled or not found" });

    const options = {
      amount: appointment.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId.toString(),
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (order.status === "paid") {
      await Appointment.update({ payment: true }, { where: { id: order.receipt } });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const paymentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const { origin } = req.headers;

    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment || appointment.cancelled) {
      return res.json({ success: false, message: "Appointment Cancelled or not found" });
    }

    const user = appointment.userData; // userData is already stored in appointment
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [{
      price_data: {
        currency,
        product_data: { name: "Appointment Fees" },
        unit_amount: appointment.amount * 100,
      },
      quantity: 1,
    }];

    // ✅ Step 1: Create a customer with name and address (for India)
    const customer = await stripeInstance.customers.create({
      email: user.email,
      name: user.name,
      address: {
        line1: user.address?.line1 || "Test Address",
        city: user.address?.city || "Test City",
        postal_code: user.address?.postalCode || "000000",
        state: user.address?.state || "Test State",
        country: "IN"
      }
    });

    // ✅ Step 2: Create Stripe Checkout session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${origin}/verify?success=true&appointmentId=${appointment.id}`,
      cancel_url: `${origin}/verify?success=false&appointmentId=${appointment.id}`,
      line_items,
      mode: "payment",
      customer: customer.id, // pass created customer
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


export const verifyStripe = async (req, res) => {
  try {
    const { appointmentId, success } = req.body;

    if (success === "true") {
      await Appointment.update({ payment: true }, { where: { id: appointmentId } });
      return res.json({ success: true, message: "Payment Successful" });
    }

    res.json({ success: false, message: "Payment Failed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
