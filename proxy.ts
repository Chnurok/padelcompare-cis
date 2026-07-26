import { NextRequest, NextResponse } from "next/server";

function unauthorized(message: string, status = 401) {
  return new NextResponse(message, {
    status,
    headers: status === 401 ? { "WWW-Authenticate": 'Basic realm="PadelCompare Admin"' } : undefined
  });
}

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return unauthorized("Admin access is not configured.", 503);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return unauthorized("Authentication required.");
  }

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    const suppliedUsername = separator >= 0 ? decoded.slice(0, separator) : "";
    const suppliedPassword = separator >= 0 ? decoded.slice(separator + 1) : "";

    if (suppliedUsername === username && suppliedPassword === password) {
      return NextResponse.next();
    }
  } catch {
    // Invalid base64 is handled as an authentication failure below.
  }

  return unauthorized("Invalid credentials.");
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
