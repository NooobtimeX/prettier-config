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
					<h1 className="text-xl font-semibold tracking-tight">{brandName}</h1>
				</Link>

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
