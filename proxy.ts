import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './next-intl.config';

// Built once at module scope. Calling `createMiddleware(routing)` inside the
// handler rebuilt the matcher and locale negotiator on every single request.
const handle = createMiddleware(routing);

export default function proxy(request: NextRequest) {
	return handle(request);
}

export const config = {
	// Match only internationalized pathnames
	matcher: [
		// Match all pathnames except for:
		// - API routes
		// - _next (Next.js internals)
		// - Static files (images, etc.)
		'/((?!api|_next|.*\\..*).*)',
	],
};
