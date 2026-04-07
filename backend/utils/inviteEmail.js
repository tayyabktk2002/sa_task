import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendInviteEmail = async (to, inviteLink, orgName) => {
    const mailOptions = {
        from: `"Task Home" ${process.env.SMTP_USER}`,
        to,
        subject: `Invitation to join ${orgName} on Task Home`,
        html: `
      <div style="font-family: sans-serif; background: #0f172a; color: white; padding: 20px; border-radius: 10px;">
        <h2 style="color: #3b82f6;">You've been invited!</h2>
        <p>You have been invited to join <strong>${orgName}</strong> as a team member.</p>
        <a href="${inviteLink}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
          Accept Invitation
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">If you didn't expect this, you can ignore this email.</p>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendInviteEmail };