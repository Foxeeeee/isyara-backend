import { transporter } from "./transporter.js";
import "dotenv/config";

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mail = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      text,
      html,
    });

    return { success: true, message: `Email sent to ${mail.messageId}` };
  } catch (error) {
    return { success: false, message: "Failed to send email" };
  }
};
