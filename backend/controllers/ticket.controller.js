const Ticket = require("../models/ticket");
const AuditLog = require("../models/audit-log");
const sequelize = require("../config/db");

exports.createTicket = async (req, res) => {
  try {
    const { title, description, severity, tags } = req.body;
    const t = await sequelize.transaction();

    const ticket = await Ticket.create(
      {
        title,
        description,
        severity,
        tags,
        org_id: req.orgId,
        created_by: req.user.id,
      },
      { transaction: t },
    );

    await AuditLog.create(
      {
        org_id: req.orgId,
        user_id: req.user.id,
        target_id: ticket.id,
        action_type: "TICKET_CREATED",
        message: `Ticket "${title}" was created.`,
      },
      { transaction: t },
    );

    await t.commit();
    res
      .status(201)
      .json({ success: true, message: "Ticket created successfully!" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};
