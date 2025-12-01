require('dotenv').config();
const nodemailer = require('nodemailer');

async function testResend() {
    console.log('Testing Resend API...');
    console.log('API Key (first 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10));
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: 'BACV Test <onboarding@resend.dev>',
            to: 'lyfatuxi@forexzig.com', // Your test email
            subject: 'Test Email from BACV',
            text: 'This is a test email to verify Resend works.',
            html: '<p>This is a <strong>test email</strong> to verify Resend works.</p>',
        });
        
        console.log('✅ SUCCESS! Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
    }
}

testResend();
