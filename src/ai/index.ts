// import { openai } from "@ai-sdk/openai";
import { mistral } from "@ai-sdk/mistral";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

export const customModel = wrapLanguageModel({
  model: mistral("mistral-large-latest"),
  middleware: customMiddleware,
});
