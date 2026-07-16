export type MainAudioPlayResult = 'playing' | 'sound-disabled' | 'failed';

class LabAudioManager {
	private readonly primaryAudio = new Set<HTMLAudioElement>();
	private activeAudio?: HTMLAudioElement;
	private soundEnabled = false;

	registerPrimary(audio: HTMLAudioElement) {
		this.primaryAudio.add(audio);
		audio.muted = !this.soundEnabled;
		return () => this.unregisterPrimary(audio);
	}

	unregisterPrimary(audio: HTMLAudioElement) {
		audio.pause();
		this.primaryAudio.delete(audio);
		if (this.activeAudio === audio) this.activeAudio = undefined;
	}

	setSoundEnabled(enabled: boolean) {
		this.soundEnabled = enabled;
		if (!enabled) this.pauseAll();
		this.primaryAudio.forEach((audio) => {
			audio.muted = !enabled;
		});
	}

	isSoundEnabled() {
		return this.soundEnabled;
	}

	getActiveAudio() {
		return this.activeAudio;
	}

	async play(audio: HTMLAudioElement): Promise<MainAudioPlayResult> {
		if (!this.soundEnabled) return 'sound-disabled';
		if (!this.primaryAudio.has(audio)) this.registerPrimary(audio);
		this.primaryAudio.forEach((candidate) => {
			if (candidate !== audio) candidate.pause();
		});
		this.activeAudio = audio;
		audio.muted = false;
		try {
			await audio.play();
			return 'playing';
		} catch {
			if (this.activeAudio === audio) this.activeAudio = undefined;
			return 'failed';
		}
	}

	pause(audio: HTMLAudioElement) {
		audio.pause();
		if (this.activeAudio === audio) this.activeAudio = undefined;
	}

	pauseAll() {
		this.primaryAudio.forEach((audio) => audio.pause());
		this.activeAudio = undefined;
	}
}

export const labAudioManager = new LabAudioManager();
