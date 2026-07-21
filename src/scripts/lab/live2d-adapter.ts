type MotionGroup = 'Idle' | 'Tap' | 'FlickLeft';
type Live2DFixture = 'missing-model';

interface InitializeOptions {
	fixture?: Live2DFixture;
}

interface Live2DDelegate {
	initialize(canvas: HTMLCanvasElement): boolean;
	run(): void;
	pause(): void;
	resume(): void;
	playMotion(group: MotionGroup): void;
	isReady(): boolean;
}

interface DelegateConstructor {
	getInstance(): Live2DDelegate;
	releaseInstance(): void;
}

declare global {
	interface Window {
		Live2DCubismCore?: unknown;
	}
}

const CORE_SOURCE = '/lab-assets/live2d/core/live2dcubismcore.min.js';

const loadCore = async () => {
	if (window.Live2DCubismCore) return;
	const existing = document.querySelector<HTMLScriptElement>(`script[src="${CORE_SOURCE}"]`);
	if (existing) {
		await new Promise<void>((resolve, reject) => {
			existing.addEventListener('load', () => resolve(), { once: true });
			existing.addEventListener('error', () => reject(new Error('Cubism Core 載入失敗。')), { once: true });
		});
		return;
	}
	await new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = CORE_SOURCE;
		script.async = true;
		script.dataset.live2dCore = 'true';
		script.addEventListener('load', () => resolve(), { once: true });
		script.addEventListener('error', () => reject(new Error('Cubism Core 載入失敗。')), { once: true });
		document.head.append(script);
	});
};

const waitUntilReady = async (delegate: Live2DDelegate, timeoutMs = 30000) => {
	const started = performance.now();
	while (!delegate.isReady()) {
		if (performance.now() - started > timeoutMs) throw new Error('Koharu 模型載入逾時。');
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
};

export class Live2DAdapter {
	private delegate?: Live2DDelegate;
	private delegateClass?: DelegateConstructor;
	private disposed = false;

	async initialize(canvas: HTMLCanvasElement, options: InitializeOptions = {}) {
		await loadCore();
		const [module, define] = await Promise.all([
			import('../../vendor/live2d/demo/lappdelegate'),
			import('../../vendor/live2d/demo/lappdefine'),
		]);
		define.setResourcesPathForFixture(options.fixture === 'missing-model'
			? '/lab-assets/live2d/fixtures/missing-model/'
			: undefined);
		try {
			this.delegateClass = module.LAppDelegate;
			this.delegate = module.LAppDelegate.getInstance();
			if (!this.delegate.initialize(canvas)) throw new Error('WebGL 初始化失敗。');
			this.delegate.run();
			await waitUntilReady(this.delegate, options.fixture ? 4000 : 30000);
			if (this.disposed) throw new Error('Live2D 已在載入期間停止。');
		} catch (error) {
			this.dispose();
			throw options.fixture === 'missing-model'
				? new Error('測試模型不存在；已停止渲染並保留靜態 fallback。')
				: error;
		} finally {
			define.setResourcesPathForFixture();
		}
	}

	playMotion(group: MotionGroup) {
		this.delegate?.playMotion(group);
	}

	pause() {
		this.delegate?.pause();
	}

	resume() {
		this.delegate?.resume();
	}

	dispose() {
		if (this.disposed) return;
		this.disposed = true;
		this.delegateClass?.releaseInstance();
		this.delegate = undefined;
	}
}
