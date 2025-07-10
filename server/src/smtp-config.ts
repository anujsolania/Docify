import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
    port: 465,
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_
    },
    secure: true
})

export const SendMail = async (mailOptions: Mail.Options) => {
    try {
        const response = await transporter.sendMail(mailOptions)
        return response
    } catch (error) {
        throw error
    }
}