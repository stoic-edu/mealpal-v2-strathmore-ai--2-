import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToBackend } from "@/lib/ai-proxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyToBackend(req, res, "/predict/waste");
}
