'use client';

import { FaGithub } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/ButtonThemeChanger';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
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
					<Image
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
							<FaGithub className="h-4 w-4" />
						</Button>
					</Link>
					<ThemeChanger />
				</div>
			</div>
		</header>
	);
}
