import { PromptTemplate } from "@langchain/core/prompts";

export const interpretUserMessagePrompt = new PromptTemplate({
  inputVariables: ["userMessage"],
  template: `
      You are an assistant that extracts agricultural information from user messages.
      Given the user's message: "{userMessage}"
      Extract the following information:
      - Location (latitude and longitude)
      - Crop to be planted
      - Date and time
      - Language
      Also, provide the optimal climate data for the different stages of the crop and the dates of each stage.
      Output the result as a JSON object with the following structure:
      {{
        "location": {{
          "latitude": ...,
          "longitude": ...
        }},
        "crop": "...",
        "date": "...",
        "language": "...",
        "stages": [
          {{
            "stage": "...",
            "start_month": "number 1-12",
            "end_month": "number 1-12",
            "optimal_conditions": {{
              "T2M": ...,
              "TS": ...,
              "PRECTOTCORR": ...,
              "QV2M": ...,
              "WS2M": ...,
              "GWETTOP": ...,
              "GWETROOT": ...,
              "GWETPROF": ...
            }}
          }},
          ...
        ]
      }}
      `,
});
