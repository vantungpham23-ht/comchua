<script lang="ts">
	import { generateCombo, type AIGeneratedCombo, type AIGeneratedDish, type LocationType, type BudgetLevel } from '$lib/groq';

	// State
	let selectedLocation = $state<LocationType>('vietnam');
	let selectedBudget = $state<BudgetLevel>('normal');
	let selectedPeople = $state(2);
	let currentCombo = $state<AIGeneratedCombo | null>(null);
	let showResult = $state(false);
	let isLoading = $state(false);
	let checkedItems = $state<Set<string>>(new Set());
	let showRecipe = $state<Set<number>>(new Set());
	let errorMessage = $state<string | null>(null);

	// Location options
	const locationOptions = [
		{ value: 'vietnam' as LocationType, label: 'Việt Nam', flag: 'VN' },
		{ value: 'europe' as LocationType, label: 'Châu Âu', flag: 'EU' }
	];

	// Budget options
	const budgetOptions = [
		{ value: 'famine' as BudgetLevel, label: 'Đói Bụng', desc: 'Rẻ, no bụng' },
		{ value: 'normal' as BudgetLevel, label: 'Bình Thường', desc: 'Ngon vừa vặn' },
		{ value: 'luxury' as BudgetLevel, label: 'Hôm Nay Sang!', desc: 'Bựa lên!' }
	];

	// People options
	const peopleOptions = [1, 2, 3, 4, 5, 6, 8, 10];

	// Handle generation
	async function handleGenerate() {
		isLoading = true;
		showResult = false;
		checkedItems = new Set();
		showRecipe = new Set();
		errorMessage = null;

		try {
			currentCombo = await generateCombo({
				location: selectedLocation,
				budget: selectedBudget,
				people: selectedPeople
			});
			showResult = true;
		} catch (error) {
			console.error('Error:', error);
			errorMessage = 'Lỗi rồi! Thử lại đi nào 😅';
		} finally {
			isLoading = false;
		}
	}

	// Toggle shopping item
	function toggleItem(itemName: string) {
		const newSet = new Set(checkedItems);
		if (newSet.has(itemName)) {
			newSet.delete(itemName);
		} else {
			newSet.add(itemName);
		}
		checkedItems = newSet;
	}

	// Toggle recipe
	function toggleRecipe(index: number) {
		const newSet = new Set(showRecipe);
		if (newSet.has(index)) {
			newSet.delete(index);
		} else {
			newSet.add(index);
		}
		showRecipe = newSet;
	}

	// Get all ingredients
	function getAllIngredients() {
		if (!currentCombo) return [];

		return currentCombo.dishes.flatMap((dish) =>
			dish.ingredients.map((i) => ({
				...i,
				dish: dish.name_vi
			}))
		);
	}

	// Get dish type label
	function getDishTypeLabel(type: string): { label: string; color: string } {
		const types: Record<string, { label: string; color: string }> = {
			main: { label: 'Món Chính', color: 'red' },
			side: { label: 'Món Phụ', color: 'green' },
			soup: { label: 'Canh/Súp', color: 'blue' },
			dessert: { label: 'Tráng Miệng', color: 'purple' },
			extra: { label: 'Món Khác', color: 'orange' }
		};
		return types[type] || types.extra;
	}
</script>

