import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";

describe("ApiKeyMenu", () => {
  it("saves the API key through callback without rendering the secret", async () => {
    const user = userEvent.setup();
    const onApiKeyChange = vi.fn();

    render(<ApiKeyMenu apiKey="" model="gpt-5.5" onApiKeyChange={onApiKeyChange} onModelChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-secret");
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(onApiKeyChange).toHaveBeenCalledWith("sk-secret");
    expect(screen.queryByText("sk-secret")).not.toBeInTheDocument();
  });
});
