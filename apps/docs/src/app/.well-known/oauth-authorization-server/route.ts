import {absoluteUrl, getRequestOrigin, jsonResponse} from "@/lib/agent-discovery";

export const dynamic = "force-dynamic";
export const revalidate = false;

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);

  return jsonResponse({
    authorization_endpoint: absoluteUrl(origin, "/.well-known/oauth/not-supported/authorize"),
    authorization_response_iss_parameter_supported: false,
    grant_types_supported: [],
    sy_ui_public_api_authentication:
      "SY UI public documentation and MCP data APIs are currently unauthenticated and read-only; no OAuth grants are advertised for public access.",
    issuer: origin,
    jwks_uri: absoluteUrl(origin, "/.well-known/jwks.json"),
    response_types_supported: [],
    scopes_supported: [],
    service_documentation: absoluteUrl(origin, "/.well-known/api-catalog"),
    token_endpoint: absoluteUrl(origin, "/.well-known/oauth/not-supported/token"),
  });
}
