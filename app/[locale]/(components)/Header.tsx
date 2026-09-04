'use client';

import { GithubIcon } from '@/components/GithubIcon';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/ButtonThemeChanger';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { REPOSITORY } from '@/common/constants';

export default function Header() {
	const t = useTranslations('Header');
	// Reuses the Footer's link labels rather than adding a Header namespace:
	// they are already translated in all 20 locales and name the same routes.
	const tNav = useTranslations('Footer.quickLinks');
	const brandName = t('brand.name');
	return (
		<header>
			<div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
				{/* Logo and Title */}
				<Link
					href="/"
					className="flex items-center space-x-3"
				>
					{/* Plain <img>: this is a 20 KB .ico served as-is. Routing it through
					    next/image only added a round-trip and pulled sharp + libvips
					    (16 MB) into the standalone build for a format the optimizer
					    passes through untouched anyway. */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/favicon.ico"
						alt={brandName}
						width={32}
						height={32}
						className="h-8 w-8 rounded-md"
					/>
					{/* Deliberately NOT an <h1>: this brand mark renders on every route, so an
					    h1 here gave /about, /faq and /privacy two h1s and made the home
					    page's only h1 the bare brand name. Each route owns its own h1. */}
					<span className="text-xl font-semibold tracking-tight">{brandName}</span>
				</Link>

				{/* Until this existed the header linked to exactly one internal page —
				    "/" — and every other route was reachable only from the footer.
				    Hidden below sm so the h-screen playground header stays uncrowded
				    on mobile, where the footer links remain the way in. */}
				<nav
					aria-label={tNav('title')}
					className="ms-6 me-auto hidden items-center gap-5 text-sm sm:flex"
				>
					<Link
						href="/options"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						{tNav('options')}
					</Link>
					<Link
						href="/faq"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						{tNav('faq')}
					</Link>
					<Link
						href="/about"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						{tNav('about')}
					</Link>
				</nav>

				{/* Right-side Actions */}
				<div className="flex items-center gap-4">
					<LanguageSwitcher />
					<Link href={REPOSITORY.GITHUB_URL}>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							aria-label={t('aria.repository')}
						>
							<GithubIcon className="h-4 w-4" />
						</Button>
					</Link>
					<ThemeChanger />
				</div>
			</div>
		</header>
	);
}
