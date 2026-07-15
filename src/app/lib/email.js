import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendEmail({ to, subject, html, images = [] }) {
  // Append images cleanly at the bottom of the content if any exist
  let enrichedHtml = html;
  if (images.length > 0) {
    const imageTags = images.map(img => `<img src="${img}" alt="Attached Asset" style="max-width:100%; margin-top:10px; border-radius:8px;" />`).join('');
    enrichedHtml += `<div style="margin-top:20px; padding-top:20px; border-top:1px solid #eee;">${imageTags}</div>`;
  }

  return await resend.emails.send({
    from: 'Marketing Hub <noreply@yourdomain.com>', // Verified domain in Resend dashboard
    to,
    subject,
    html: enrichedHtml,
  });
}