const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Organization = sequelize.define('organizations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name : {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,   
    validate: { notEmpty: true }
  },
},{
    freezeTableName: true,
    tableName: 'organisations',
    indexes: [
      {
        fields: ['name']
      }
    ]
});



module.exports = Organization;