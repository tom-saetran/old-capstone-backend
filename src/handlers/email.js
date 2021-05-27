import sgMail from "@sendgrid/mail"

const sendEmailTest = async email => {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            replyTo: process.env.SENDGRID_REPLYTO_EMAIL,
            subject: "Email Test",
            text: "This is a test email",
            html: '<div style="color: green;">This is a test email</div>'
        }

        await sgMail.send(msg)
    } catch (error) {
        console.log(error)
    }
}

export default sendEmailTest
