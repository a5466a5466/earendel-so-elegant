import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = new URL('../', import.meta.url);
const sourceDirectory = new URL('./src/assets/lab/events/', projectRoot);
const outputDirectory = new URL('./raster/', sourceDirectory);
await mkdir(outputDirectory, { recursive: true });

const conversions = [
	{
		input: new URL('./starlight-birthday.svg', sourceDirectory),
		output: new URL('./starlight-birthday.jpg', outputDirectory),
		format: 'jpeg',
	},
	{
		input: new URL('./summer-letter.svg', sourceDirectory),
		output: new URL('./summer-letter.jpg', outputDirectory),
		format: 'jpeg',
	},
	{
		input: new URL('./moonlit-message-transparent.svg', sourceDirectory),
		output: new URL('./moonlit-message-transparent.png', outputDirectory),
		format: 'png',
	},
];

for (const conversion of conversions) {
	const pipeline = sharp(fileURLToPath(conversion.input), { density: 192 }).resize(2400, 1600, {
		fit: 'fill',
	});

	if (conversion.format === 'jpeg') {
		await pipeline
			.jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
			.toFile(fileURLToPath(conversion.output));
	} else {
		await pipeline
			.png({ compressionLevel: 9 })
			.toFile(fileURLToPath(conversion.output));
	}
}
