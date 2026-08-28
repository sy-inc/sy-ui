import type {Metadata} from "next";

import {TrustPage} from "../components/trust-page";

export const metadata: Metadata = {
  alternates: {canonical: "/about"},
  description:
    "Learn about SY UI, the open-source React and React Native UI library founded by Junior Garcia and backed by Y Combinator.",
  title: {absolute: "About SY UI"},
};

export default function AboutPage() {
  return (
    <TrustPage
      description="SY UI is an open-source UI library for building accessible, customizable web and mobile interfaces."
      title="About SY UI"
    >
      <section>
        <h2>What SY UI publishes</h2>
        <p>
          SY UI provides components for React applications on the web and for React Native
          applications on mobile. The project focuses on accessible behavior, customizable
          composition, typed developer APIs, and polished defaults that teams can adapt to their own
          products. The public documentation at <a href="/">sy-ui.com</a> includes installation
          guides, component references, examples, theming resources, release notes, and migration
          guidance.
        </p>
      </section>
      <section>
        <h2>Open source and developer tools</h2>
        <p>
          SY UI source code is available in the{" "}
          <a href="https://github.com/sy-ui/sy-ui">official GitHub repository</a>. Official
          packages include <code>@sy-inc/react</code>, <code>@sy-inc/react-mcp</code>, and{" "}
          <code>@sy-ui/native-mcp</code>. The official <code>sy-ui-cli</code> is documented in the{" "}
          <a href="/docs/react/getting-started/cli">SY UI CLI guide</a>. Developers and coding
          agents can inspect the same public source and documentation rather than relying on an
          undocumented integration.
        </p>
      </section>
      <section>
        <h2>Company and founder</h2>
        <p>
          SY UI is a Y Combinator S24 company founded by Junior Garcia. The library remains openly
          documented so developers can evaluate how it works, review its source, and use its
          published packages under the terms provided in the repository. For ways to reach the team,
          visit the <a href="/contact">SY UI contact page</a>.
        </p>
      </section>
    </TrustPage>
  );
}
