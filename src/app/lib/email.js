import { Resend } from 'resend';

// Initialize Resend SDK instance using your environment variable
export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, images = [] }) {
  let enrichedHtml = html;
  
  // Attach inline images if present
  if (Array.isArray(images) && images.length > 0) {
    const imageTags = images
      .map(
        (img) =>
          `<img src="${img}" alt="Attached Asset" style="max-width:100%; margin-top:10px; border-radius:8px;" />`
      )
      .join('');
    enrichedHtml += `<div style="margin-top:20px; padding-top:20px; border-top:1px solid #eee;">${imageTags}</div>`;
  }

  // Determine sender address
  // 'onboarding@resend.dev' works for free testing (delivers ONLY to your account email).
  // Replace with 'orders@yourdomain.com' once your custom domain DNS is verified in Resend.
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Marketing Hub <onboarding@resend.dev>';

  return await resend.emails.send({
    from: fromAddress,
    to: Array.isArray(to) ? to : [to],
    subject,
    html: enrichedHtml,
  });
}