<svelte:head>
	<title>Cơm Nước Gì Chưa?</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 pb-16 overflow-x-hidden">
	<!-- Animated Background Elements -->
	<div class="fixed inset-0 pointer-events-none overflow-hidden">
		<div class="floating-emoji absolute top-20 left-10 opacity-20 text-6xl">🍜</div>
		<div class="floating-emoji absolute top-40 right-10 opacity-15 text-5xl" style="animation-delay: -2s">🍲</div>
		<div class="floating-emoji absolute bottom-40 left-20 opacity-10 text-7xl" style="animation-delay: -4s">🥢</div>
		<div class="floating-emoji absolute bottom-20 right-20 opacity-15 text-4xl" style="animation-delay: -3s">🍳</div>
	</div>

	<!-- Header -->
	<header class="px-6 py-8 text-center relative">
		<div class="relative inline-block">
			<div class="absolute -top-8 left-1/2 -translate-x-1/2">
				<svg class="w-16 h-16 animate-float" viewBox="0 0 64 64" fill="none">
					<ellipse cx="32" cy="48" rx="24" ry="8" fill="#FF6B35"/>
					<path d="M8 32C8 32 8 48 32 48C56 48 56 32 56 32V36C56 40 52 44 32 44C12 44 8 40 8 36V32Z" fill="#FF8C42"/>
					<path d="M8 32C8 32 8 48 32 48C56 48 56 32 56 32" stroke="#E85D04" stroke-width="3"/>
					<ellipse cx="32" cy="32" rx="24" ry="6" fill="#FFB347"/>
					<ellipse cx="32" cy="32" rx="20" ry="4" fill="#FFD93D"/>
					<path d="M24 28C24 28 28 32 32 28C36 24 40 28 40 28" stroke="#E85D04" stroke-width="2" stroke-linecap="round"/>
					<circle cx="26" cy="30" r="2" fill="#FF6B35"/>
					<circle cx="38" cy="30" r="2" fill="#FF6B35"/>
				</svg>
			</div>
			
			<h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 tracking-tight drop-shadow-sm mt-6 animate-title">
				Cơm Nước Gì Chưa?
			</h1>
			<p class="text-lg text-gray-600 mt-3 font-medium animate-fade-in" style="animation-delay: 0.2s">
				AI chọn món giúp bạn nè!
			</p>
		</div>
	</header>

	<main class="px-4 max-w-2xl mx-auto relative z-10">
		<!-- Location Selector -->
		<section class="mb-5 animate-slide-up" style="animation-delay: 0.3s">
			<p class="text-center text-sm text-gray-500 mb-3 font-semibold flex items-center justify-center gap-2">
				<svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/>
					<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
				</svg>
				Bạn ở đâu?
			</p>
			<div class="flex gap-3 justify-center">
				{#each locationOptions as option, i}
					<button
						onclick={() => selectedLocation = option.value}
						class="relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 border-2 shadow-lg btn-bouncy
						{selectedLocation === option.value
							? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-500 scale-105 shadow-xl'
							: 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:scale-102'}"
					>
						{#if selectedLocation === option.value}
							<span class="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pop">
								<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M5 12l5 5L20 7"/>
								</svg>
							</span>
						{/if}
						<span class="block text-xl mb-1">{option.flag}</span>
						<span class="block text-sm font-bold">{option.label}</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- People Selector -->
		<section class="mb-5 animate-slide-up" style="animation-delay: 0.35s">
			<p class="text-center text-sm text-gray-500 mb-3 font-semibold flex items-center justify-center gap-2">
				<svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
					<circle cx="9" cy="7" r="4"/>
					<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
					<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
				</svg>
				Nấu cho mấy người?
			</p>
			<div class="flex flex-wrap gap-2 justify-center">
				{#each peopleOptions as num}
					<button
						onclick={() => selectedPeople = num}
						class="w-12 h-12 rounded-xl font-bold transition-all duration-300 border-2 shadow-md btn-bouncy text-lg
						{selectedPeople === num
							? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-500 scale-110 shadow-xl'
							: 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:scale-105'}"
					>
						{num}+
					</button>
				{/each}
			</div>
		</section>

		<!-- Budget Selector -->
		<section class="mb-6 animate-slide-up" style="animation-delay: 0.4s">
			<p class="text-center text-sm text-gray-500 mb-3 font-semibold flex items-center justify-center gap-2">
				<svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
				</svg>
				Hôm nay khẩu vị thế nào?
			</p>
			<div class="flex gap-3 justify-center flex-wrap">
				{#each budgetOptions as option, i}
					<button
						onclick={() => selectedBudget = option.value}
						class="relative px-4 py-3 rounded-2xl font-bold transition-all duration-300 border-2 shadow-lg btn-bouncy min-w-[100px]
						{selectedBudget === option.value
							? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white border-orange-500 scale-105 shadow-xl'
							: 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}"
					>
						{#if selectedBudget === option.value}
							<span class="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pop">
								<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M5 12l5 5L20 7"/>
								</svg>
							</span>
						{/if}
						<span class="block text-2xl mb-1">
							{#if option.value === 'famine'}🍚{:else if option.value === 'normal'}🍜{:else}🦞{/if}
						</span>
						<span class="block text-xs font-bold">{option.label}</span>
						<span class="block text-xs opacity-70">{option.desc}</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- Summary before generating -->
		<div class="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 animate-slide-up" style="animation-delay: 0.45s">
			<div class="flex items-center justify-center gap-4 text-sm">
				<div class="flex items-center gap-1">
					<svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
					</svg>
					<span class="text-gray-600">
						{#if selectedLocation === 'vietnam'}Việt Nam{:else}Châu Âu{/if}
					</span>
				</div>
				<span class="text-gray-300">|</span>
				<div class="flex items-center gap-1">
					<svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
					</svg>
					<span class="text-gray-600">{selectedPeople}+ người</span>
				</div>
				<span class="text-gray-300">|</span>
				<div class="flex items-center gap-1">
					<span class="text-lg">
						{#if selectedBudget === 'famine'}🍚{:else if selectedBudget === 'normal'}🍜{:else}🦞{/if}
					</span>
					<span class="text-gray-600">
						{#if selectedBudget === 'famine'}Tiết kiệm{:else if selectedBudget === 'normal'}Vừa vặn{:else}Sang chảnh{/if}
					</span>
				</div>
			</div>
		</div>

		<!-- CTA Button -->
		<section class="text-center mb-8 animate-slide-up" style="animation-delay: 0.5s">
			<button
				onclick={handleGenerate}
				disabled={isLoading}
				class="group relative px-10 py-5 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white text-lg font-black rounded-3xl border-4 border-white shadow-2xl
					hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300
					disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
			>
				<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
				
				{#if isLoading}
					<span class="flex items-center gap-3 justify-center relative z-10">
						<svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m12.14 0l-2.83-2.83M9.76 9.76L6.93 6.93"/>
						</svg>
						AI đang quyết...
					</span>
				{:else}
					<span class="flex items-center gap-3 justify-center relative z-10">
						<svg class="w-6 h-6 group-hover:animate-wiggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
						</svg>
						QUYẾT ĐỊNH GIÙM NÈ!
					</span>
				{/if}
			</button>
		</section>

		<!-- Error Message -->
		{#if errorMessage}
			<div class="mb-6 p-4 bg-red-100 border-4 border-red-400 rounded-2xl text-red-700 text-center font-bold animate-shake">
				<div class="flex items-center justify-center gap-2">
					<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<path d="M12 8v4m0 4h.01"/>
					</svg>
					{errorMessage}
				</div>
			</div>
		{/if}

		<!-- Result Section -->
		{#if showResult && currentCombo}
			<section class="space-y-5">
				<!-- AI Recommendation -->
				<div class="card-fun p-5 bg-gradient-to-br from-yellow-100 to-orange-50 animate-slide-up">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
							<svg class="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="11" width="18" height="10" rx="2"/>
								<circle cx="8.5" cy="15.5" r="1.5"/>
								<circle cx="15.5" cy="15.5" r="1.5"/>
								<path d="M12 2l3 4h-6l3-4z"/>
							</svg>
						</div>
						<span class="text-sm font-bold text-orange-600 uppercase tracking-wide">AI gợi ý:</span>
					</div>
					<p class="text-gray-700 font-medium text-lg leading-relaxed">"{currentCombo.why_recommend}"</p>
				</div>

				<!-- Summary Card -->
				<div class="card-fun p-5 bg-gradient-to-r from-indigo-50 to-purple-50 animate-slide-up" style="animation-delay: 0.1s">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
							<svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
								<rect x="9" y="3" width="6" height="4" rx="1"/>
								<path d="M9 12h6"/>
								<path d="M9 16h6"/>
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-black text-gray-800">Tóm Tắt Bữa Ăn</h3>
							<p class="text-sm text-gray-500">{currentCombo.dishes.length} món cho {selectedPeople}+ người</p>
						</div>
					</div>
					<p class="text-gray-700 font-medium">{currentCombo.summary}</p>
				</div>

				<!-- Dishes List -->
				<div class="card-fun p-5 animate-slide-up" style="animation-delay: 0.15s">
					<div class="flex items-center gap-3 mb-5">
						<div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
							<svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
								<path d="M7 2v20"/>
								<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
							</svg>
						</div>
						<div>
							<h3 class="text-xl font-black text-gray-800">Thực Đơn Hôm Nay!</h3>
							<p class="text-sm text-gray-500">{currentCombo.dishes.length} món ngon</p>
						</div>
					</div>

					<div class="space-y-4">
						{#each currentCombo.dishes as dish, index}
							{@const dishType = getDishTypeLabel(dish.type)}
							<div class="bg-gradient-to-r rounded-2xl p-4 border-2 transition-all hover:shadow-lg animate-item-appear
								{dish.type === 'main' ? 'from-red-50 to-orange-50 border-orange-200' : 
								 dish.type === 'side' ? 'from-green-50 to-emerald-50 border-green-200' :
								 dish.type === 'soup' ? 'from-blue-50 to-cyan-50 border-blue-200' :
								 dish.type === 'dessert' ? 'from-purple-50 to-pink-50 border-purple-200' :
								 'from-yellow-50 to-amber-50 border-yellow-200'}"
								style="animation-delay: {0.2 + index * 0.1}s"
							>
								<div class="flex items-start justify-between mb-3">
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center
											{dish.type === 'main' ? 'from-red-400 to-orange-500' : 
											 dish.type === 'side' ? 'from-green-400 to-emerald-500' :
											 dish.type === 'soup' ? 'from-blue-400 to-cyan-500' :
											 dish.type === 'dessert' ? 'from-purple-400 to-pink-500' :
											 'from-yellow-400 to-amber-500'}">
											{#if dish.type === 'main'}
												<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
												</svg>
											{:else if dish.type === 'side'}
												<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M7 21h10"/>
													<path d="M12 21V11"/>
												</svg>
											{:else if dish.type === 'soup'}
												<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/>
													<path d="M12 2v10l4 4"/>
												</svg>
											{:else if dish.type === 'dessert'}
												<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M12 2a5 5 0 0 1 5 5c0 2-1 3-1 5H8c0-2-1-3-1-5a5 5 0 0 1 5-5z"/>
													<path d="M8 12h8v8a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-8z"/>
												</svg>
											{:else}
												<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<circle cx="12" cy="12" r="10"/>
													<path d="M12 6v6l4 2"/>
												</svg>
											{/if}
										</div>
										<div>
											<span class="text-xs font-bold uppercase tracking-wider
												{dish.type === 'main' ? 'text-red-500' : 
												 dish.type === 'side' ? 'text-green-600' :
												 dish.type === 'soup' ? 'text-blue-600' :
												 dish.type === 'dessert' ? 'text-purple-600' :
												 'text-orange-600'}">
												{dishType.label}
											</span>
											<p class="text-lg font-black text-gray-800">{dish.name_vi}</p>
											<p class="text-xs text-gray-500">{dish.name}</p>
										</div>
									</div>
									<button
										onclick={() => toggleRecipe(index)}
										class="px-3 py-1 rounded-lg text-xs font-bold transition-all btn-bouncy
										{showRecipe.has(index)
											? 'bg-gray-200 text-gray-700'
											: 'bg-orange-100 text-orange-600 hover:bg-orange-200'}"
									>
										{showRecipe.has(index) ? 'Đóng' : 'Công thức'}
									</button>
								</div>

								{#if dish.notes}
									<p class="text-xs text-gray-500 italic mb-2 flex items-center gap-1">
										<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707"/>
										</svg>
										{dish.notes}
									</p>
								{/if}

							{#if showRecipe.has(index)}
								<div class="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
									{#if dish.prep_work && dish.prep_work.length > 0}
										<div class="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
											<h5 class="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
												<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
												</svg>
												Chuẩn bị trước
											</h5>
											<ul class="space-y-1.5">
												{#each dish.prep_work as prep, pi}
													<li class="flex gap-2 text-xs text-gray-700 animate-step-appear" style="animation-delay: {pi * 0.05}s">
														<svg class="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
															<circle cx="12" cy="12" r="4"/>
														</svg>
														<span>{prep}</span>
													</li>
												{/each}
											</ul>
										</div>
									{/if}

									<h5 class="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
										<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
										</svg>
										Các bước thực hiện
									</h5>
									<ol class="space-y-3">
										{#each dish.instructions as step, i}
											<li class="flex gap-3 animate-step-appear" style="animation-delay: {i * 0.05}s">
												<span class="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
												<span class="text-sm text-gray-700 leading-relaxed">{step}</span>
											</li>
										{/each}
									</ol>
								</div>
							{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Tips Card -->
				{#if currentCombo.tips && currentCombo.tips.length > 0}
					<div class="card-fun p-5 bg-gradient-to-r from-purple-50 to-pink-50 animate-slide-up" style="animation-delay: 0.25s">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
								<svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
								</svg>
							</div>
							<h3 class="text-lg font-black text-gray-800">Mẹo Nấu Ăn</h3>
						</div>
						<ul class="space-y-2">
							{#each currentCombo.tips as tip}
								<li class="flex gap-2 text-sm text-gray-700">
									<svg class="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
									</svg>
									{tip}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Shopping List Card -->
				<div class="card-fun p-5 animate-slide-up" style="animation-delay: 0.3s">
					<div class="flex items-center gap-3 mb-5">
						<div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
							<svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="9" cy="21" r="1"/>
								<circle cx="20" cy="21" r="1"/>
								<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
							</svg>
						</div>
						<div>
							<h3 class="text-xl font-black text-gray-800">List Đi Chợ!</h3>
							<p class="text-sm text-gray-500">{getAllIngredients().length} nguyên liệu cần mua</p>
						</div>
					</div>

					<div class="space-y-2">
						{#each getAllIngredients() as item, i}
							<button
								onclick={() => toggleItem(item.name)}
								class="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 btn-bouncy text-left animate-item-appear
								{checkedItems.has(item.name)
									? 'bg-green-100 border-2 border-green-400 shadow-md'
									: 'bg-gray-50 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md'}"
								style="animation-delay: {0.35 + i * 0.03}s"
							>
								<div class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
									{checkedItems.has(item.name)
										? 'bg-green-500 border-green-500 scale-110'
										: 'bg-white border-gray-300'}">
									{#if checkedItems.has(item.name)}
										<svg class="w-4 h-4 text-white animate-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
											<path d="M5 12l5 5L20 7"/>
										</svg>
									{/if}
								</div>

								<div class="flex-1 min-w-0">
									<span class="font-bold text-gray-800 block truncate transition-all duration-300
										{checkedItems.has(item.name) ? 'line-through opacity-60' : ''}">
										{item.name}
									</span>
									<span class="text-xs text-gray-500 block truncate">
										{item.quantity} {item.unit}
									</span>
								</div>

								{#if checkedItems.has(item.name)}
									<span class="text-green-500 animate-bounce-in">✓</span>
								{/if}
							</button>
						{/each}
					</div>

					<!-- Progress -->
					{#if checkedItems.size > 0}
						<div class="mt-5 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300 animate-fade-in">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-bold text-green-700">
									{checkedItems.size}/{getAllIngredients().length} đã mua
								</span>
								<span class="text-2xl">
									{#if checkedItems.size === getAllIngredients().length}
										🎉
									{:else if checkedItems.size > getAllIngredients().length / 2}
										💪
									{:else}
										🛒
									{/if}
								</span>
							</div>
							<div class="w-full bg-green-200 rounded-full h-4 overflow-hidden shadow-inner">
								<div
									class="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
									style="width: {(checkedItems.size / getAllIngredients().length) * 100}%"
								>
									<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Try Again Button -->
				<div class="text-center pt-4 animate-slide-up" style="animation-delay: 0.35s">
					<button
						onclick={handleGenerate}
						disabled={isLoading}
						class="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black rounded-2xl border-4 border-white shadow-xl
							hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-lg
							disabled:opacity-70 disabled:cursor-not-allowed"
					>
						<span class="flex items-center gap-3 justify-center">
							<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M23 4v6h-6"/>
								<path d="M1 20v-6h6"/>
								<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
							</svg>
							Gợi ý khác đi!
						</span>
					</button>
				</div>
			</section>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="text-center mt-12 px-6 py-6 text-gray-500 text-sm">
		<div class="flex items-center justify-center gap-2">
			<svg class="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
			</svg>
			<span>Powered by AI siêu thông minh</span>
		</div>
	</footer>
</div>

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(10deg); }
	}

	.floating-emoji {
		animation: float 6s ease-in-out infinite;
	}

	@keyframes title-appear {
		0% { opacity: 0; transform: translateY(-30px) scale(0.9); }
		100% { opacity: 1; transform: translateY(0) scale(1); }
	}

	.animate-title {
		animation: title-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.animate-fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.animate-slide-up {
		animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(40px) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.animate-item-appear {
		animation: itemAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	@keyframes itemAppear {
		from { opacity: 0; transform: translateX(-20px) scale(0.9); }
		to { opacity: 1; transform: translateX(0) scale(1); }
	}

	.animate-step-appear {
		animation: stepAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	@keyframes stepAppear {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.animate-pop {
		animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes pop {
		0% { transform: scale(0); }
		70% { transform: scale(1.2); }
		100% { transform: scale(1); }
	}

	.animate-check {
		animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes checkPop {
		0% { transform: scale(0) rotate(-180deg); }
		100% { transform: scale(1) rotate(0deg); }
	}

	.animate-bounce-in {
		animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes bounceIn {
		0% { transform: scale(0); }
		50% { transform: scale(1.4); }
		100% { transform: scale(1); }
	}

	.animate-shake {
		animation: shake 0.5s ease-in-out;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px) rotate(-1deg); }
		75% { transform: translateX(5px) rotate(1deg); }
	}

	.animate-wiggle {
		animation: wiggle 0.5s ease-in-out;
	}

	@keyframes wiggle {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(-10deg); }
		75% { transform: rotate(10deg); }
	}

	.animate-shine {
		animation: shine 2s ease-in-out infinite;
	}

	@keyframes shine {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(200%); }
	}

	@keyframes floatUp {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.animate-float {
		animation: floatUp 2s ease-in-out infinite;
	}

	.card-fun {
		@apply bg-white rounded-3xl border-2 border-gray-200 shadow-xl;
	}

	.btn-bouncy {
		@apply transform transition-all duration-200;
	}

	.btn-bouncy:hover {
		animation: bounceBtn 0.4s ease-in-out;
	}

	.btn-bouncy:active {
		transform: scale(0.95);
	}

	@keyframes bounceBtn {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.08); }
	}

	.scale-102 {
		transform: scale(1.02);
	}
</style>
