import sgMail from '@sendgrid/mail';
import Mail from "nodemailer/lib/mailer";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const SendMail = async (mailOptions: Mail.Options) => {
    try {
        const response = await sgMail.send({
            to: mailOptions.to as string,
            from: (mailOptions.from as string) || process.env.EMAIL as string,
            subject: mailOptions.subject as string,
            text: mailOptions.text as string,
            html: mailOptions.html as string,
        });
        return response;
    } catch (error) {
        throw error;
    }
}