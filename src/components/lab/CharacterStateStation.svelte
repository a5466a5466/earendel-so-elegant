<script lang="ts">
	import { onMount } from 'svelte';
	import {
		onLabPreferencesChange,
		type ResolvedMotionPreference,
		type ResolvedPerformancePreference,
	} from '../../scripts/lab/preferences';

	type CharacterState = 'idle' | 'spark' | 'cheer' | 'sleep';
	type InteractionEntry = { id: number; message: string };

	const states: Array<{
		id: CharacterState;
		label: string;
		title: string;
		description: string;
	}> = [
		{ id: 'idle', label: '待機', title: '靜候星訊', description: '保持安靜，等待下一次互動。' },
		{ id: 'spark', label: '星光', title: '接住星光', description: '以短暫星芒回應使用者。' },
		{ id: 'cheer', label: '應援', title: '一起應援', description: '切換成明亮、積極的應援狀態。' },
		{ id: 'sleep', label: '休眠', title: '進入休眠', description: '降低裝飾動態，保留主要資訊。' },
	];

	let currentState = $state<CharacterState>('idle');
	let interactions = $state<InteractionEntry[]>([]);
	let sequence = $state(0);
	let hydrated = $state(false);
	let resolvedMotion = $state<ResolvedMotionPreference>('full');
	let resolvedPerformance = $state<ResolvedPerformancePreference>('standard');
	let currentDefinition = $derived(states.find((state) => state.id === currentState) ?? states[0]);

	const selectState = (nextState: CharacterState) => {
		currentState = nextState;
		sequence += 1;
		const selected = states.find((state) => state.id === nextState) ?? states[0];
		interactions = [
			{ id: sequence, message: `切換為「${selected.label}」狀態` },
			...interactions,
		].slice(0, 5);
	};

	const handleStateKeydown = (event: KeyboardEvent, index: number) => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const nextIndex = event.key === 'Home'
			? 0
			: event.key === 'End'
				? states.length - 1
				: (index + (event.key === 'ArrowRight' ? 1 : -1) + states.length) % states.length;
		const button = (event.currentTarget as HTMLElement)
			.parentElement?.querySelectorAll<HTMLButtonElement>('button')[nextIndex];
		button?.focus();
		selectState(states[nextIndex].id);
	};

	const reset = () => {
		currentState = 'idle';
		interactions = [];
	};

	onMount(() => {
		hydrated = true;
		return onLabPreferencesChange((detail) => {
			resolvedMotion = detail.resolvedMotion;
			resolvedPerformance = detail.resolvedPerformance;
		});
	});
</script>

<article
	class="state-station state-station--svelte"
	class:is-motion-reduced={resolvedMotion === 'reduce'}
	class:is-economy={resolvedPerformance === 'economy'}
	data-state={currentState}
	data-svelte-hydrated={hydrated ? 'true' : 'false'}
	aria-labelledby="svelte-station-title"
>
	<header class="state-station__header">
		<div>
			<p class="state-station__eyebrow">Svelte 5 Island</p>
			<h2 id="svelte-station-title">Svelte 狀態台</h2>
		</div>
		<span class="state-station__runtime" aria-label={hydrated ? 'Svelte 已完成 hydration' : '伺服器端內容已就緒'}>
			{hydrated ? 'Hydrated' : 'SSR ready'}
		</span>
	</header>

	<div class="state-station__stage">
		<div class="state-character" aria-hidden="true">
			<i class="state-character__orbit"></i>
			<i class="state-character__core"></i>
			<span class="state-character__spark-track state-character__spark-track--one"><i class="state-character__spark state-character__spark--one"></i></span>
			<span class="state-character__spark-track state-character__spark-track--two"><i class="state-character__spark state-character__spark--two"></i></span>
			<span class="state-character__spark-track state-character__spark-track--three"><i class="state-character__spark state-character__spark--three"></i></span>
		</div>
		<div class="state-station__copy" aria-live="polite" aria-atomic="true">
			<span>目前狀態 · {currentDefinition.label}</span>
			<h3>{currentDefinition.title}</h3>
			<p>{currentDefinition.description}</p>
		</div>
	</div>

	<div class="state-station__controls" aria-label="選擇 Svelte 角色狀態">
		{#each states as state, index}
			<button
				type="button"
				class:is-active={currentState === state.id}
				aria-pressed={currentState === state.id}
				onclick={() => selectState(state.id)}
				onkeydown={(event) => handleStateKeydown(event, index)}
			>
				{state.label}
			</button>
		{/each}
	</div>

	<div class="state-station__meta" aria-live="polite">
		<span>動態：{resolvedMotion === 'reduce' ? '減少' : '完整'}</span>
		<span>效能：{resolvedPerformance === 'economy' ? '節能' : '標準'}</span>
	</div>

	<div class="state-station__log">
		<div>
			<h3>最近互動</h3>
			<button type="button" onclick={reset} disabled={interactions.length === 0}>重設</button>
		</div>
		{#if interactions.length > 0}
			<ol aria-label="Svelte 最近互動紀錄">
				{#each interactions as interaction (interaction.id)}
					<li>{interaction.message}</li>
				{/each}
			</ol>
		{:else}
			<p class="state-station__empty">尚無互動，請選擇一個角色狀態。</p>
		{/if}
	</div>
</article>
