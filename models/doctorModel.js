// models/Doctor.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Doctor = sequelize.define('Doctor', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  speciality: { type: DataTypes.STRING, allowNull: false },
  degree: { type: DataTypes.STRING, allowNull: false },
  experience: { type: DataTypes.STRING, allowNull: false },
  about: { type: DataTypes.STRING, allowNull: false },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  fees: { type: DataTypes.INTEGER, allowNull: false },
  slots_booked: { type: DataTypes.JSON, defaultValue: {} },
  address: { type: DataTypes.JSON, allowNull: false },
  date: { type: DataTypes.INTEGER, allowNull: false }
},{
  timestamps: true // includes createdAt, updatedAt
});

export default Doctor;
