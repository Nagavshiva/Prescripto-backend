'use strict';

'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: Sequelize.STRING,
      defaultValue: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    phone: {
      type: Sequelize.STRING,
      defaultValue: '000000000',
    },
    address_line1: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    address_line2: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    gender: {
      type: Sequelize.STRING,
      defaultValue: 'Not Selected',
    },
    dob: {
      type: Sequelize.STRING,
      defaultValue: 'Not Selected',
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users');
}

