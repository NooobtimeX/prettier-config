import { NextRequest, NextResponse } from "next/server";
import * as prettier from "prettier";

export async function POST(request: NextRequest) {
	try {
		const { code, options } = await request.json();

		if (!code) {
			return NextResponse.json({ error: "Code is required" }, { status: 400 });
		}

		// Format the code using prettier
		const formatted = await prettier.format(code, {
			parser: "babel",
			...options,
		});

		return NextResponse.json({ formatted });
	} catch (error) {
		console.error("Formatting error:", error);
		return NextResponse.json(
			{ error: "Failed to format code" },
			{ status: 500 }
		);
	}
}
