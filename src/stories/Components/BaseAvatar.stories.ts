import type { Meta, StoryObj } from "@storybook/vue3";

import BaseAvatar from "@/components/BaseAvatar.vue";

import { expect, within } from "@storybook/test";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof BaseAvatar> = {
  title: "Components/BaseAvatar",
  component: BaseAvatar,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    // @ts-ignore
    ariaBusy: {
      control: "boolean",
      table: { category: "Props" },
      description: "If the badge is busy",
      type: { required: false },
    },
    class: {
      // Is an enum of undefined, primary, or secondary
      options: [
        undefined,
        "notification",
        "secondary",
        "contrast",
        "outline",
        "outline secondary",
        "outline contrast",
        "outline notification",
      ],
      control: { type: "select" },
      table: { category: "Props" },
      description: "The class(es) of the badge to apply",
    },
  },
  args: {
    // eslint-disable-next-line no-secrets/no-secrets
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  }, // default value

  // Make sure the badge is visible in the canvas
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    const badge = canvas.getAllByRole("status")[0];
    expect(badge).toBeVisible();
  },
};

export default meta;
type Story = StoryObj<typeof BaseAvatar>;

export const Default: Story = {
  // The element should be a circle and have a role of status
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole("status");
    expect(badge).toBeVisible();
    // Expect the height and width to be close to the same
    expect(badge.getBoundingClientRect().width).toBeCloseTo(
      badge.getBoundingClientRect().height,
      -1
    );
  },
};

export const Empty: Story = {
  args: {
    src: "",
  },
};
