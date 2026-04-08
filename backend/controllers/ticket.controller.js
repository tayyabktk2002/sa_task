const Ticket = require("../models/ticket");
const sequelize = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { auditLogEvent } = require('../utils/auditLog');
const Organization = require("../models/org");
const User = require("../models/user");
const cloudinary = require('../utils/cloudinary');

const { Op } = require('sequelize');
const Comment = require('../models/comment');
const { seedTicketsForOrg } = require('../seed/seedTicket');
const { isFileSignatureValid } = require("../utils/fileCheck");



const createTicket = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, severity, assignee, tags } = req.body;
    if (assignee) {
      const user = await User.findOne({ where: { id: assignee, org_id: req.orgId } });
      if (!user) return errorResponse(res, "Assignee not found", 404);
    }

    const ticket = await Ticket.create({
      title,
      description,
      severity,
      status: 'Open',
      tags: tags || null,
      org_id: req.orgId,
      created_by: req.userId,
      assigned_to: assignee || null
    }, { transaction: t });

    await auditLogEvent({
      user_id: req.userId,
      org_id: req.orgId,
      action_type: "TICKET_CREATED",
      message: `New ticket created: ${title}`,
      details: { ticket_id: ticket.id, severity }
    }, t);

    await t.commit();
    return successResponse(res, "Ticket created successfully!", { ticket }, 201);
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
};

const addComment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const file = req.file;

    if (!content && !file) {
      return errorResponse(res, "Comment must have either text content or an attachment, or both.", 400);
    }

    if (file) {
      const size = Number(file.size || file.buffer?.length || 0);
      if (size <= 0) return errorResponse(res, "Invalid file upload", 400);
      if (size > 5 * 1024 * 1024) return errorResponse(res, "File too large (max 5MB)", 400);
      if (!isFileSignatureValid(file)) return errorResponse(res, "Invalid or unsafe file type", 400);
    }

    const ticket = await Ticket.findOne({ where: { id: ticketId, org_id: req.orgId } });
    if (!ticket) return errorResponse(res, "Ticket not found", 404);

    let attachmentData = null;
    if (file) {
      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        folder: `sparking-asia/tickets/${req.orgId}/${ticketId}`,
        resource_type: "auto"
      });
      attachmentData = {
        file_name: file.originalname,
        file_url: result.secure_url,
        file_type: file.mimetype,
        cloudinary_public_id: result.public_id
      };
    }

    const comment = await Comment.create({
      ticket_id: ticketId,
      user_id: req.userId,
      org_id: req.orgId,
      content: content || null,
      attachments: attachmentData ? [attachmentData] : null
    }, { transaction: t });

    const user = await User.findByPk(req.userId);

    let message = "";
    let action_type = "";
    if (content && file) {
      message = `Comment added and file ${file.originalname} uploaded to ticket ${ticket.title}`;
      action_type = "TICKET_COMMENT_WITH_ATTACHMENT_ADDED";
    } else if (content) {
      message = `Comment added to ticket ${ticket.title}`;
      action_type = "TICKET_COMMENT_ADDED";
    } else if (file) {
      message = `File ${file.originalname} uploaded to ticket ${ticket.title}`;
      action_type = "TICKET_ATTACHMENT_UPLOADED";
    }

    await auditLogEvent({
      user_id: req.userId,
      org_id: req.orgId,
      action_type: action_type,
      message: message,
      details: { ticket_id: ticketId, comment_id: comment.id, file_url: attachmentData ? attachmentData.file_url : null }
    }, { transaction: t });

    await t.commit();

    const commentData = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user_id: comment.user_id,
      user_name: user ? user.name : "Unknown User",
      ticket_id: comment.ticket_id,
      attachments: comment.attachments
    };

    return successResponse(res, "Comment added successfully!", { comment: commentData }, 201);
  } catch (error) {
    await t.rollback();
    console.error("Add comment/upload file error:", error);
    return errorResponse(res, error.message, 500);
  }
};

