const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Organization = require('./org');
const User = require('./user');

const Ticket = sequelize.define('tickets', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Open', 'Investigating', 'Mitigated', 'Resolved'),
    defaultValue: 'Open',
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Low',
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  org_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organisations',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  freezeTableName: true,
  tableName: 'tickets',
  timestamps: true,
  indexes: [
    {
      fields: ['org_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

Organization.hasMany(Ticket, { foreignKey: 'org_id', as: 'tickets' });
Ticket.belongsTo(Organization, { foreignKey: 'org_id', as: 'organization' });

User.hasMany(Ticket, { foreignKey: 'created_by', as: 'createdTickets' });
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Ticket, { foreignKey: 'assigned_to', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

module.exports = Ticket;