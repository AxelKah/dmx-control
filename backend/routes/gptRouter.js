const express = require("express");
const router = express.Router();

const GPT_KEY = process.env.GPT_KEY;

router.post("/completions", async (req, res) => {
  try {
    const { role, prompt } = req.body;

    // Check that role and prompt was provided
    if (!role || !prompt) {
      return res.status(400).json({ error: "Prompt and role is required." });
    }

    // Check if the role is allowed
    if (!allowedRoles[role]) {
      return res.status(400).json({ error: "Invalid role provided." });
    }

    // Get role instructions and generate the completion for the given prompt
    const roleInstructions = allowedRoles[role];
    const completion = await promptGPT(roleInstructions, prompt);

    // Respond with the completion
    res.status(200).json({ completion });
  } catch (error) {
    console.error("Error generating completion:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the completion." });
  }
});

const allowedRoles = {
  colors: `
    Your job is to get given company's brand colors without any other explanations. 
    Ensure it is in hex format and return only the hex codes.
    Separate the values with a comma. 
    `,
};

// Fetch response from OpenAI API
const promptGPT = async (roleInstructions, prompt) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GPT_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: roleInstructions,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();

    // Extract message from the array in response data
    const message = data.choices[0].message.content;
    
    return message;
  } catch (error) {
    console.error("Error fetching the completion:", error);
    throw new Error("Failed to fetch the completion.");
  }
};

module.exports = router;
