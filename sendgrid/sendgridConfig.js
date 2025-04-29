import "dotenv/config";
import sgMail from "@sendgrid/mail";
// const sgMail = require("@sendgrid/mail");

// Set your SendGrid API key

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send an email with static content

export const sendVerificationEmail = async (
  toEmail,
  verificationToken,
  templates
) => {
  const msg = {
    to: toEmail, // Recipient's email address

    from: "hello@scalework.com", // Your verified sender email

    subject: "G-Client", // Subject line

    text: "Hello! This is a static email with plain text.", // Plain text body

    html: templates.replace("{verificationCode}", verificationToken), // HTML body
  };

  try {
    const response = await sgMail.send(msg);

    console.log(response[0].statusCode);
    console.log(response[0].headers);

    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body?.errors || error
    );
  }
};

export const sendPasswordResetEmail = async (toEmail, resetURL, templates) => {
  const msg = {
    to: toEmail, // Recipient's email address

    from: "hello@scalework.com", // Your verified sender email

    subject: "Reset your password", // Subject line

    text: "Hello! This is a static email with plain text.", // Plain text body

    html: templates.replace("{resetURL}", resetURL), // HTML body
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body?.errors || error
    );
  }
};

export const sendResetSuccessEmail = async (toEmail, templates) => {
  const msg = {
    to: toEmail, // Recipient's email address

    from: "hello@scalework.com", // Your verified sender email

    subject: "G-client", // Subject line

    text: "Hello! This is a static email with plain text.", // Plain text body

    html: templates, // HTML body
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body?.errors || error
    );
  }
};

export const sendWelcomeEmail = async (toEmail, name, templates) => {
  const msg = {
    to: toEmail, // Recipient's email address

    from: "hello@scalework.com", // Your verified sender email

    subject: "G-Client", // Subject line

    text: "Hello! This is a static email with plain text.", // Plain text body

    html: templates.replace("{userName}", name), // HTML body
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body?.errors || error
    );
  }
};

export const sendLearnerCredentials = async (toEmail, password, templates) => {
  const msg = {
    to: toEmail, // Recipient's email address

    from: "hello@scalework.com", // Your verified sender email

    subject: "Static Email Subject", // Subject line

    text: "Hello! This is a static email with plain text.", // Plain text body

    html: templates.replace("{password}", password), // HTML body
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body?.errors || error
    );
  }
};

export const sendLearnerPendingInvoice = async (toEmail, templates) => {
  const msg = {
    to: toEmail,
    from: "hello@scalework.com",
    subject: "Your Pending Invoice",
    html: templates,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body?.errors || error
    );
  }
};
