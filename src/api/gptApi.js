export const getCompanyColors = async (prompt) => {
  const role = "colors";

  const response = await fetch("http://localhost:5000/gpt/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role,
      prompt,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.completion;
  } else {
    throw new Error("Failed to get the colors");
  }
};
