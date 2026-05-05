import { createNavigation } from "next-intl/navigation";
import { routing } from "../next-intl.config";

export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
