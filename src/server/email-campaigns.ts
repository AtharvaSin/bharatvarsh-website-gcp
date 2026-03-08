import 'server-only';
import { Resend } from 'resend';
import { getServerEnv } from '@/config/env';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(getServerEnv().resend.apiKey);
  }
  return _resend;
}

const FROM_EMAIL = 'Atharva Singh <atharva@welcometobharatvarsh.com>';

export async function sendCampaignEmail(campaignId: string, to: string, step: number): Promise<{ success: boolean; error?: string }> {
  try {
    // For emails, the assets (images) and links MUST point to a publicly accessible URL.
    // When testing locally, default to the production URL.
    const envBaseUrl = getServerEnv().baseUrl;
    const isLocalhost = envBaseUrl.includes('localhost') || envBaseUrl.includes('127.0.0.1');
    const emailBaseUrl = isLocalhost ? 'https://www.welcometobharatvarsh.com' : envBaseUrl;

    // Pass emailBaseUrl for both appUrl and assetUrl
    const content = getCampaignContent(campaignId, step, emailBaseUrl, emailBaseUrl);

    if (!content) {
      return { success: false, error: 'Invalid campaign step' };
    }

    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: content.subject,
      html: generateSharedEmailTemplate(content),
    });

    if (error) {
      console.error(`Resend error sending campaign step ${step}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error(`Email send error for campaign step ${step}:`, err);
    return { success: false, error: 'Failed to send campaign email' };
  }
}

interface EmailContent {
  subject: string;
  preheader: string;
  heroImage: string;
  headline: string;
  bodyHtml: string;
  ctaText: string;
  ctaUrl: string;
  secondaryLinksHtml: string;
  appUrl: string;
  unsubscribeUrl: string;
}

function getCampaignContent(campaignId: string, step: number, appUrl: string, assetUrl: string): EmailContent | null {
  const unsubscribeUrl = `${appUrl}/unsubscribe?id=${campaignId}`;

  switch (step) {
    case 1:
      return {
        subject: 'Your Bharatvarsh dossier is here',
        preheader: 'Start with the dossier. Then step into the forum and stay close to future updates.',
        heroImage: `${assetUrl}/emails/mail-1-artwork.jpg`,
        headline: 'ACCESS GRANTED',
        bodyHtml: `
          <p>Your access begins here.</p>
          <p>Thank you for signing up to explore Bharatvarsh.</p>
          <p>Your dossier is ready. You can download it here: <a href="${assetUrl}/downloads/Bharatvarsh-Dossier-Chapter-1.pdf" style="color: #F1C232;">Bharatvarsh Dossier</a>.</p>
          <p>This dossier is your first controlled glimpse into the world of Mahabharatvarsh—its atmosphere, its tensions, and the larger machinery moving behind the surface.</p>
          <p>Once you’ve gone through it, step into the forum. That’s where readers, theory-builders, and early followers can begin discussing the world as it unfolds.</p>
          <p>You’ll hear from me again soon with the deeper history behind Bharatvarsh.</p>
        `,
        ctaText: 'Join the Forum &rarr;',
        ctaUrl: `${appUrl}/forum`,
        secondaryLinksHtml: `
          <a href="${appUrl}">Visit the website</a><br>
          <a href="${unsubscribeUrl}">Manage update preferences</a>
        `,
        appUrl,
        unsubscribeUrl
      };
    case 2:
      return {
        subject: 'Imagine an India that was never colonized',
        preheader: 'A different inheritance. A different century. A different Bharatvarsh.',
        heroImage: `${assetUrl}/emails/mail-2-artwork.jpg`,
        headline: 'A DIFFERENT TIMELINE',
        bodyHtml: `
          <p>Imagine an India that was never colonized by the British Empire.</p>
          <p>Not the India we know. Not the inheritance we were given.<br>A different sequence of victories, compromises, consolidations, and ideologies.</p>
          <p>That is the starting point of Bharatvarsh.</p>
          <p>What emerged over time was not simply a stronger nation, but a very different one—disciplined, technologically advanced, and shaped by choices that pushed history down another path.</p>
          <p>If you want to understand the deeper context behind the novel, the timeline is the best place to begin. It traces the long arc that turned an alternate India into the present-day Bharatvarsh you’ll encounter in Mahabharatvarsh.</p>
        `,
        ctaText: 'Explore the Timeline &rarr;',
        ctaUrl: `${appUrl}/timeline`,
        secondaryLinksHtml: `
          <a href="${appUrl}">Open the full site</a><br>
          <a href="${appUrl}/novel">Start with the novel page</a>
        `,
        appUrl,
        unsubscribeUrl
      };
    case 3:
      return {
        subject: 'Order has a cost',
        preheader: 'Prosperous. Disciplined. Controlled.',
        heroImage: `${assetUrl}/emails/mail-3-artwork.jpg`,
        headline: 'ORDER HAS A COST',
        bodyHtml: `
          <p>The Bharatvarsh of the novel is not broken. That is what makes it dangerous.</p>
          <p>It is efficient. Safe. Advanced. Orderly.<br>The streets function. The systems work. The state delivers.</p>
          <p>But this stability was not achieved gently.</p>
          <p>In Bharatvarsh, religion has been outlawed. Castes have been abolished. The Army stands at the center of power, not just as defense, but as the force that reshaped society itself. What was once sold as salvation now defines everyday life: how people behave, what they trust, and how far they are willing to think outside the lines.</p>
          <p>This is the atmosphere Mahabharatvarsh begins in—a nation that looks like a success story until you stand close enough to hear what had to be buried to build it.</p>
          <p>If you want the fuller picture, enter the website and explore the world for yourself.</p>
        `,
        ctaText: 'Explore Bharatvarsh &rarr;',
        ctaUrl: `${appUrl}`,
        secondaryLinksHtml: `
          <a href="${appUrl}/lore">Lore hub</a><br>
          <a href="${appUrl}/timeline">Timeline</a><br>
          <a href="${appUrl}/bhoomi">Ask Bhoomi</a>
        `,
        appUrl,
        unsubscribeUrl
      };
    case 4:
      return {
        subject: 'Who built Bharatvarsh?',
        preheader: 'A brief note from the author—and where to follow the journey next.',
        heroImage: `${assetUrl}/emails/mail-4-artwork.jpg`,
        headline: 'FROM THE AUTHOR',
        bodyHtml: `
          <p>Before you go further into Bharatvarsh, I wanted to introduce myself.</p>
          <p>I’m Atharva Singh.</p>
          <p>By profession, I’ve spent years close to real-world systems, technology, and implementation. As a writer, I’ve always been drawn to a related question: what happens when systems become powerful enough to shape not just institutions, but truth, belief, and human freedom?</p>
          <p>That question led to Mahabharatvarsh.</p>
          <p>This novel blends political tension, surveillance, military power, next-generation technology, and human moral conflict into a world that is fictional—but built to feel disturbingly plausible.</p>
          <p>If the world, premise, or ideas have stayed with you so far, follow me on Goodreads and Amazon. That is the best way to stay connected to this book and to everything that comes after it.</p>
          <p>Thank you for being here early.</p>
        `,
        ctaText: 'Follow on Goodreads &rarr;',
        ctaUrl: 'https://www.goodreads.com/author/show/44059045.Atharva_Singh',
        secondaryLinksHtml: `
          <a href="https://www.amazon.in/dp/B0DJ2X1QNZ">Amazon Author Page</a><br>
          <a href="${appUrl}">Website</a><br>
          <a href="https://www.linkedin.com/in/atharvasingh/">LinkedIn / author updates</a>
        `,
        appUrl,
        unsubscribeUrl
      };
    case 5:
      return {
        subject: 'A perfect nation starts bleeding',
        preheader: 'A loyal officer. Coordinated bombings. A nation built on engineered harmony.',
        heroImage: `${assetUrl}/emails/mail-5-artwork.jpg`,
        headline: 'WHEN A PERFECT COUNTRY BLEEDS',
        bodyHtml: `
          <p>Some nations collapse into chaos. Bharatvarsh was built to eliminate it.</p>
          <p>When coordinated bombings rip through major cities, the state moves fast to control the narrative.</p>
          <p>A loyal officer is tasked with leading the investigation. But as the evidence begins to shift, one possibility becomes harder and harder to ignore:</p>
          <p>What if the threat is not outside the system at all?</p>
          <p><em>Mahabharatvarsh: Price of Harmony, Paid by Freedom</em> is a political techno-thriller of surveillance, power, hidden programs, and buried truths—set inside an alternate India that looks stable, prosperous, and perfected from a distance.</p>
          <p>If the world you’ve explored through the dossier, the timeline, and the website has drawn you in, this is where the real journey begins.</p>
        `,
        ctaText: 'Buy on Amazon &rarr;',
        ctaUrl: 'https://www.amazon.in/dp/B0DJ2X1QNZ',
        secondaryLinksHtml: `
          <a href="https://www.flipkart.com/">Buy on Flipkart</a><br>
          <a href="https://notionpress.com/read/mahabharatvarsh">Buy on Notion Press</a><br>
          <a href="${appUrl}/novel">Visit the novel page</a>
        `,
        appUrl,
        unsubscribeUrl
      };
    default:
      return null;
  }
}

function generateSharedEmailTemplate(content: EmailContent): string {
  // Brand colors: 
  // background: #0A0D12 (Obsidian)
  // text: #A0AEC0 / #F0F4F8 (Powder)
  // accent: #F1C232 (Mustard/Gold)
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0A0D12; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    h1 { margin: 20px 0; font-size: 24px; color: #F0F4F8; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; text-align: center; }
    p { margin: 0 0 20px 0; font-size: 16px; color: #F0F4F8; line-height: 1.6; }
    .secondary-links a { color: #A0AEC0; text-decoration: none; font-size: 14px; margin-bottom: 8px; display: inline-block; }
    .secondary-links a:hover { color: #F1C232; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${content.preheader}
  </div>
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0A0D12;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" style="width: 100%; max-width: 650px; border-collapse: collapse; text-align: left;">
          <!-- Hero Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${content.heroImage}" alt="${content.headline}" style="width: 100%; max-width: 650px; height: auto; display: block; border-radius: 4px 4px 0 0;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px; background-color: #0F1419; border: 1px solid #1A1F2E; border-top: none;">
              <h1>${content.headline}</h1>
              ${content.bodyHtml}
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${content.ctaUrl}" style="display: inline-block; padding: 16px 40px; background-color: #F1C232; color: #0A0D12; text-decoration: none; font-weight: 600; font-size: 16px; letter-spacing: 1px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                      ${content.ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Secondary Links -->
              <div class="secondary-links" style="border-top: 1px solid #1A1F2E; padding-top: 20px; text-align: center;">
                ${content.secondaryLinksHtml}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #718096; line-height: 1.6;">
                You’re receiving this because you requested updates from Bharatvarsh.<br>
                <a href="${content.unsubscribeUrl}" style="color: #718096; text-decoration: underline;">Update Preferences</a> | 
                <a href="${content.unsubscribeUrl}" style="color: #718096; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #4A5568;">
                &copy; ${new Date().getFullYear()} Bharatvarsh. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
