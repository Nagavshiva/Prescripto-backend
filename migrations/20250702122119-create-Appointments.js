'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('appointments', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
    userId:     { type: Sequelize.STRING, allowNull: false },
    docId:      { type: Sequelize.STRING, allowNull: false },
    slotDate:   { type: Sequelize.STRING, allowNull: false },
    slotTime:   { type: Sequelize.STRING, allowNull: false },
    userData:   { type: Sequelize.JSON,   allowNull: false },
    docData:    { type: Sequelize.JSON,   allowNull: false },
    amount:     { type: Sequelize.FLOAT,  allowNull: false },
    date:       { type: Sequelize.BIGINT, allowNull: false },
    cancelled:  { type: Sequelize.BOOLEAN, defaultValue: false },
    payment:    { type: Sequelize.BOOLEAN, defaultValue: false },
    isCompleted:{ type: Sequelize.BOOLEAN, defaultValue: false },
    createdAt:  { type: Sequelize.DATE,    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updatedAt:  { type: Sequelize.DATE,    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('appointments');
}
