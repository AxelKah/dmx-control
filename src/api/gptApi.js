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
    const colors = data.completion.split(",").map((color) => color.trim());

    // check if valid hex
    for (const color of colors) {
      if (!/^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(color)) {
        throw new Error(`Invalid color format: ${color}`);
      }
    }

    return colors;
  } else {
    throw new Error("Failed to get the colors");
  }
};
