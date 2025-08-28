import createMiddleware from "next-intl/middleware";
import { routing } from "./next-intl.config";

export default createMiddleware(routing);

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
