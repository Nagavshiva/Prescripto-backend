import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // your DB connection

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    defaultValue:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '000000000'
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: 'Not Selected'
  },
  dob: {
    type: DataTypes.STRING,
    defaultValue: 'Not Selected'
  },
  address_line1: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  address_line2: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true // includes createdAt, updatedAt
});

export default User;
