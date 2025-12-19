import sgMail, { MailDataRequired } from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const SendMail = async (mailData: MailDataRequired) => {
    try {
        const response = await sgMail.send(mailData);
        return response;
    } catch (error) {
        throw error;
    }
};