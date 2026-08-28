import {AGENT_API_VERSION, jsonResponse} from "@/lib/agent-discovery";

export const dynamic = "force-dynamic";
export const revalidate = false;

export async function GET() {
  return jsonResponse({
    service: "sy-inc-docs-agent-api",
    status: "ok",
    version: AGENT_API_VERSION,
  });
}
