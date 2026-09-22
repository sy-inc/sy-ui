import {render} from "@sy-inc/testing/browser";

import {Avatar} from "@/components/avatar";
import {AvatarGroup} from "@/components/avatar-group";

import "../../../../styles/dist/sy-inc.min.css";

describe("AvatarGroup (browser)", () => {
  it("uses the official clip geometry for each avatar size", async () => {
    await render(
      <AvatarGroup aria-label="Team" role="group" size="sm">
        <Avatar aria-label="Ada">
          <Avatar.Fallback>A</Avatar.Fallback>
        </Avatar>
        <Avatar aria-label="Lin">
          <Avatar.Fallback>L</Avatar.Fallback>
        </Avatar>
      </AvatarGroup>,
    );

    const firstAvatar = document.querySelector<HTMLElement>('[aria-label="Ada"]')!;
    const firstFallback = firstAvatar.querySelector<HTMLElement>('[data-slot="avatar-fallback"]')!;
    const styles = getComputedStyle(firstAvatar);

    expect(styles.getPropertyValue("--avatar-size").trim()).toBe("2rem");
    expect(styles.maskImage).not.toBe("none");
    expect(getComputedStyle(firstFallback).paddingInlineEnd).toBe("2.8px");
  });

  it("uses the official grid spacing", async () => {
    await render(
      <AvatarGroup isGrid data-testid="group">
        <Avatar>
          <Avatar.Fallback>A</Avatar.Fallback>
        </Avatar>
      </AvatarGroup>,
    );

    const group = document.querySelector<HTMLElement>('[data-testid="group"]')!;

    expect(getComputedStyle(group).columnGap).toBe("12px");
  });
});
