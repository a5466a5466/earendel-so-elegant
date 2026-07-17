// @ts-check
import { readFile, readdir, rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

/**
 * Keep Lab available during development and explicit Lab builds, while
 * excluding it from the default production output.
 *
 * @returns {import('astro').AstroIntegration}
 */
const labOutputGuard = () => {
	let labEnabled = false;
	const explicitLabBuild =
		process.env.npm_lifecycle_event === 'build:lab' ||
		process.argv.some((argument, index) =>
			argument === '--mode' && process.argv[index + 1] === 'lab',
		);

	return {
		name: 'earendel-lab-output-guard',
		hooks: {
			'astro:config:setup': ({ command }) => {
				labEnabled = command === 'dev' || explicitLabBuild;
			},
			'astro:build:done': async ({ dir, logger }) => {
				if (labEnabled) return;

				const astroAssetDirectory = new URL('./_astro/', dir);
				const labAssetPattern = /^(?:LabLayout\.|LabControls\.|LabNavigation\.|preferences(?:\.astro[^.]*)?\.|navigation(?:\.astro[^.]*)?\.|scroll(?:\.astro[^.]*)?\.|carousel(?:\.astro[^.]*)?\.|lightbox(?:\.astro[^.]*)?\.|video(?:\.astro[^.]*)?\.|youtube(?:\.astro[^.]*)?\.|audio(?:\.astro[^.]*)?\.|sound-effects(?:\.astro[^.]*)?\.|audio-manager\.|gallery-|starlight-birthday\.|summer-letter\.|moonlit-message-transparent\.)/;
				const astroAssets = await readdir(astroAssetDirectory).catch(() => []);
				const labOnlyAssets = astroAssets.filter((file) => labAssetPattern.test(file));

				await Promise.all([
					rm(new URL('./lab/', dir), { recursive: true, force: true }),
					rm(new URL('./lab-assets/', dir), { recursive: true, force: true }),
					...labOnlyAssets.map((file) =>
						rm(new URL(file, astroAssetDirectory), { force: true }),
					),
				]);

				const outputFiles = await readdir(dir);
				const sitemapFiles = outputFiles.filter((file) => /^sitemap.*\.xml$/i.test(file));

				for (const sitemapFile of sitemapFiles) {
					const sitemap = await readFile(new URL(sitemapFile, dir), 'utf8');
					if (sitemap.includes('/lab/')) {
						throw new Error(
							`Production sitemap must not include Lab routes: ${sitemapFile}`,
						);
					}
				}

				logger.info('Excluded Lab routes and Lab-only assets from the production output.');
			},
		},
	};
};

// https://astro.build/config
export default defineConfig({
	integrations: [labOutputGuard()],
});
