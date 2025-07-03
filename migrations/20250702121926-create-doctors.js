'use strict';

// migrations/YYYYMMDDHHMMSS-create-doctor.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('doctors', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
    name:       { type: Sequelize.STRING,  allowNull: false },
    email:      { type: Sequelize.STRING,  allowNull: false, unique: true },
    password:   { type: Sequelize.STRING,  allowNull: false },
    image:      { type: Sequelize.STRING,  allowNull: false },
    speciality: { type: Sequelize.STRING,  allowNull: false },
    degree:     { type: Sequelize.STRING,  allowNull: false },
    experience: { type: Sequelize.STRING,  allowNull: false },
    about:      { type: Sequelize.TEXT,    allowNull: false },
    available:  { type: Sequelize.BOOLEAN, defaultValue: true },
    fees:       { type: Sequelize.FLOAT,   allowNull: false },
    slots_booked: { type: Sequelize.JSON, defaultValue: {} },
    address:    { type: Sequelize.JSON,    allowNull: false },
    date:       { type: Sequelize.BIGINT,  allowNull: false },
    createdAt:  { type: Sequelize.DATE,    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updatedAt:  { type: Sequelize.DATE,    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('doctors');
}

