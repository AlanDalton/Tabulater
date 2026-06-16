export default async (request) => {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: [
          {
            type: "text",
            text: `Convert the text the user provides into a semantically correct, accessible HTML table, following W3C WAI guidelines precisely.

STRUCTURE:
- Use <table>, <thead>, <tbody> elements appropriately
- Always include a <caption> element as the first child of <table>, describing the table's purpose
- Use <th> for header cells and <td> for data cells
- Never use tables for layout

HEADERS:
- For a single column header row: use <th scope="col"> for each header
- For a single row header column: use <th scope="row"> for each header
- For both row and column headers: use scope="col" for column headers and scope="row" for row headers
- For headers spanning multiple columns: use colspan and scope="colgroup", with <colgroup> elements to define column groups
- For headers spanning multiple rows: use rowspan and scope="rowgroup", with <tbody> elements to define row groups
- For complex tables where headers cannot be associated horizontally or vertically: use unique id attributes on <th> elements and headers attributes on <td> elements listing the associated header ids

CAPTION AND SUMMARY:
- Always provide a <caption> that acts as a heading for the table
- For complex tables, include a summary either nested inside <caption> using a <span>, or via aria-describedby on the <table> pointing to a <p> element before the table

GENERAL:
- If the input data is too complex for one table, consider splitting it into multiple simpler tables
- Return only the HTML — no explanation, no markdown code fences, just the raw HTML elements`,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || '';
      const isCreditError = response.status === 429 &&
        (errorMessage.toLowerCase().includes('credit') ||
         errorMessage.toLowerCase().includes('balance'));

      return new Response(
        JSON.stringify({
          error: isCreditError ? 'credits_exhausted' : (errorMessage || 'Something went wrong'),
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const table = data.content[0].text;

    return new Response(JSON.stringify({ table }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/tabulate",
};
