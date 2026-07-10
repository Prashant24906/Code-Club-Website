import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, subject, message } = await request.json();

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send email to admin
    await sendMail({
      to: "prajyotyt18@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to user
    await sendMail({
      to: email,
      subject: "We received your message",
      html: `
        <h2>Thank You for Contacting Us!</h2>
        <p>Hi ${firstName},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <br>
        <p>Best regards,<br>CoDE Club</p>
      `,
    });

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
