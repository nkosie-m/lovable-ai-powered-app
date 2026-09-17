import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";

const GenerateInput = z.object({
  tool: z.enum(["email", "notes", "research"]),
  fields: z.record(z.string()),
});

const SYSTEM_PROMPTS: Record<"email" | "notes" | "research", string> = {
  email:
    "Write a professional workplace email for the stated audience and goal. Be clear, concise, and action-oriented. Do not invent facts. Return subject line then body.",
  notes:
    "Summarize only information present in the source. Use clear sections: Summary, Decisions, Action Items (with owners and deadlines), Open Questions, Notable Discussion Points. Never invent facts.",
  research:
    "Frame the question, identify sub-questions, distinguish known facts from assumptions, surface insights and practical recommendations, and propose sources or validation steps. Avoid fabricated citations.",
};

function buildPrompt(tool: string, fields: Record<string, string>) {
  const lines = Object.entries(fields)
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value.trim()}`);
  return `Task: ${tool}\n\n${lines.join("\n\n")}`;
}

export const generateDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this workspace.");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: {
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system: SYSTEM_PROMPTS[data.tool],
      prompt: buildPrompt(data.tool, data.fields),
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    const reasoning = await result.reasoningText;

    return { text: text?.trim() || reasoning?.trim() || "" };
  });
