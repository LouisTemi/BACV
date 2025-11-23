require('dotenv').config({ path: `${__dirname}/../.env` });
const nodemailer = require("nodemailer");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
global.appRoot = path.resolve(__dirname);

const sendEmail = async(receiverEmail, receiverName, txnHash, pdfFileRaw, rootServer) => {
  console.log('Preparing to send email...');
  console.log('Receiver:', receiverEmail);
  console.log('Transaction Hash:', txnHash);
  
  // Use Ethereal for testing (fake SMTP - emails viewable at ethereal.email)
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL,
      pass: process.env.ETHEREAL_PASSWORD,
    },
  });

  console.log("Email transporter created");
  
  // Create QR code file
  const qrCodeFile = `${appRoot}/../uploads/${Date.now()}_qrcode.png`;
  console.log("Creating QR code at:", qrCodeFile);

  // Generate QR code with verification URL
  const verificationUrl = `${rootServer}/${txnHash}`;
  await QRCode.toFile(qrCodeFile, verificationUrl);
  console.log("QR code created for URL:", verificationUrl);

  // Read QR code as base64 for embedding in email
  const qrCodeBase64 = fs.readFileSync(qrCodeFile, { encoding: 'base64' });

  const pdfFile = {
    filename: pdfFileRaw.filename, 
    path: pdfFileRaw.path
  };

  const htmlTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1a73e8;">Certificate Issued Successfully</h2>
    <p>Dear ${receiverName},</p>
    <p>Congratulations on your graduation! Your PDF certificate is attached to this email.</p>
    <p>Your certificate has been stored on the Ethereum blockchain with the following transaction hash:</p>
    <p style="background-color: #f5f5f5; padding: 10px; font-family: monospace; word-break: break-all;">
      ${txnHash}
    </p>
    <p>Your certificate can never be tampered with. You can ask your future employers to either:</p>
    <ul>
      <li>Click this <a href="${verificationUrl}" style="color: #1a73e8;">verification link</a></li>
      <li>Or scan the QR code below:</li>
    </ul>
    <p><img src="cid:qrcode" alt="QR Code for verification" style="width: 150px; height: 150px;"/></p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="color: #666; font-size: 12px;">This is an automated message from Verificate - A blockchain-based certificate verification system.</p>
  </div>
  `;
  
  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Verificate" <certificates@verificate.com>',
    to: receiverEmail,
    subject: "Your Graduation Certificate - Blockchain Verified",
    text: `Dear ${receiverName}, Congratulations on your graduation. Your transaction hash for verification: ${txnHash}. Verification link: ${verificationUrl}`,
    html: htmlTemplate,
    attachments: [
      pdfFile,
      {
        filename: 'qrcode.png',
        path: qrCodeFile,
        cid: 'qrcode' // Referenced in the HTML as cid:qrcode
      }
    ]
  });

  console.log("Message sent successfully!");
  console.log("Message ID:", info.messageId);
  
  // IMPORTANT: Preview URL for Ethereal (view the email online)
  console.log("========================================");
  console.log("VIEW EMAIL AT: %s", nodemailer.getTestMessageUrl(info));
  console.log("========================================");
  
  // Clean up QR code file
  fs.unlinkSync(qrCodeFile);
  
  return info;
};

module.exports = sendEmail;