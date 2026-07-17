export type MainAudioPlayResult = 'playing' | 'sound-disabled' | 'failed';
export type LabSoundEffect = 'success' | 'cancel' | 'hover';
export type SoundEffectTrigger = 'action' | 'hover';
export type SoundEffectPlayResult =
	| 'playing'
	| 'sound-disabled'
	| 'interaction-required'
	| 'throttled'
	| 'failed';

class LabAudioManager {
	private readonly primaryAudio = new Set<HTMLAudioElement>();
	private activeAudio?: HTMLAudioElement;
	private effectAudio?: HTMLAudioElement;
	private effectSources: Partial<Record<LabSoundEffect, string>> = {};
	private soundEnabled = false;
	private effectsUnlocked = false;
	private economyMode = false;
	private lastEffectAt = 0;
	private lastEffect?: LabSoundEffect;

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

	registerEffectChannel(
		audio: HTMLAudioElement,
		sources: Partial<Record<LabSoundEffect, string>>,
	) {
		this.unregisterEffectChannel();
		this.effectAudio = audio;
		this.effectSources = { ...sources };
		audio.preload = 'none';
		audio.volume = this.economyMode ? 0.22 : 0.32;
		return () => {
			if (this.effectAudio === audio) this.unregisterEffectChannel();
		};
	}

	unregisterEffectChannel() {
		if (this.effectAudio) {
			this.effectAudio.pause();
			this.effectAudio.removeAttribute('src');
			this.effectAudio.load();
		}
		this.effectAudio = undefined;
		this.effectSources = {};
		this.lastEffect = undefined;
		this.lastEffectAt = 0;
	}

	noteUserInteraction() {
		this.effectsUnlocked = true;
	}

	lockEffects() {
		this.effectsUnlocked = false;
		this.pauseEffects();
	}

	setEconomyMode(enabled: boolean) {
		this.economyMode = enabled;
		if (this.effectAudio) this.effectAudio.volume = enabled ? 0.22 : 0.32;
	}

	async playEffect(
		effect: LabSoundEffect,
		trigger: SoundEffectTrigger = 'action',
	): Promise<SoundEffectPlayResult> {
		if (!this.soundEnabled) return 'sound-disabled';
		if (!this.effectsUnlocked) return 'interaction-required';
		if (this.economyMode && trigger === 'hover') return 'throttled';

		const audio = this.effectAudio;
		const source = this.effectSources[effect];
		if (!audio || !source) return 'failed';

		const now = performance.now();
		const cooldown = trigger === 'hover' ? 320 : 70;
		if (this.lastEffect === effect && now - this.lastEffectAt < cooldown) return 'throttled';
		this.lastEffect = effect;
		this.lastEffectAt = now;

		audio.pause();
		if (audio.getAttribute('src') !== source) {
			audio.src = source;
			audio.load();
		} else if (audio.readyState > 0) {
			audio.currentTime = 0;
		}
		try {
			await audio.play();
			return 'playing';
		} catch {
			return 'failed';
		}
	}

	pauseEffects() {
		if (!this.effectAudio) return;
		this.effectAudio.pause();
		if (this.effectAudio.readyState > 0) this.effectAudio.currentTime = 0;
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
		this.pauseEffects();
		this.activeAudio = undefined;
	}
}

export const labAudioManager = new LabAudioManager();
