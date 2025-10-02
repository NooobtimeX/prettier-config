import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./next-intl.config";

export default function proxy(request: NextRequest) {
	return createMiddleware(routing)(request);
}

export const config = {
	// Match only internationalized pathnames
	matcher: [
		// Match all pathnames except for:
		// - API routes
		// - _next (Next.js internals)
		// - Static files (images, etc.)
		"/((?!api|_next|_vercel|.*\\..*).*)",
	],
};
