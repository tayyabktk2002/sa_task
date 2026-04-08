// models/comment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Ticket = require('./ticket');
const Organization = require('./org');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            eitherContentOrAttachment() {
                if (!this.content && !this.attachments) {
                    throw new Error('Comment must have either text or an attachment.');
                }
            }
        }
    },
    ticket_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tickets', key: 'id' }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'organisations', key: 'id' }
    },
    attachments: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'comments'
});

Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Comment.belongsTo(Organization, { foreignKey: 'org_id', as: 'organization' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Ticket.hasMany(Comment, { foreignKey: 'ticket_id', as: 'comments' });
Organization.hasMany(Comment, { foreignKey: 'org_id', as: 'comments' });

module.exports = Comment;