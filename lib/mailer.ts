import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: true },
  });
}

export function getMailer(): nodemailer.Transporter {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const mailer = getMailer();
  try {
    await mailer.sendMail({
      from: `"CoDE Club" <${process.env.EMAIL_USER}>`,
      ...options,
    });
  } catch (err) {
    // Reset transporter on failure so it reconnects next time
    transporter = null;
    throw err;
  }
}
