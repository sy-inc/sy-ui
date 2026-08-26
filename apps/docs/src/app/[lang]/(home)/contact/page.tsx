import type {Metadata} from "next";

import {TrustPage} from "../components/trust-page";

export const metadata: Metadata = {
  alternates: {canonical: "/contact"},
  description:
    "Contact SY UI for sales, partnerships, general questions, and privacy questions using verified public email addresses.",
  title: {absolute: "Contact SY UI"},
};

export default function ContactPage() {
  return (
    <TrustPage
      description="Use these verified channels for questions about SY UI, its open-source libraries, and its developer resources."
      title="Contact SY UI"
    >
      <section>
        <h2>Email contacts</h2>
        <p>
          For sales and partnership questions, email{" "}
          <a href="mailto:sales@sy-ui.com">sales@sy-ui.com</a>. For general or privacy-related
          questions, email <a href="mailto:junior@sy-ui.com">junior@sy-ui.com</a>. SY UI does not
          list a public street address or phone number in this repository, so this page does not
          present one. These email addresses are the direct, verifiable contact options currently
          published by the project.
        </p>
      </section>
      <section>
        <h2>Technical questions</h2>
        <p>
          Before writing, check the <a href="/docs/react/getting-started">React documentation</a>,{" "}
          <a href="/docs/native/getting-started">React Native documentation</a>, and the{" "}
          <a href="https://github.com/sy-ui/sy-ui">SY UI GitHub repository</a>. They contain
          installation guides, component APIs, examples, migration resources, and issue tracking.
          When asking a technical question, include the platform, package version, a small
          reproduction, and what you already tried. That context makes the request easier to
          understand without requiring access to a private application.
        </p>
      </section>
      <section>
        <h2>What not to send</h2>
        <p>
          This public documentation site does not provide a contact form or secure support portal.
          Do not email passwords, authentication tokens, payment card numbers, government
          identification, or other sensitive personal information. For more context about this
          documentation site and email communication, read the{" "}
          <a href="/privacy">SY UI privacy page</a>.
        </p>
      </section>
    </TrustPage>
  );
}
