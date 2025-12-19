const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'saisimhadri2207@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'uwoh jbrk wbjd uqcv'
  }
});

async function sendWelcomeEmail(userEmail, userName) {
  try {
    await transporter.sendMail({
      from: '"FoodApp" <saisimhadri2207@gmail.com>',
      to: userEmail,
      subject: 'Welcome to FoodApp!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">FoodApp</h1>
          </div>
          
          <h2 style="color: #333;">Welcome, ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with FoodApp. We're excited to have you on board!
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            With FoodApp, you can:
          </p>
          
          <ul style="color: #666; line-height: 1.8;">
            <li>Browse our delicious menu</li>
            <li>Book your preferred pickup time slot</li>
            <li>Track your order status in real-time</li>
            <li>Receive email confirmations for all orders</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" 
               style="background: linear-gradient(135deg, #f97316, #ea580c); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px;
                      font-weight: bold;">
              Start Ordering
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent from FoodApp. 
            If you didn't register, please ignore this email.
          </p>
        </div>
      `
    });
    console.log('Welcome email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    return false;
  }
}

async function sendOrderConfirmationEmail(userEmail, userName, orderDetails) {
  try {
    const itemsList = orderDetails.items.map(item =>
      `<li>${item.name} x ${item.quantity} - Rs.${item.subtotal}</li>`
    ).join('');

    await transporter.sendMail({
      from: '"FoodApp" <saisimhadri2207@gmail.com>',
      to: userEmail,
      subject: `Order Confirmed - ${orderDetails.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">FoodApp</h1>
          </div>
          
          <h2 style="color: #22c55e;">Order Confirmed!</h2>
          
          <p style="color: #666;">Hi ${userName},</p>
          <p style="color: #666;">Your order has been confirmed. Here are the details:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p style="margin: 0 0 10px 0;"><strong>Pickup Slot:</strong> ${orderDetails.slotTime}</p>
            <p style="margin: 0;"><strong>Total:</strong> Rs.${orderDetails.total}</p>
          </div>
          
          <h3 style="color: #333;">Order Items:</h3>
          <ul style="color: #666; line-height: 1.8;">${itemsList}</ul>
          
          <p style="color: #666; margin-top: 30px;">
            We'll notify you when your order is ready for pickup!
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Thank you for ordering with FoodApp!
          </p>
        </div>
      `
    });
    console.log('Order confirmation email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
    return false;
  }
}

async function sendOTPEmail(userEmail, userName, otp) {
  try {
    await transporter.sendMail({
      from: '"FoodApp" <saisimhadri2207@gmail.com>',
      to: userEmail,
      subject: 'Password Reset OTP - FoodApp',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #f97316; margin: 0;">FoodApp</h1>
                    </div>
                    
                    <h2 style="color: #333;">Password Reset Request</h2>
                    
                    <p style="color: #666;">Hi ${userName},</p>
                    <p style="color: #666;">You requested to reset your password. Use the OTP below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background: #f5f5f5; display: inline-block; padding: 20px 40px; border-radius: 8px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">
                                ${otp}
                            </span>
                        </div>
                    </div>
                    
                    <p style="color: #666;">This OTP is valid for 10 minutes.</p>
                    <p style="color: #666;">If you didn't request this, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        FoodApp - Secure Password Reset
                    </p>
                </div>
            `
    });
    console.log('OTP email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOTPEmail
};
