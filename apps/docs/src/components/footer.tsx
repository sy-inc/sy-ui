import type {Dictionary} from "@/lib/dictionaries";

import {SocialLinks} from "@/components/social-links";

export function Footer({dict}: {dict: Dictionary["footer"]}) {
  return (
    <footer className="mt-auto flex w-full flex-row flex-wrap items-center justify-center gap-2 py-3 text-muted">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} SY UI. {dict.allRightsReserved}
      </p>
      <nav aria-label="SY UI company information" className="flex items-center gap-2 text-sm">
        <a className="hover:text-foreground" href="/about">
          {dict.about}
        </a>
        <a className="hover:text-foreground" href="/contact">
          {dict.contact}
        </a>
        <a className="hover:text-foreground" href="/privacy">
          {dict.privacy}
        </a>
      </nav>
      <SocialLinks />
    </footer>
  );
}
