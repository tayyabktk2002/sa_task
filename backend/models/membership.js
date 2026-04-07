const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Organization = require('./org');

const Membership = sequelize.define('memberships', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role: {
    type: DataTypes.ENUM('Owner', 'Admin', 'Member', 'Viewer'),
    allowNull: false,
    defaultValue: 'Member'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull : false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  org_id: {
    type: DataTypes.INTEGER,
    allowNull : false,
    references: {
      model: 'organisations',
      key: 'id'
    }
  }
},
{
    freezeTableName: true,
    tableName: 'memberships',
    indexes: [
    {
      unique: true,
      name: 'membership_user_org_unique',
      fields: ['user_id', 'org_id'] 
      // Is se ek user aik org mein do bar add nahi ho sakega
    },
    {
      name: 'membership_user_id_index',
      fields: ['user_id']
      // Is se "User ki saari orgs dikhao" wali query fast ho jayegi
    },
    {
      name: 'membership_org_id_index',
      fields: ['org_id']
      // Is se "Org ke saare members dikhao" wali query fast ho jayegi
    },
    {
      name: 'membership_role_index',
      fields: ['role']
      // Agar humein roles ke hisab se filter karna ho
    }
  ]
}
);

User.hasMany(Membership, { foreignKey: 'user_id' , as : 'memberships' });
Membership.belongsTo(User, { foreignKey: 'user_id' , as : 'user' });

Organization.hasMany(Membership, { foreignKey: 'org_id' , as : 'memberships' });
Membership.belongsTo(Organization, { foreignKey: 'org_id' , as : 'organization' });

module.exports = Membership;