// src/helpers/sendVerificationEmail.tsx

import sgMail from '@sendgrid/mail';
import VerificationEmail from '../../emails/VerificationEmail';
import { ApiResponse } from '@/types/ApiResponse';
import { render } from '@react-email/render';
import React from 'react';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Set the SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    // Render the VerificationEmail component to an HTML string
    const emailHtml = await render(<VerificationEmail username={username} otp={verifyCode} />);

    // Create the email message
    const msg = {
      to: email, // Recipient's email address
      from: process.env.SENDGRID_SENDER_EMAIL as string, // Verified sender email
      subject: 'Cloak Feedback | Verification Code',
      text: `Hello ${username},

Your verification code is: ${verifyCode}

If you did not request this code, please ignore this email.`,
      html: emailHtml,
    };

    // Send the email
    await sgMail.send(msg);

    return { success: true, message: 'Verification email sent successfully' };
  } catch (emailError) {
    console.error('Error sending verification email', emailError);
    return { success: false, message: 'Failed to send verification email' };
  }
}
