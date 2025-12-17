import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    logger: true,
    debug: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

export const SendMail = async (mailOptions: Mail.Options) => {
    try {
        const response = await transporter.sendMail(mailOptions)
        return response
    } catch (error) {
        console.error("Email send failed:", error);
        return null; // do NOT crash API
    }
}