-




Custom Domain Guide | Aura



### Getting Started
Introduction
- How to Edit Designs
- Custom Domain
- SEO Settings
- Selling Templates
- Tips for Prompting
- Typography Prompting
- Styling Prompting
- Animation Prompting
- Layout Prompting
### Videos

- Interactive Rain Hero
- Brutalist Landing Page
- $20K Website Prompt
- $20K AI Workflow
- GPT Images + Grok
- Avoid AI Slop
- Claude 4.8 vs GPT-5.5
- AI Landing Pages with Media
- GPT Image to Landing Page
- DESIGN.md Workflow
- GPT 5.5 + DESIGN.md
- Complex Animations
- DESIGN.md Better AI Design
- Animated WebGL Pages
- Gemini 3 Landing Pages
- Gemini 3 Animations
- Gemini 3 Changes Everything
- Using GPT 5.1 for Creating UIs
- Aura Compose Workflow
- Turn AI Designs to Pro-level
- Master Customizations
- Image to HTML with AI
- Improve your AI Designs
- How to Prompt for UI
### Resources

- Video Tutorials
- Documentation
- FAQ
# How to Set Up a Custom Domain

Connect your own domain to your Aura projects for a professional, branded experience. Your visitors will see your custom domain instead of the default Aura subdomain.
## On this page
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)
## On this page
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)
## Overview

### Custom Domain Support

By default, your published Aura projects are hosted on an Aura subdomain (e.g., `yourproject.aura.build`). With a PRO subscription, you can connect your own custom domain to give your projects a more professional appearance.

How it works

When you connect a custom domain, visitors to your domain (e.g., `yourdomain.com`) will see your Aura project while the URL stays on your domain. This is perfect for portfolios, landing pages, and client projects.
## Requirements

Before connecting a custom domain, make sure you have the following:

**PRO subscription** — Custom domains are a PRO feature

**A published project** — Your project must be published first

**A domain you own** — Purchased from a domain registrar (e.g., Name.com, Namecheap, GoDaddy, Cloudflare)

**Access to DNS settings** — You'll need to add DNS records at your domain registrar
## Purchase a Domain

To connect a custom domain to your Aura project, you first need to purchase a domain from a domain registrar.1

**Choose a Domain Registrar** — Purchase a domain from a provider such as Name.com, Cloudflare, Namecheap, GoDaddy, or Porkbun. Prices typically range from $10-15/year for common extensions like .com.2

**Register Your Domain** — Search for your desired domain name and complete the purchase. Make sure you have access to the DNS management panel.
#### Popular Domain Registrars

Most registrars have DNS management panels under "Domain Settings" or "DNS Records". Here are guides for adding A Records and CNAMEs:[Name.com](https://www.name.com/support/articles/205188538-pointing-your-domain-to-hosting-with-a-records)[Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/)[GoDaddy](https://www.godaddy.com/help/add-an-a-record-19238)[Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)[IONOS](https://www.ionos.com/help/domains/configuring-your-ip-address/adding-an-a-record-for-your-domain/)[Porkbun](https://kb.porkbun.com/article/68-how-to-edit-dns-records)
## Connect Your Domain

Follow these steps to connect your custom domain to your Aura project:1

Open your project in the Aura editor and click the **Publish** button in the top navigation bar to open the Publish popover.2

In the Publish popover, click **Custom Domain** (next to the URL label) to reveal the custom domain settings.3

Enter your domain name in the input field. You can use either an **apex domain** (e.g., `yourdomain.com`) or a **subdomain** (e.g., `blog.yourdomain.com`). Aura will check if the domain is available.4

Click **Save Domain** to save your custom domain. Aura will automatically configure SSL certificates for your domain.
#### Important

You must publish your project first before you can add a custom domain. The Custom Domain option is only available for published projects.
## DNS Configuration

After saving your domain in Aura, you need to configure your DNS settings at your domain registrar. The configuration depends on whether you're using an **apex domain** or a **subdomain**.
### Option 1: Apex Domain (e.g., yourdomain.com)

For apex domains (also called "root" or "naked" domains), keep only **these DNS records**. Remove any other A or AAAA records for the apex domain so SSL can be issued correctly:TypeNameValueA@75.2.60.5CNAMEwwwaura.build
#### A Record (@)

Points your apex domain (e.g., `yourdomain.com`) to Aura's servers.
#### CNAME Record (www)

Points your www subdomain (e.g., `www.yourdomain.com`) to Aura.
### Option 2: Subdomain (e.g., blog.yourdomain.com)

For subdomains (like `blog.yourdomain.com`, `app.yourdomain.com`, or `shop.yourdomain.com`), you only need **one CNAME record**:TypeNameValueCNAMEblog (your subdomain)aura.build
#### Why subdomains are simpler

Subdomains only require a single CNAME record, making them easier to configure. They also don't affect your main domain's DNS records, which is useful if you're already using your apex domain for email or another website.

Tip

For apex domains, ensure there are no other A or AAAA records configured, as they may interfere with Aura's settings.
## Verification

After configuring your DNS records, it may take some time for the changes to propagate. Here's what to expect:
#### DNS Propagation

DNS changes can take **up to 48 hours** to propagate worldwide, though it's usually much faster.
#### Automatic SSL

Aura automatically provisions SSL certificates. Your site will be accessible via HTTPS once DNS is configured.

You can check propagation status using tools like [dnschecker.org](https://dnschecker.org)
## Troubleshooting

Having issues connecting your domain? Here are some common problems and solutions:
#### Domain shows "SSL Error" or "Not Secure"

This usually means DNS hasn't fully propagated yet. Wait a few hours and try again. SSL certificates are provisioned automatically once DNS is correctly configured.
#### Domain shows wrong content or homepage

Make sure:
- •Your DNS records are correctly configured (A record pointing to `75.2.60.5`)
- •The domain is saved correctly in the Publish popover
- •There are no conflicting A or AAAA records for your domain
#### "Domain already in use" error

Each domain can only be connected to one Aura project. If you see this error, the domain may already be connected to another project. Remove it from the other project first, or use a subdomain instead.
#### Can't add CNAME for apex domain (@)

CNAME records cannot be used on apex domains (the "naked" domain without www). This is a DNS specification limitation. Use the A record (`75.2.60.5`) for your apex domain and CNAME for the www subdomain.
#### Subdomain not working

If your subdomain (like `blog.yourdomain.com`) isn't working:
- •Verify the CNAME record points to `aura.build`
- •Make sure you entered the exact subdomain in Aura (e.g., `blog.yourdomain.com`, not just `yourdomain.com`)
- •Subdomains don't need an A record — only a CNAME
## On this page
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)
## On this page
[Overview](#overview)[Requirements](#requirements)[Purchase a Domain](#purchase-domain)[Connect Your Domain](#connect-domain)[DNS Configuration](#dns-configuration)[Verification](#verification)[Troubleshooting](#troubleshooting)