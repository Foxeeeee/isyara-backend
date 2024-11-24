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

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
