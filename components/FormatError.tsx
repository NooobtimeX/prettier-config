/**
 * Thin red strip used by Preview/Your-Code panels to surface Prettier's parse
 * errors. The previous good output stays visible underneath so the user can
 * see where they were before the broken edit.
 */
export function FormatError({ message }: { message: string }) {
	return (
		<div className="border-destructive/40 bg-destructive/10 text-destructive mb-2 rounded-md border px-3 py-1.5 font-mono text-xs whitespace-pre-wrap">
			{message}
		</div>
	);
}
