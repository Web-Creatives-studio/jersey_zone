import { NextResponse } from 'next/server';
import { sendEmail } from '../../lib/email';

export async function GET() {
  try {
    const data = await sendEmail({
      to: 'olodudeokiki@gmail.com', // Must match your Resend account email while on free onboarding domain
      subject: 'Resend Pipeline Verification ⚽',
      html: '<h1>It Works!</h1><p>Resend is successfully configured and working.</p>',
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Test Email Failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}