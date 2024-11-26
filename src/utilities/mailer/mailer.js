import { transporter } from "./transporter.js";
import "dotenv/config";

export const sendEmail = async (to, subject, html) => {
  try {
    const mail = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
