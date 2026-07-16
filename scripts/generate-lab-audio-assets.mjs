import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(projectRoot, 'public/lab-assets/audio');
const sampleRate = 24_000;
const duration = 8;

const writeAscii = (buffer, offset, value) => buffer.write(value, offset, 'ascii');

const createWave = ({ notes, pulse }) => {
	const sampleCount = sampleRate * duration;
	const dataSize = sampleCount * 2;
	const buffer = Buffer.alloc(44 + dataSize);
	writeAscii(buffer, 0, 'RIFF');
	buffer.writeUInt32LE(36 + dataSize, 4);
	writeAscii(buffer, 8, 'WAVE');
	writeAscii(buffer, 12, 'fmt ');
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20);
	buffer.writeUInt16LE(1, 22);
	buffer.writeUInt32LE(sampleRate, 24);
	buffer.writeUInt32LE(sampleRate * 2, 28);
	buffer.writeUInt16LE(2, 32);
	buffer.writeUInt16LE(16, 34);
	writeAscii(buffer, 36, 'data');
	buffer.writeUInt32LE(dataSize, 40);

	for (let index = 0; index < sampleCount; index += 1) {
		const time = index / sampleRate;
		const segment = Math.min(notes.length - 1, Math.floor(time / (duration / notes.length)));
		const localTime = time % (duration / notes.length);
		const attack = Math.min(1, localTime / 0.08);
		const release = Math.min(1, (duration / notes.length - localTime) / 0.32);
		const envelope = Math.max(0, Math.min(attack, release));
		const fade = Math.min(1, time / 0.35, (duration - time) / 0.55);
		const frequency = notes[segment];
		const fundamental = Math.sin(2 * Math.PI * frequency * time);
		const overtone = Math.sin(2 * Math.PI * frequency * 2 * time + 0.4) * 0.22;
		const shimmer = Math.sin(2 * Math.PI * frequency * 3 * time + 1.1) * 0.08;
		const breathing = 0.78 + Math.sin(2 * Math.PI * pulse * time) * 0.12;
		const sample = (fundamental + overtone + shimmer) * envelope * fade * breathing * 0.2;
		buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2);
	}
	return buffer;
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
	writeFile(resolve(outputDirectory, 'starlight-letter.wav'), createWave({
		notes: [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392],
		pulse: 0.25,
	})),
	writeFile(resolve(outputDirectory, 'moonlit-reply.wav'), createWave({
		notes: [220, 293.66, 369.99, 440, 369.99, 293.66, 246.94, 329.63],
		pulse: 0.2,
	})),
]);

console.log(`Generated two ${duration}-second mono WAV fixtures in ${outputDirectory}`);
