import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  try {
    console.log('Sending email...');
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'qaz.vhnqn@gmail.com',
      subject: 'Test Resend',
      html: '<p>Test</p>',
    });
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
