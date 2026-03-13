// ─── server.js ───────────────────────────────────────────────────────────────
// Express backend that proxies API calls to either:
// 1. Ollama (Local models - FREE) - Recommended
// 2. Anthropic Claude API (Cloud - Requires paid account)
// Run with: node server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── API Provider Configuration ────────────────────────────────────────────────
const PROVIDER = process.env.AI_PROVIDER || "ollama"; // "ollama" or "anthropic"
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || "http://localhost:11434";
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;

console.log(`\n📡 Using AI Provider: ${PROVIDER.toUpperCase()}`);
console.log(
  `${PROVIDER === "ollama" ? "🆓 FREE - Local Model" : "💳 Paid - Anthropic API"}\n`,
);

// ── Health Check Endpoint ────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: PROVIDER,
    timestamp: new Date().toISOString(),
  });
});

// ── Main API Endpoint ────────────────────────────────────────────────────────
app.post("/api/claude", async (req, res) => {
  const { systemPrompt, userPrompt, model, maxTokens } = req.body;

  if (!systemPrompt || !userPrompt || !model || !maxTokens) {
    return res.status(400).json({
      error:
        "Missing required fields: systemPrompt, userPrompt, model, maxTokens",
    });
  }

  try {
    if (PROVIDER === "ollama") {
      return await handleOllamaRequest(
        systemPrompt,
        userPrompt,
        maxTokens,
        res,
      );
    } else if (PROVIDER === "anthropic") {
      return await handleAnthropicRequest(
        systemPrompt,
        userPrompt,
        model,
        maxTokens,
        res,
      );
    }
  } catch (error) {
    console.error("💥 Server error:", error.message);
    res.status(500).json({
      error: `Server error: ${error.message}`,
    });
  }
});

// ── Ollama Handler (FREE Local Model) ────────────────────────────────────────
async function handleOllamaRequest(systemPrompt, userPrompt, maxTokens, res) {
  try {
    console.log("🔄 Calling Ollama API (Local - Free)...");

    // Combine system and user prompts for Ollama
    const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;

    // ⚠️ Cap tokens for Ollama to reduce memory usage on low-RAM systems
    // Limit to 400 tokens (sufficient for quiz generation) to fit in ~1.7GB available RAM
    const OLLAMA_MAX_TOKENS = Math.min(maxTokens, 400);

    console.log(`📤 Sending request to Ollama on ${OLLAMA_ENDPOINT}...`);
    console.log(
      `   (Token limit capped at ${OLLAMA_MAX_TOKENS} for memory efficiency)`,
    );

    const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "orca-mini", // Better than phi at JSON: orca-mini (2GB), mistral (4GB), phi (1.6GB)
        prompt: fullPrompt,
        stream: false,
        num_predict: OLLAMA_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Ollama error:", {
        status: response.status,
        error: err,
      });

      if (response.status === 404) {
        return res.status(503).json({
          error:
            "Ollama model not found. Please pull a model: ollama pull orca-mini (or ollama pull mistral)",
        });
      }

      return res.status(response.status).json({
        error: `Ollama error ${response.status}: ${err}`,
      });
    }

    console.log("📥 Parsing Ollama response...");
    const data = await response.json();
    console.log("✅ Ollama response received:", {
      responseLength: data.response?.length || 0,
      totalTime: data.total_duration
        ? (data.total_duration / 1e9).toFixed(2) + "s"
        : "unknown",
    });

    // Format response to match Claude API structure for compatibility
    res.json({
      content: [{ type: "text", text: data.response }],
      usage: {
        input_tokens: Math.ceil(systemPrompt.length / 4),
        output_tokens: Math.ceil(data.response.length / 4),
      },
    });
  } catch (error) {
    console.error("❌ Ollama connection error:", error.message);
    console.error("   Stack:", error.stack);
    res.status(503).json({
      error: `Cannot connect to Ollama. Make sure Ollama is running on ${OLLAMA_ENDPOINT}. Error: ${error.message}`,
    });
  }
}

// ── Anthropic Handler (Paid API) ─────────────────────────────────────────────
async function handleAnthropicRequest(
  systemPrompt,
  userPrompt,
  model,
  maxTokens,
  res,
) {
  if (!ANTHROPIC_API_KEY) {
    return res.status(401).json({
      error:
        "VITE_ANTHROPIC_API_KEY not set. Switch to Ollama or add Anthropic API key.",
    });
  }

  try {
    console.log("🔄 Calling Anthropic Claude API...");

    const response = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Anthropic API error:", {
        status: response.status,
        error: err,
      });
      return res.status(response.status).json({
        error: `Anthropic API error ${response.status}: ${err}`,
      });
    }

    const data = await response.json();
    console.log("✅ Anthropic response received");
    res.json(data);
  } catch (error) {
    console.error("💥 Anthropic connection error:", error.message);
    res.status(500).json({
      error: `Anthropic API error: ${error.message}`,
    });
  }
}

app.listen(PORT, () => {
  console.log(`\n🚀 API Proxy server running at http://localhost:${PORT}`);
  console.log(`📡 API endpoint: POST http://localhost:${PORT}/api/claude`);
  console.log(`🏥 Health check: GET http://localhost:${PORT}/api/health\n`);
});
