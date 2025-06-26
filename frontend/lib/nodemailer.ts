import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASSWORD
    }
})

export async function sendEmail(emailData:{
    to: string,
    subject: string,
    text: string
}):Promise<boolean>
{
    try{
        await transporter.sendMail({
            from: process.env.EMAIL_HOST,
            to: emailData.to,             // Destination email
            subject: emailData.subject,
            text: emailData.text,
        });
        return true
    }
    catch(error){
        return false
    }
}