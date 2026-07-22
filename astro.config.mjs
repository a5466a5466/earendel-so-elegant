// @ts-check
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

const githubPagesSite = 'https://a5466a5466.github.io';
const githubPagesBase = '/earendel-so-elegant';
const explicitLabBuild =
	process.env.npm_lifecycle_event === 'build:lab' ||
	process.argv.some((argument, index) =>
		argument === '--mode' && process.argv[index + 1] === 'lab',
	);
const productionBuild =
	!explicitLabBuild &&
	(process.env.npm_lifecycle_event === 'build' || process.argv.includes('build'));

const textOutputExtensions = new Set([
	'.css',
	'.html',
	'.js',
	'.json',
	'.map',
	'.webmanifest',
	'.xml',
]);

/**
 * Keep local Lab URLs rooted at `/lab/`, but prefix literal Lab paths in the
 * production artifact for GitHub Project Pages.
 *
 * @returns {import('astro').AstroIntegration}
 */
const githubPagesLabPaths = () => ({
	name: 'earendel-github-pages-lab-paths',
	hooks: {
		'astro:build:done': async ({ dir, logger }) => {
			if (!productionBuild) return;

			/** @param {URL} directory */
			const rewriteDirectory = async (directory) => {
				const entries = await readdir(directory, { withFileTypes: true });

				await Promise.all(entries.map(async (entry) => {
					const entryUrl = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
					if (entry.isDirectory()) return rewriteDirectory(entryUrl);

					const extension = entry.name.slice(entry.name.lastIndexOf('.'));
					if (!textOutputExtensions.has(extension)) return;

					const original = await readFile(entryUrl, 'utf8');
					const rewritten = original.replace(
						/(["'`(=])\/(lab(?:-assets)?\/)/g,
						`$1${githubPagesBase}/$2`,
					);

					if (rewritten !== original) await writeFile(entryUrl, rewritten, 'utf8');
				}));
			};

			await rewriteDirectory(dir);
			logger.info(`Prefixed public Lab paths with ${githubPagesBase}.`);
		},
	},
});

// https://astro.build/config
export default defineConfig({
	site: githubPagesSite,
	base: productionBuild ? githubPagesBase : '/',
	integrations: [svelte(), githubPagesLabPaths()],
	vite: {
		resolve: {
			alias: {
				'@framework': fileURLToPath(new URL('./src/vendor/live2d/framework', import.meta.url)),
			},
		},
	},
});
