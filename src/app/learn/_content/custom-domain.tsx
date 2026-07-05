import { Section, Subsection, Tip, Callout, Code, Step } from "../_components/blocks";

export const customDomainContent = {
  slug: "custom-domain",
  title: "Custom Domain",
  description:
    "How to publish a template from the library to your own domain using Vercel, Netlify, Cloudflare Pages, or any static host.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        The library does not host pages for you, but every template is
        self-contained HTML — which means publishing one to your own domain is
        a five-minute job on any modern static host. This page covers the most
        common options.
      </p>

      <Section title="Before you start">
        <p>
          You will need three things: a domain name you control, an account on
          a static hosting provider, and a copy of the template you want to
          publish. Download the template from the library first — you will
          end up with a single <Code>.html</Code> file (or a small folder if
          the template includes assets) that is ready to upload.
        </p>
        <Tip>
          If your template references images by URL, those URLs are absolute
          and will continue to work after you publish. If it references local
          files, make sure to upload them alongside the HTML and keep the
          relative paths intact.
        </Tip>
      </Section>

      <Section title="Option 1: Vercel">
        <p>
          Vercel is the fastest option for a single-page template. The free
          tier covers custom domains with automatic HTTPS.
        </p>
        <Step n={1} title="Create a project">
          <p>
            Sign in at vercel.com, click &quot;Add New Project&quot;, and import a
            Git repository or use the &quot;Deploy&quot; button to upload a folder
            directly.
          </p>
        </Step>
        <Step n={2} title="Add your files">
          <p>
            If you imported a repo, push your downloaded template into it. If
            you uploaded a folder, drop the <Code>index.html</Code> file at the
            root.
          </p>
        </Step>
        <Step n={3} title="Configure the domain">
          <p>
            In the project settings, open &quot;Domains&quot; and add your custom
            domain. Vercel will show you the DNS records to add at your
            registrar. Once DNS propagates, HTTPS is issued automatically.
          </p>
        </Step>
        <Step n={4} title="Deploy">
          <p>
            Push any commit (or click &quot;Redeploy&quot;) and Vercel will build and
            publish within seconds. Future updates happen automatically on
            every push.
          </p>
        </Step>
      </Section>

      <Section title="Option 2: Netlify">
        <p>
          Netlify is equally friendly for static templates and offers a
          generous free tier with custom domains.
        </p>
        <Step n={1} title="Drag and drop to deploy">
          <p>
            Sign in at app.netlify.com, then drag your template folder onto the
            &quot;Sites&quot; page. Netlify publishes it immediately under a random
            subdomain.
          </p>
        </Step>
        <Step n={2} title="Set up the custom domain">
          <p>
            Open the site, go to &quot;Domain settings&quot;, click &quot;Add a domain&quot;,
            and follow the DNS instructions. Like Vercel, Netlify issues
            HTTPS certificates automatically.
          </p>
        </Step>
      </Section>

      <Section title="Option 3: Cloudflare Pages">
        <p>
          Cloudflare Pages is a good choice if your domain is already on
          Cloudflare, because DNS and TLS are managed in one place.
        </p>
        <Step n={1} title="Connect a Git repository">
          <p>
            Push your template to a GitHub or GitLab repo, then connect that
            repo to a new Cloudflare Pages project. Build command can be left
            empty; output directory is the repo root.
          </p>
        </Step>
        <Step n={2} title="Bind the domain">
          <p>
            In the project&apos;s &quot;Custom domains&quot; tab, add your domain. Because
            it is already on Cloudflare, the DNS record is added for you.
          </p>
        </Step>
      </Section>

      <Section title="Option 4: Any other static host">
        <p>
          The library&apos;s templates are plain HTML, so they will work on any
          host that can serve static files. That includes GitHub Pages, S3
          with CloudFront, Nginx, Caddy, or even a single PHP file that
          <Code> include</Code>s the HTML. The only requirement is that the
          server returns the file with a <Code>text/html</Code> content type.
        </p>
      </Section>

      <Section title="DNS records you will need">
        <Subsection title="Apex domain (example.com)">
          <p>
            Add an <Code>A</Code> record pointing to your provider&apos;s
            published IPs, or a <Code>CNAME</Code> record if your provider
            supports flattening. Providers publish their current IPs in their
            docs.
          </p>
        </Subsection>
        <Subsection title="Subdomain (www.example.com)">
          <p>
            Add a <Code>CNAME</Code> record pointing to your provider&apos;s
            hostname (e.g. <Code>your-site.vercel.app</Code>). This is the
            simplest option and works for almost every provider.
          </p>
        </Subsection>
      </Section>

      <Callout title="HTTPS and redirect rules">
        <p>
          Every provider listed above issues free TLS certificates via
          Let&apos;s Encrypt. Make sure to enable the &quot;force HTTPS&quot; redirect
          so visitors who type <Code>http://</Code> are sent to the secure
          version. For multi-page sites, also add a redirect from the apex to
          the <Code>www</Code> subdomain (or vice versa) so both URLs serve
          the same content.
        </p>
      </Callout>

      <Section title="Updating your published template">
        <p>
          Because the library is a collection rather than a hosted product,
          updates are not pushed automatically. When you want to refresh your
          published page, re-download the template from the library, replace
          the file in your repo (or drag the new version into Netlify), and
          the host will redeploy. If you have made local edits, you will need
          to merge them manually — keep a clean diff by storing your
          customizations in a separate CSS file whenever possible.
        </p>
      </Section>
    </>
  ),
};
