import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './userModel.js';

const Appointment = sequelize.define('Appointment', {
  userId: { type: DataTypes.STRING, allowNull: false },
  docId: { type: DataTypes.STRING, allowNull: false },
  slotDate: { type: DataTypes.STRING, allowNull: false },
  slotTime: { type: DataTypes.STRING, allowNull: false },
  userData: { type: DataTypes.JSON, allowNull: false },
  docData: { type: DataTypes.JSON, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.INTEGER, allowNull: false },
  cancelled: { type: DataTypes.BOOLEAN, defaultValue: false },
  payment: { type: DataTypes.BOOLEAN, defaultValue: false },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true
});

// ✅ Define association
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Appointment;
