import { EvaluatorDef, initDataset, login, wrapOpenAI } from "braintrust";
import OpenAI from "openai";
import { z } from "zod";
import { runDevServer } from "braintrust/dev";

const client = wrapOpenAI(new OpenAI());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const e: EvaluatorDef<any, any, any, any, any> = {
  data: initDataset("local dev", { dataset: "sanity" }),
  task: async (input, { parameters }) => {
    const completion = await client.chat.completions.create(
      parameters.main.build({
        input: parameters.prefix + ": " + input,
      })
    );
    return completion.choices[0].message.content ?? "";
  },
  scores: [],
  parameters: {
    main: {
      type: "prompt",
      name: "Main prompt",
      description: "This is the main prompt",
      default: {
        messages: [
          {
            role: "user",
            content: "{{input}}",
          },
        ],
        model: "gpt-4o",
      },
    },
    another: {
      type: "prompt",
      name: "Another prompt",
      description: "This is another prompt",
      default: {
        messages: [
          {
            role: "user",
            content: "{{input}}",
          },
        ],
        model: "gpt-4o",
      },
    },
    include_prefix: z
      .boolean()
      .default(false)
      .describe("Include a contextual prefix"),
    prefix: z
      .string()
      .describe("The prefix to include")
      .default("this is a math problem"),
    array_of_objects: z
      .array(
        z.object({
          name: z.string(),
          age: z.number(),
        })
      )
      .default([
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ]),
  },
  evalName: "parameters-server",
};

async function main() {
  await login();

  runDevServer([e], {
    host: "0.0.0.0",
    port: 8011,
  });
}

main();
