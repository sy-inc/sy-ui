import {ssrSmoke} from "@sy-inc/testing/helpers";

import {ItemCard} from "@/components/item-card";

describe("ItemCard SSR", () => {
  it("renders compound and pressable structures without hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <ItemCard>
        <ItemCard.Icon>Icon</ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>Title</ItemCard.Title>
          <ItemCard.Description>Description</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>Action</ItemCard.Action>
      </ItemCard>,
    );

    expect(html).toContain('data-slot="item-card"');
    expect(html).toContain('data-slot="item-card-action"');

    const {html: pressableHtml} = await ssrSmoke(
      <ItemCard render={(props) => <button type="button" {...(props as any)} />}>
        <ItemCard.Content>
          <ItemCard.Title>Account settings</ItemCard.Title>
        </ItemCard.Content>
      </ItemCard>,
    );

    expect(pressableHtml).toContain("<button");
  });
});
