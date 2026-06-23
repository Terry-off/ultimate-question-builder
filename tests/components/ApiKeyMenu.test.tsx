import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";

describe("ApiKeyMenu", () => {
  it("tests a new API key before activating it without rendering the secret", async () => {
    const user = userEvent.setup();
    const onApiKeyTest = vi.fn().mockResolvedValue(undefined);

    render(
      <ApiKeyMenu
        apiKey=""
        provider="openai"
        model="gpt-5.5"
        onProviderChange={vi.fn()}
        onApiKeyChange={vi.fn()}
        onApiKeyTest={onApiKeyTest}
        onModelChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-secret");
    await user.click(screen.getByRole("button", { name: "TEST" }));

    expect(onApiKeyTest).toHaveBeenCalledWith("sk-secret");
    expect(await screen.findByText("API가 정상 작동해요. 바로 사용할 수 있어요.")).toBeInTheDocument();
    expect(screen.queryByText("sk-secret")).not.toBeInTheDocument();
  });

  it("does not apply a new key before TEST succeeds", async () => {
    const user = userEvent.setup();
    const onApiKeyChange = vi.fn();

    render(
      <ApiKeyMenu
        apiKey=""
        provider="openai"
        model="gpt-5.5"
        onProviderChange={vi.fn()}
        onApiKeyChange={onApiKeyChange}
        onApiKeyTest={vi.fn().mockResolvedValue(undefined)}
        onModelChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-secret");
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(onApiKeyChange).not.toHaveBeenCalled();
    expect(screen.getByText("먼저 TEST로 API 키가 작동하는지 확인해주세요.")).toBeInTheDocument();
  });

  it("keeps the saved API key when applying with an empty replacement field", async () => {
    const user = userEvent.setup();
    const onApiKeyChange = vi.fn();

    render(
      <ApiKeyMenu
        apiKey="sk-existing"
        provider="openai"
        model="gpt-5.5"
        onProviderChange={vi.fn()}
        onApiKeyChange={onApiKeyChange}
        onApiKeyTest={vi.fn().mockResolvedValue(undefined)}
        onModelChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "GPT-5.5 작동중" }));
    expect(screen.getByPlaceholderText("API키는 사용자의 로컬에 독립 저장됩니다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(onApiKeyChange).not.toHaveBeenCalled();
  });

  it("lets users select a GPT model", async () => {
    const user = userEvent.setup();
    const onModelChange = vi.fn();

    render(
      <ApiKeyMenu
        apiKey="sk-existing"
        provider="openai"
        model="gpt-5.5"
        onProviderChange={vi.fn()}
        onApiKeyChange={vi.fn()}
        onApiKeyTest={vi.fn().mockResolvedValue(undefined)}
        onModelChange={onModelChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "GPT-5.5 작동중" }));
    await user.selectOptions(screen.getByLabelText("GPT 모델"), "gpt-5.5-pro");

    expect(onModelChange).toHaveBeenCalledWith("gpt-5.5-pro");
  });

  it("lets users switch provider before choosing the model key", async () => {
    const user = userEvent.setup();
    const onProviderChange = vi.fn();

    render(
      <ApiKeyMenu
        apiKey=""
        provider="openai"
        model="gpt-5.5"
        onProviderChange={onProviderChange}
        onApiKeyChange={vi.fn()}
        onApiKeyTest={vi.fn().mockResolvedValue(undefined)}
        onModelChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.click(screen.getByRole("button", { name: "CLAUDE" }));

    expect(onProviderChange).toHaveBeenCalledWith("anthropic");
  });

  it("closes the popover when users click outside", async () => {
    const user = userEvent.setup();

    render(
      <>
        <ApiKeyMenu
          apiKey="sk-existing"
          provider="openai"
          model="gpt-5.5"
          onProviderChange={vi.fn()}
          onApiKeyChange={vi.fn()}
          onApiKeyTest={vi.fn().mockResolvedValue(undefined)}
          onModelChange={vi.fn()}
        />
        <button type="button">바깥 영역</button>
      </>
    );

    await user.click(screen.getByRole("button", { name: "GPT-5.5 작동중" }));
    expect(screen.getByLabelText("GPT 모델")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "바깥 영역" }));

    expect(screen.queryByLabelText("GPT 모델")).not.toBeInTheDocument();
  });
});