const getTickets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const cursor = req.query.cursor || null;

    let queryFilters = {};
    if (req.query.filters) {
      try { queryFilters = JSON.parse(req.query.filters); } catch (e) { console.error('Filter parse error', e); }
    }

    const { status, severity, assigned_to, tags, date_from, date_to, search } = queryFilters;

    const whereClause = { org_id: req.orgId };

    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (assigned_to) whereClause.assigned_to = assigned_to;

    if (tags && tags.length > 0) {
      whereClause.tags = { [Op.overlap]: tags };
    }

    if (date_from || date_to) {
      whereClause.createdAt = {};
      if (date_from) whereClause.createdAt[Op.gte] = new Date(date_from);
      if (date_to) whereClause.createdAt[Op.lte] = new Date(date_to);
    }

    if (cursor) {
      const [cursorCreatedAt, cursorId] = cursor.split('_');
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [
          { createdAt: { [Op.lt]: new Date(cursorCreatedAt) } },
          {
            [Op.and]: [
              { createdAt: new Date(cursorCreatedAt) },
              { id: { [Op.lt]: cursorId } }
            ]
          }
        ]
      });
    }

    if (search) {
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { '$comments.content$': { [Op.iLike]: `%${search}%` } }
        ]
      });
    }

    const include = [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email']
      }
    ];

    if (search) {
      include.push({
        model: Comment,
        as: 'comments',
        attributes: [],
        required: false
      });
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include,
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit: limit + 1,
      subQuery: search ? false : true,
      distinct: true
    });

    let nextCursor = null;
    if (tickets.length > limit) {
      const lastTicket = tickets[tickets.length - 1];
      nextCursor = `${lastTicket.createdAt.toISOString()}_${lastTicket.id}`;
      tickets.pop();
    }

    const ticketData = tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      severity: ticket.severity,
      status: ticket.status,
      tags: ticket.tags,
      timestamps: ticket.timestamps,
      org_id: ticket.org_id,
      org_name: ticket.organization.name,
      created_by: ticket.creator.name,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      assignee: ticket.assignee,
    }));

    return successResponse(res, "Tickets fetched successfully!", { tickets: ticketData, nextCursor }, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getTicketById = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOne({
      where: {
        id,
        org_id: req.orgId,
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'createdAt', 'updatedAt', 'user_id', 'attachments'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['name']
          }]
        },
      ]
    }, { transaction: t });

    if (!ticket) return errorResponse(res, "Ticket not found", 404);

    const ticketData = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      severity: ticket.severity,
      status: ticket.status,
      tags: ticket.tags || [],
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      org_id: ticket.org_id,
      org_name: ticket.organization.name,
      created_by: ticket.creator.name,
      creator: ticket.creator,
      assigned_to: ticket.assigned_to,
      assignee: ticket.assignee,
      comments: ticket.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user_id: comment.user_id,
        user_name: comment.user.name,
        ticket_id: comment.ticket_id,
        attachments: comment.attachments
      })),
    };

    await t.commit();
    return successResponse(res, "Ticket fetched successfully!", { ticket: ticketData }, 200);
  } catch (error) {
    console.log("Error in getTicketById", error);

    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  const t = await sequelize.transaction();

  try {
    const ticket = await Ticket.findOne({ where: { id, org_id: req.orgId } });
    if (!ticket) return errorResponse(res, "Ticket not found", 404);

    if (!isValidTransition(ticket.status, newStatus)) {
      return errorResponse(res, `Invalid transition from ${ticket.status} to ${newStatus}`, 400);
    }

    const oldStatus = ticket.status;

    await ticket.update({ status: newStatus }, { transaction: t });

    await auditLogEvent({
      user_id: req.userId,
      org_id: req.orgId,
      action_type: "TICKET_STATUS_UPDATED",
      message: `Status changed from ${oldStatus} to ${newStatus}`,
      details: {
        ticket_id: id,
        old_value: { status: oldStatus },
        new_value: { status: newStatus }
      }
    }, t);

    await t.commit();
    return successResponse(res, "Status updated successfully!");
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
};

const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { title, description, severity, assignee, status, tags, timestamps } = req.body;
  const t = await sequelize.transaction();

  try {
    const ticket = await Ticket.findOne({ where: { id, org_id: req.orgId } });
    if (!ticket) return errorResponse(res, "Ticket not found", 404);

    await ticket.update({ title, description, severity, assignee, status, tags, timestamps }, { transaction: t });

    await auditLogEvent({
      user_id: req.userId,
      org_id: req.orgId,
      action_type: "TICKET_UPDATED",
      message: `Ticket updated successfully!`,
      details: {
        ticket_id: id,
      }
    }, t);

    await t.commit();
    return successResponse(res, "Status updated successfully!");
  } catch (error) {
    await t.rollback();
    return errorResponse(res, error.message, 500);
  }
};

const ticketStats = async (req, res) => {
  try {
    const stats = await Ticket.findAll({
      where: { org_id: req.orgId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    return successResponse(res, "Ticket stats fetched successfully!", stats, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

const seedTickets = async (req, res) => {
  try {
    const requestedCount = Number(req.body?.count);
    const seedCount = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 1000;
    const orgId = req.orgId;
    const userId = req.userId;

    const org = await Organization.findByPk(orgId);
    if (!org) return errorResponse(res, "Organization not found", 404);

    const { inserted } = await seedTicketsForOrg({ orgId, userId, count: seedCount });

    await auditLogEvent({
      user_id: userId,
      org_id: orgId,
      action_type: "TICKETS_SEEDED",
      message: `Seeded ${inserted} tickets in ${org.name}`,
      details: { inserted }
    });

    return successResponse(res, "Tickets seeded successfully!", { inserted }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { createTicket, getTickets, getTicketById, updateTicketStatus, updateTicket, ticketStats, addComment, seedTickets };
