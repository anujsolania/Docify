import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Use port 587 instead of 465 for better cloud compatibility
    secure: false, // Use STARTTLS instead of SSL
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 30000, // 30 seconds
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
})

// Verify transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Configuration Error:', error);
    } else {
        console.log('SMTP Server is ready to send emails');
    }
});

export const SendMail = async (mailOptions: Mail.Options) => {
    try {
        const response = await transporter.sendMail(mailOptions)
        return response
    } catch (error) {
        console.error('Email sending error:', error);
        throw error
    }
}