import sgMail from "@sendgrid/mail";
import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email inviata a:", to);
  } catch (error) {
    console.error("Errore invio email:", error);
    if (error.response) console.error(error.response.body);
    throw new Error("Errore nell'invio dell'email");
  }
};

export default sendEmail;
