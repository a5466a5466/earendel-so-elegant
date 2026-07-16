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

const galleryVariants = [
	['starlight-birthday.svg', 'gallery-starlight-01.jpg', 1600, 1000, 'centre', 'jpeg'],
	['summer-letter.svg', 'gallery-summer-02.jpg', 1000, 1400, 'north', 'jpeg'],
	['moonlit-message-transparent.svg', 'gallery-moonlit-03.png', 1200, 1200, 'centre', 'png'],
	['summer-letter.svg', 'gallery-summer-04.jpg', 1800, 900, 'centre', 'jpeg'],
	['starlight-birthday.svg', 'gallery-starlight-05.jpg', 900, 1350, 'north', 'jpeg'],
	['moonlit-message-transparent.svg', 'gallery-moonlit-06.png', 1400, 1050, 'east', 'png'],
	['summer-letter.svg', 'gallery-summer-07.jpg', 1080, 1080, 'west', 'jpeg'],
	['starlight-birthday.svg', 'gallery-starlight-08.jpg', 1600, 1200, 'centre', 'jpeg'],
	['moonlit-message-transparent.svg', 'gallery-moonlit-09.png', 900, 1200, 'north', 'png'],
	['summer-letter.svg', 'gallery-summer-10.jpg', 1500, 1000, 'east', 'jpeg'],
	['starlight-birthday.svg', 'gallery-starlight-11.jpg', 1000, 1250, 'west', 'jpeg'],
	['moonlit-message-transparent.svg', 'gallery-moonlit-12.png', 1280, 960, 'centre', 'png'],
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

for (const [inputName, outputName, width, height, position, format] of galleryVariants) {
	const pipeline = sharp(fileURLToPath(new URL(`./${inputName}`, sourceDirectory)), { density: 192 })
		.resize(width, height, { fit: 'cover', position });
	const output = fileURLToPath(new URL(`./${outputName}`, outputDirectory));

	if (format === 'jpeg') {
		await pipeline.jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toFile(output);
	} else {
		await pipeline.png({ compressionLevel: 9 }).toFile(output);
	}
}
