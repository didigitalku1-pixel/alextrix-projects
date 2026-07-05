import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocLI,
  DocFeatureBlock, DocProTip, DocLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   Custom Domain — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/custom-domain.
   ========================================================================== */

const tocItems = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "requirements", label: "Requirements", level: 2 },
  { id: "purchase-domain", label: "Purchase a Domain", level: 2 },
  { id: "connect-domain", label: "Connect Your Domain", level: 2 },
  { id: "dns-configuration", label: "DNS Configuration", level: 2 },
  { id: "verification", label: "Verification", level: 2 },
  { id: "troubleshooting", label: "Troubleshooting", level: 2 },
];

const registrars = [
  { name: "Name.com", href: "https://www.name.com/support/articles/205188538-pointing-your-domain-to-hosting-with-a-records" },
  { name: "Namecheap", href: "https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/" },
  { name: "GoDaddy", href: "https://www.godaddy.com/help/add-an-a-record-19238" },
  { name: "Cloudflare", href: "https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/" },
  { name: "IONOS", href: "https://www.ionos.com/help/domains/configuring-your-ip-address/adding-an-a-record-for-your-domain/" },
  { name: "Porkbun", href: "https://kb.porkbun.com/article/68-how-to-edit-dns-records" },
];

export const customDomainContent: LearnPageContent = {
  slug: "custom-domain",
  title: "Custom Domain",
  description: "How to publish a template to your own custom domain.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>How to Set Up a Custom Domain</DocH1>
        <DocLead>
          Connect your own domain to your Aura projects for a professional, branded experience. Your visitors will see your custom domain instead of the default Aura subdomain.
        </DocLead>
      </header>

      {/* ===== Overview ===== */}
      <DocH2 id="overview">Overview</DocH2>
      <DocFeatureBlock title="Custom Domain Support">
        By default, your published Aura projects are hosted on an Aura subdomain (e.g., yourproject.aura.build). With a PRO subscription, you can connect your own custom domain to give your projects a more professional appearance.
      </DocFeatureBlock>
      <DocP>
        <strong>How it works</strong> — When you connect a custom domain, visitors to your domain (e.g., yourdomain.com) will see your Aura project while the URL stays on your domain. This is perfect for portfolios, landing pages, and client projects.
      </DocP>

      {/* ===== Requirements ===== */}
      <DocH2 id="requirements">Requirements</DocH2>
      <DocP>Before connecting a custom domain, make sure you have the following:</DocP>
      <DocUL>
        <DocLI title="PRO subscription">Custom domains are a PRO feature</DocLI>
        <DocLI title="A published project">Your project must be published first</DocLI>
        <DocLI title="A domain you own">Purchased from a domain registrar (e.g., Name.com, Namecheap, GoDaddy, Cloudflare)</DocLI>
        <DocLI title="Access to DNS settings">You'll need to add DNS records at your domain registrar</DocLI>
      </DocUL>

      {/* ===== Purchase a Domain ===== */}
      <DocH2 id="purchase-domain">Purchase a Domain</DocH2>
      <DocP>To connect a custom domain to your Aura project, you first need to purchase a domain from a domain registrar.</DocP>
      <DocP>
        <strong>Choose a Domain Registrar</strong> — Purchase a domain from a provider such as Name.com, Cloudflare, Namecheap, GoDaddy, or Porkbun. Prices typically range from $10-15/year for common extensions like .com.
      </DocP>
      <DocP>
        <strong>Register Your Domain</strong> — Search for your desired domain name and complete the purchase. Make sure you have access to the DNS management panel.
      </DocP>

      <DocH4>Popular Domain Registrars</DocH4>
      <DocP>Most registrars have DNS management panels under "Domain Settings" or "DNS Records". Here are guides for adding A Records and CNAMEs:</DocP>
      <div className="docs-registrar-grid">
        {registrars.map((r) => (
          <a key={r.href} href={r.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{r.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      {/* ===== Connect Your Domain ===== */}
      <DocH2 id="connect-domain">Connect Your Domain</DocH2>
      <DocP>Follow these steps to connect your custom domain to your Aura project:</DocP>
      <ol className="docs-ol">
        <li className="docs-step">
          <span className="docs-step-num">1</span>
          <div className="docs-step-body">
            <div className="docs-step-content">Open your project in the Aura editor and click the Publish button in the top navigation bar to open the Publish popover.</div>
          </div>
        </li>
        <li className="docs-step">
          <span className="docs-step-num">2</span>
          <div className="docs-step-body">
            <div className="docs-step-content">In the Publish popover, click Custom Domain (next to the URL label) to reveal the custom domain settings.</div>
          </div>
        </li>
        <li className="docs-step">
          <span className="docs-step-num">3</span>
          <div className="docs-step-body">
            <div className="docs-step-content">Enter your domain name in the input field. You can use either an apex domain (e.g., yourdomain.com) or a subdomain (e.g., blog.yourdomain.com). Aura will check if the domain is available.</div>
          </div>
        </li>
        <li className="docs-step">
          <span className="docs-step-num">4</span>
          <div className="docs-step-body">
            <div className="docs-step-content">Click Save Domain to save your custom domain. Aura will automatically configure SSL certificates for your domain.</div>
          </div>
        </li>
      </ol>

      <DocProTip label="Important">
        You must publish your project first before you can add a custom domain. The Custom Domain option is only available for published projects.
      </DocProTip>

      {/* ===== DNS Configuration ===== */}
      <DocH2 id="dns-configuration">DNS Configuration</DocH2>
      <DocP>
        After saving your domain in Aura, you need to configure your DNS settings at your domain registrar. The configuration depends on whether you're using an apex domain or a subdomain.
      </DocP>

      <DocH3 id="apex-domain">Option 1: Apex Domain (e.g., yourdomain.com)</DocH3>
      <DocP>For apex domains (also called "root" or "naked" domains), keep only these DNS records. Remove any other A or AAAA records for the apex domain so SSL can be issued correctly:</DocP>

      <div className="docs-dns-table">
        <div className="docs-dns-row docs-dns-row-header">
          <span>Type</span>
          <span>Host</span>
          <span>Value</span>
        </div>
        <div className="docs-dns-row">
          <span className="docs-dns-type docs-dns-type-a">A</span>
          <span className="docs-dns-host">@</span>
          <span className="docs-dns-value">75.2.60.5</span>
        </div>
        <div className="docs-dns-row">
          <span className="docs-dns-type docs-dns-type-cname">CNAME</span>
          <span className="docs-dns-host">www</span>
          <span className="docs-dns-value">aura.build</span>
        </div>
      </div>

      <DocH4>A Record (@)</DocH4>
      <DocP>Points your apex domain (e.g., yourdomain.com) to Aura's servers.</DocP>

      <DocH4>CNAME Record (www)</DocH4>
      <DocP>Points your www subdomain (e.g., www.yourdomain.com) to Aura.</DocP>

      <DocH3 id="subdomain">Option 2: Subdomain (e.g., blog.yourdomain.com)</DocH3>
      <DocP>For subdomains (like blog.yourdomain.com, app.yourdomain.com, or shop.yourdomain.com), you only need one CNAME record:</DocP>

      <div className="docs-dns-table">
        <div className="docs-dns-row docs-dns-row-header">
          <span>Type</span>
          <span>Host</span>
          <span>Value</span>
        </div>
        <div className="docs-dns-row">
          <span className="docs-dns-type docs-dns-type-cname">CNAME</span>
          <span className="docs-dns-host">blog</span>
          <span className="docs-dns-value">aura.build</span>
        </div>
      </div>

      <DocH4>Why subdomains are simpler</DocH4>
      <DocP>Subdomains only require a single CNAME record, making them easier to configure. They also don't affect your main domain's DNS records, which is useful if you're already using your apex domain for email or another website.</DocP>

      <DocProTip label="Tip">
        For apex domains, ensure there are no other A or AAAA records configured, as they may interfere with Aura's settings.
      </DocProTip>

      {/* ===== Verification ===== */}
      <DocH2 id="verification">Verification</DocH2>
      <DocP>After configuring your DNS records, it may take some time for the changes to propagate. Here's what to expect:</DocP>
      <DocFeatureBlock title="DNS Propagation">
        DNS changes can take up to 48 hours to propagate worldwide, though it's usually much faster.
      </DocFeatureBlock>
      <DocFeatureBlock title="Automatic SSL">
        Aura automatically provisions SSL certificates. Your site will be accessible via HTTPS once DNS is configured.
      </DocFeatureBlock>
      <DocP>
        You can check propagation status using tools like{" "}
        <DocLink href="https://dnschecker.org" external>dnschecker.org</DocLink>.
      </DocP>

      {/* ===== Troubleshooting ===== */}
      <DocH2 id="troubleshooting">Troubleshooting</DocH2>
      <DocP>Having issues connecting your domain? Here are some common problems and solutions:</DocP>

      <DocH4>Domain shows "SSL Error" or "Not Secure"</DocH4>
      <DocP>This usually means DNS hasn't fully propagated yet. Wait a few hours and try again. SSL certificates are provisioned automatically once DNS is correctly configured.</DocP>

      <DocH4>Domain shows wrong content or homepage</DocH4>
      <DocP>Make sure:</DocP>
      <DocUL>
        <DocLI>Your DNS records are correctly configured (A record pointing to 75.2.60.5)</DocLI>
        <DocLI>The domain is saved correctly in the Publish popover</DocLI>
        <DocLI>There are no conflicting A or AAAA records for your domain</DocLI>
      </DocUL>

      <DocH4>"Domain already in use" error</DocH4>
      <DocP>Each domain can only be connected to one Aura project. If you see this error, the domain may already be connected to another project. Remove it from the other project first, or use a subdomain instead.</DocP>

      <DocH4>Can't add CNAME for apex domain (@)</DocH4>
      <DocP>
        CNAME records cannot be used on apex domains (the "naked" domain without www). This is a DNS specification limitation. Use the A record (75.2.60.5) for your apex domain and CNAME for the www subdomain.
      </DocP>

      <DocH4>Subdomain not working</DocH4>
      <DocP>If your subdomain (like blog.yourdomain.com) isn't working:</DocP>
      <DocUL>
        <DocLI>Verify the CNAME record points to aura.build</DocLI>
        <DocLI>Make sure you entered the exact subdomain in Aura (e.g., blog.yourdomain.com, not just yourdomain.com)</DocLI>
        <DocLI>Subdomains don't need an A record — only a CNAME</DocLI>
      </DocUL>
    </article>
  ),
};
