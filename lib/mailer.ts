import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function createTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();

  if (!user || !pass) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASSWORD must be set in your .env file. " +
      "Use a Gmail App Password for EMAIL_PASSWORD (not your regular Gmail password)."
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
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
      from: `"CoDE Club" <${process.env.EMAIL_USER?.trim()}>`,
      ...options,
    });
  } catch (err) {
    // Reset transporter on failure so it reconnects next time
    transporter = null;
    throw err;
  }
}
