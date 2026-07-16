export async function sendEmail({ to, subject, html, images = [] }) {
  let enrichedHtml = html;
  if (images.length > 0) {
    const imageTags = images.map(img => `<img src="${img}" alt="Attached Asset" style="max-width:100%; margin-top:10px; border-radius:8px;" />`).join('');
    enrichedHtml += `<div style="margin-top:20px; padding-top:20px; border-top:1px solid #eee;">${imageTags}</div>`;
  }

  return await resend.emails.send({
    // 🌟 THE FREE FIX: Use Resend's free default sandbox testing email address
    from: 'Marketing Hub <onboarding@resend.dev>', 
    to,
    subject,
    html: enrichedHtml,
  });
}