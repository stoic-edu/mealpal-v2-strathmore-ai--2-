import type { NextApiRequest, NextApiResponse } from "next";

// The Python model server started from /backend (see backend/README.md).
// Configure with AI_BACKEND_URL in .env.local if it's running somewhere else.
export const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000";

/** Forwards a POST request's JSON body to the given model-server path and relays
 *  the response back to the client, so the pkl models never need to run in Node. */
export async function proxyToBackend(
  req: NextApiRequest,
  res: NextApiResponse,
  backendPath: string
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const upstream = await fetch(`${AI_BACKEND_URL}${backendPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({
      error: "AI model server unreachable",
      detail: `Is the backend running at ${AI_BACKEND_URL}? See backend/README.md.`,
    });
  }
}
