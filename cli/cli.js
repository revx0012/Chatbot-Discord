import readline from "readline";
import fs from "fs";
import { Client } from "@gradio/client";

(async () => {
  // Read system prompt from file, remove newlines and trim spaces
  let systemPrompt = "";
  try {
    systemPrompt = fs.readFileSync("systemprompt.txt", "utf8").replace(/[\r\n]+/g, " ").trim();
  } catch (err) {
    console.error("Error reading systemprompt.txt:", err);
    process.exit(1);
  }

  // Connect to the Gradio space
  const client = await Client.connect("userlollolol1/smallai");

  console.log("Setting system prompt...");
  await client.predict("/chat", {
    message: systemPrompt,
    system_message: systemPrompt,
    max_tokens: 4096,
    temperature: 0.1,
    top_p: 0.1,
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask() {
    rl.question("\x1b[34m[YOU]: \x1b[0m", async (prompt) => {
      if (prompt.toLowerCase() === "exit") {
        console.log("\nPress any key to exit...");
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", () => process.exit(0));
        return;
      }

      try {
        const result = await client.predict("/chat", {
          message: prompt,
          system_message: systemPrompt,
          max_tokens: 100,
          temperature: 0.1,
          top_p: 0.1,
        });

        console.log(`\x1b[32m[BOT]: \x1b[0m${result.data}`);
      } catch (err) {
        console.error("Error getting response:", err);
      }

      ask();
    });
  }

  ask();
})();
