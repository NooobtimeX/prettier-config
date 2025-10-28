"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeChanger = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(timer);
	}, []);

	if (!mounted) return null;

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<Button
			onClick={toggleTheme}
			variant="outline"
			size="icon"
			className="rounded-full"
			aria-label="Toggle theme"
		>
			{theme === "dark" ?
				<Moon size={20} />
			:	<Sun size={20} />}
		</Button>
	);
};

export default ThemeChanger;
