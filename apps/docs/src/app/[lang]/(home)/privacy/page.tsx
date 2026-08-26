import type {Metadata} from "next";

import {TrustPage} from "../components/trust-page";

export const metadata: Metadata = {
  alternates: {canonical: "/privacy"},
  description:
    "Plain-language privacy information for the public SY UI documentation website and SY UI contact emails.",
  title: {absolute: "SY UI Privacy"},
};

export default function PrivacyPage() {
  return (
    <TrustPage
      description="Plain-language context for the public SY UI documentation website and the contact addresses listed here."
      title="SY UI Privacy"
    >
      <section>
        <h2>Scope of this page</h2>
        <p>
          This page applies to the public SY UI documentation website at sy-ui.com, including the
          About, Contact, and Privacy pages, and to messages people choose to send to the contact
          addresses published on this site. SY UI primarily uses this website to publish
          documentation and resources for its open-source React web and React Native UI libraries.
          Browsing these public pages does not require a SY UI account.
        </p>
      </section>
      <section>
        <h2>Information you choose to share</h2>
        <p>
          If you email <a href="mailto:sales@sy-ui.com">sales@sy-ui.com</a> or{" "}
          <a href="mailto:junior@sy-ui.com">junior@sy-ui.com</a>, you control what you include in
          the message. Do not send passwords, authentication tokens, financial account details,
          government identification numbers, or other sensitive personal information by email.
        </p>
      </section>
      <section>
        <h2>Site analytics and skill installation</h2>
        <p>
          SY UI uses Vercel Analytics on the documentation site. When the public{" "}
          <code>/install</code> route is used to download an agent-skill installer, the production
          service records an installation event in PostHog with request metadata supplied by the
          hosting platform: IP address, city, region, postal code, country, user agent, referring
          page, and requested URL. This page does not claim a retention period or other processing
          detail that SY UI has not published.
        </p>
      </section>
      <section>
        <h2>Library use and questions</h2>
        <p>
          Using SY UI components in an application is separate from visiting this documentation
          website. Developers who build with SY UI are responsible for the privacy practices of
          their own applications and for explaining those practices to their users. For a
          privacy-related question about sy-ui.com or email sent to the addresses above, contact{" "}
          <a href="mailto:junior@sy-ui.com">junior@sy-ui.com</a>. If you need a detail that is not
          documented here, ask directly rather than assuming a policy or practice.
        </p>
      </section>
    </TrustPage>
  );
}
