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
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Check if we're using real email service or Ethereal (for testing)
  const useGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.NODE_ENV === 'production';
  
  let transporter;
  
  if (useGmail) {
    // Production: Use Gmail
    console.log("Using Gmail for production email");
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else {
    // Development: Use Ethereal (fake SMTP for testing)
    console.log("Using Ethereal for development email");
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    });
  }

  console.log("Email transporter created");
  
  try {
    // Create QR code file
    const qrCodeFile = `${appRoot}/../uploads/${Date.now()}_qrcode.png`;
    console.log("Creating QR code at:", qrCodeFile);

    // Generate QR code with verification URL
    const verificationUrl = `${rootServer}/${txnHash}`;
    await QRCode.toFile(qrCodeFile, verificationUrl);
    console.log("QR code created for URL:", verificationUrl);

    const pdfFile = {
      filename: pdfFileRaw.filename, 
      path: pdfFileRaw.path
    };

    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎓 Certificate Issued</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #111827; margin-top: 0;">Dear ${receiverName},</h2>
        <p style="color: #374151; line-height: 1.6;">
          Congratulations on your graduation! Your academic certificate has been successfully issued and permanently stored on the Ethereum blockchain.
        </p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">✓ Your certificate is now blockchain-verified</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          Your PDF certificate is attached to this email. Keep it safe!
        </p>
        
        <h3 style="color: #111827;">Transaction Hash:</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="font-family: monospace; color: #2563eb; word-break: break-all; margin: 0; font-size: 13px;">
            ${txnHash}
          </p>
        </div>
        
        <h3 style="color: #111827; margin-top: 30px;">Verify Your Certificate:</h3>
        <p style="color: #374151; line-height: 1.6;">
          Anyone can verify the authenticity of your certificate by:
        </p>
        <ul style="color: #374151; line-height: 1.8;">
          <li>Clicking this <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">verification link</a></li>
          <li>Scanning the QR code below with their phone</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="cid:qrcode" alt="QR Code for verification" style="width: 180px; height: 180px; border: 2px solid #e5e7eb; border-radius: 8px;"/>
          <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">Scan to verify instantly</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Important:</strong> Your certificate cannot be altered or forged. The blockchain ensures its permanent authenticity.
          </p>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          This is an automated message from <strong>BACV</strong> - Blockchain Academic Certificate Verification
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin: 5px 0 0 0;">
          Powered by Ethereum Blockchain
        </p>
      </div>
    </div>
    `;
    
    // Determine sender email
    const fromEmail = useGmail 
      ? `BACV Certificates <${process.env.GMAIL_USER}>`
      : '"Verificate" <certificates@verificate.com>';
    
    console.log("Sending email from:", fromEmail);
    console.log("Sending email to:", receiverEmail);
    
    // Send mail
    const info = await transporter.sendMail({
      from: fromEmail,
      to: receiverEmail,
      subject: "🎓 Your Academic Certificate - Blockchain Verified",
      text: `Dear ${receiverName}, Congratulations on your graduation. Your certificate has been issued on the blockchain. Transaction hash: ${txnHash}. Verification link: ${verificationUrl}`,
      html: htmlTemplate,
      attachments: [
        pdfFile,
        {
          filename: 'verification-qrcode.png',
          path: qrCodeFile,
          cid: 'qrcode'
        }
      ]
    });

    console.log("✅ Message sent successfully!");
    console.log("Message ID:", info.messageId);
    
    // If using Ethereal (development), show preview URL
    if (!useGmail) {
      console.log("========================================");
      console.log("VIEW TEST EMAIL AT: %s", nodemailer.getTestMessageUrl(info));
      console.log("========================================");
    } else {
      console.log("✅ Real email sent via Gmail to:", receiverEmail);
    }
    
    // Clean up QR code file
    fs.unlinkSync(qrCodeFile);
    
    return info;
    
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    console.error("Error details:", error.message);
    throw error;
  }
};

module.exports = sendEmail;