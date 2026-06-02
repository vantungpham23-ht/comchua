<script lang="ts">
	import { generateCombo, type AIGeneratedCombo, type AIGeneratedDish, type LocationType, type BudgetLevel, type RecipeStep } from '$lib/groq';

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
		{ value: 'famine' as BudgetLevel, label: 'Đói Bụng', desc: 'Rẻ, no bụng', emoji: '🍚' },
		{ value: 'normal' as BudgetLevel, label: 'Bình Thường', desc: 'Ngon vừa vặn', emoji: '🍜' },
		{ value: 'luxury' as BudgetLevel, label: 'Hôm Nay Sang!', desc: 'Bựa lên!', emoji: '🦞' }
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

	// Get dish type info
	function getDishTypeInfo(type: string) {
		const types: Record<string, { label: string; color: string; bgColor: string; emoji: string }> = {
			main: { label: 'Món Chính', color: 'text-red-600', bgColor: 'bg-red-500', emoji: '🍖' },
			side: { label: 'Món Phụ', color: 'text-green-600', bgColor: 'bg-green-500', emoji: '🥬' },
			soup: { label: 'Canh/Súp', color: 'text-blue-600', bgColor: 'bg-blue-500', emoji: '🍲' },
			dessert: { label: 'Tráng Miệng', color: 'text-purple-600', bgColor: 'bg-purple-500', emoji: '🍰' },
			extra: { label: 'Món Khác', color: 'text-orange-600', bgColor: 'bg-orange-500', emoji: '🍳' }
		};
		return types[type] || types.extra;
	}

	// Get emoji for dish
	function getDishEmoji(dishName: string, type: string) {
		const dishEmojis: Record<string, string> = {
			'canh': '🍜',
			'thit': '🍖',
			'ga': '🍗',
			'ca': '🐟',
			'tom': '🦐',
			'cu': '🦑',
			'ra': '🥬',
			'com': '🍚',
			'banh': '🥞',
			'nuoc': '🥤',
			'tra': '🍵',
			'che': '🍮',
			'kho': '🍲',
			'xao': '🍳',
			'chien': '🍟',
			'hap': '🥘',
			'nuong': '🔥',
			'gio': '🥟',
			'goi': '🥗',
			'pho': '🍜',
			'bun': '🍜',
			'mi': '🍝',
			'chao': '🥣'
		};
		
		const lowerName = dishName.toLowerCase();
		for (const [key, emoji] of Object.entries(dishEmojis)) {
			if (lowerName.includes(key)) return emoji;
		}
		return getDishTypeInfo(type).emoji;
	}

	// Estimate cooking time
	function estimateTime(type: string, ingredientsCount: number): string {
		const baseTime = type === 'soup' ? 45 : type === 'main' ? 30 : 20;
		const extraTime = Math.floor(ingredientsCount / 3) * 5;
		return `${baseTime + extraTime} phút`;
	}

	// Estimate calories
	function estimateCalories(type: string): string {
		const calories: Record<string, string> = {
			main: '450-600',
			side: '150-250',
			soup: '200-350',
			dessert: '200-400',
			extra: '100-300'
		};
		return calories[type] || '300-400';
	}
</script>

<svelte:head>
	<title>Cơm Nước Gì Chưa?</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 pb-16 overflow-x-hidden">
	<!-- Header -->
	<header class="px-6 py-10 text-center">
		<div class="relative inline-block">
			<!-- Logo/Icon -->
			<div class="mb-4">
				<div class="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-xl transform rotate-3">
					<span class="text-4xl">🍲</span>
				</div>
			</div>
			
			<h1 class="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">
				Cơm Nước
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Gì Chưa?</span>
			</h1>
			<p class="text-lg text-gray-500 mt-3 font-medium">
				AI gợi ý món ăn ngon cho bạn
			</p>
		</div>
	</header>

	<main class="px-4 max-w-6xl mx-auto relative z-10">
		<!-- Form Section -->
		<div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
			<!-- Location Selector -->
			<div class="mb-6">
				<label class="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
					<svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
						<circle cx="12" cy="10" r="3"/>
					</svg>
					Bạn ở đâu?
				</label>
				<div class="flex gap-3 justify-center">
					{#each locationOptions as option}
						<button
							onclick={() => selectedLocation = option.value}
							class="relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 border-2 shadow-md
							{selectedLocation === option.value
								? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-500 scale-105 shadow-xl'
								: 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300 hover:scale-102'}"
						>
							{#if selectedLocation === option.value}
								<span class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
									<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<path d="M5 12l5 5L20 7"/>
									</svg>
								</span>
							{/if}
							<span class="block text-2xl mb-1">{option.flag}</span>
							<span class="block text-sm">{option.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- People Selector -->
			<div class="mb-6">
				<label class="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
					<svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
					Nấu cho mấy người?
				</label>
				<div class="flex flex-wrap gap-2 justify-center">
					{#each peopleOptions as num}
						<button
							onclick={() => selectedPeople = num}
							class="w-12 h-12 rounded-xl font-bold transition-all duration-300 border-2 shadow-md
							{selectedPeople === num
								? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-500 scale-110 shadow-xl'
								: 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300 hover:scale-105'}"
						>
							{num}+
						</button>
					{/each}
				</div>
			</div>

			<!-- Budget Selector -->
			<div class="mb-6">
				<label class="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
					<svg class="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
					</svg>
					Hôm nay khẩu vị thế nào?
				</label>
				<div class="flex gap-3 justify-center flex-wrap">
					{#each budgetOptions as option}
						<button
							onclick={() => selectedBudget = option.value}
							class="relative px-5 py-3 rounded-2xl font-bold transition-all duration-300 border-2 shadow-md min-w-[120px]
							{selectedBudget === option.value
								? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-orange-500 scale-105 shadow-xl'
								: 'bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300'}"
						>
							{#if selectedBudget === option.value}
								<span class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
									<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<path d="M5 12l5 5L20 7"/>
									</svg>
								</span>
							{/if}
							<span class="block text-2xl mb-1">{option.emoji}</span>
							<span class="block text-sm font-bold">{option.label}</span>
							<span class="block text-xs opacity-70">{option.desc}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- CTA Button -->
			<div class="text-center pt-2">
				<button
					onclick={handleGenerate}
					disabled={isLoading}
					class="group relative px-12 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-lg font-black rounded-2xl shadow-2xl
						hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300
						disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
					
					{#if isLoading}
						<span class="flex items-center gap-3 justify-center relative z-10">
							<svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m12.14 0l-2.83-2.83M9.76 9.76L6.93 6.93"/>
							</svg>
							AI đang quyết định...
						</span>
					{:else}
						<span class="flex items-center gap-3 justify-center relative z-10">
							<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
							</svg>
							QUYẾT ĐỊNH GIÙM NÈ!
						</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Error Message -->
		{#if errorMessage}
			<div class="mb-6 p-4 bg-red-100 border-4 border-red-400 rounded-2xl text-red-700 text-center font-bold">
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
			<!-- AI Suggestion Header -->
			<div class="mb-8 text-center">
				<div class="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 shadow-lg border border-orange-200">
					<span class="relative flex h-3 w-3">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
					</span>
					<span class="font-bold text-orange-700">AI đã quyết định xong!</span>
				</div>
				<p class="mt-3 text-gray-600 italic">"{currentCombo.why_recommend}"</p>
			</div>

			<!-- Summary Bar -->
			<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
				<div class="flex flex-wrap items-center justify-center gap-6 text-sm">
					<div class="flex items-center gap-2">
						<span class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">🍽️</span>
						<span class="font-semibold text-gray-700">{currentCombo.dishes.length} món</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">👥</span>
						<span class="font-semibold text-gray-700">{selectedPeople}+ người</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">🍲</span>
						<span class="font-semibold text-gray-700">{currentCombo.meal_type}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
							{#if selectedBudget === 'famine'}🍚{:else if selectedBudget === 'normal'}🍜{:else}🦞{/if}
						</span>
						<span class="font-semibold text-gray-700">
							{#if selectedBudget === 'famine'}Tiết kiệm{:else if selectedBudget === 'normal'}Vừa vặn{:else}Sang chảnh{/if}
						</span>
					</div>
				</div>
			</div>

			<!-- Dishes Grid -->
			<div class="mb-8">
				<h2 class="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
					<span class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white">
						📋
					</span>
					Thực Đơn Hôm Nay
				</h2>

				<!-- Grid Layout: 1 col mobile, 2 col tablet, 3 col desktop -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each currentCombo.dishes as dish, index}
						{@const dishInfo = getDishTypeInfo(dish.type)}
						{@const isExpanded = showRecipe.has(index)}
						
						<div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
							<!-- Card Image Area -->
							<div class="relative h-40 bg-gradient-to-br from-orange-100 via-yellow-50 to-pink-100 flex items-center justify-center">
								<!-- Badge -->
								<div class="absolute top-3 left-3 {dishInfo.bgColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
									{dishInfo.label}
								</div>
								
								<!-- Dish Emoji -->
								<span class="text-7xl transform hover:scale-110 transition-transform duration-300">
									{getDishEmoji(dish.name_vi, dish.type)}
								</span>
							</div>

							<!-- Card Content -->
							<div class="p-5">
								<!-- Title -->
								<h3 class="text-xl font-black text-gray-800 mb-2">{dish.name_vi}</h3>
								<p class="text-sm text-gray-500 mb-4">{dish.name}</p>

								<!-- Meta Info -->
								<div class="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
									<div class="flex items-center gap-1">
										<svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="12" cy="12" r="10"/>
											<polyline points="12 6 12 12 16 14"/>
										</svg>
										<span>{estimateTime(dish.type, dish.ingredients.length)}</span>
									</div>
									<div class="flex items-center gap-1">
										<svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
											<circle cx="9" cy="7" r="4"/>
										</svg>
										<span>{selectedPeople}+ người</span>
									</div>
									<div class="flex items-center gap-1">
										<svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
										</svg>
										<span>~{estimateCalories(dish.type)} kcal</span>
									</div>
								</div>

								<!-- Action Button -->
								<button
									onclick={() => toggleRecipe(index)}
									class="w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2
									{isExpanded 
										? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
										: 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 shadow-lg hover:shadow-xl'}"
								>
									{#if isExpanded}
										<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M18 6L6 18M6 6l12 12"/>
										</svg>
										Đóng công thức
									{:else}
										<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
											<rect x="9" y="3" width="6" height="4" rx="1"/>
											<path d="M9 12h6"/>
											<path d="M9 16h6"/>
										</svg>
										Xem công thức
									{/if}
								</button>
							</div>

							<!-- Expanded Recipe Section -->
							{#if isExpanded}
								<div class="border-t border-gray-100 p-5 bg-gray-50">
									<!-- Ingredients -->
									<div class="mb-5">
										<h4 class="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
											<svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
												<rect x="9" y="3" width="6" height="4" rx="1"/>
											</svg>
											Nguyên liệu ({dish.ingredients.length})
										</h4>
										<div class="grid grid-cols-1 gap-2">
											{#each dish.ingredients as ing}
												<div class="flex items-start gap-2 text-sm bg-white p-2 rounded-lg">
													<div class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
													<div class="flex-1">
														<span class="font-medium text-gray-800">{ing.name}</span>
														<span class="text-gray-500"> - {ing.quantity} {ing.unit}</span>
														{#if ing.alternative}
															<div class="text-xs text-orange-500 mt-0.5">Thay thế: {ing.alternative}</div>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>

									<!-- Prep Work -->
									{#if dish.prep_work && dish.prep_work.length > 0}
										<div class="mb-5">
											<h4 class="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
												<svg class="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
												</svg>
												Chuẩn bị
											</h4>
											<div class="space-y-2">
												{#each dish.prep_work as prep, pi}
													<div class="flex gap-2 text-sm bg-white p-2 rounded-lg">
														<span class="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
															{pi + 1}
														</span>
														<span class="text-gray-700">{prep}</span>
													</div>
												{/each}
											</div>
										</div>
									{/if}

									<!-- Steps -->
									<div class="mb-5">
										<h4 class="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
											<svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
											</svg>
											Các bước ({dish.instructions.length})
										</h4>
										<div class="space-y-3">
											{#each dish.instructions as instruction}
												<div class="bg-white p-3 rounded-xl border border-gray-200">
													<div class="flex gap-3">
														<div class="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
															{instruction.step}
														</div>
														<div class="flex-1 space-y-2">
															<p class="font-semibold text-gray-800 text-sm">{instruction.action}</p>
															{#if instruction.explanation}
																<div class="flex gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
																	<svg class="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
																		<circle cx="12" cy="12" r="10"/>
																		<path d="M12 16v-4m0-4h.01"/>
																	</svg>
																	<p class="text-xs text-blue-700">{instruction.explanation}</p>
																</div>
															{/if}
															{#if instruction.tips}
																<div class="flex gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
																	<svg class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
																	</svg>
																	<p class="text-xs text-green-700">{instruction.tips}</p>
																</div>
															{/if}
															{#if instruction.notes}
																<div class="flex gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
																	<svg class="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
																		<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
																		<line x1="12" y1="9" x2="12" y2="13"/>
																		<line x1="12" y1="17" x2="12.01" y2="17"/>
																	</svg>
																	<p class="text-xs text-yellow-700">{instruction.notes}</p>
																</div>
															{/if}
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>

									<!-- Dish Tips -->
									{#if dish.tips && dish.tips.length > 0}
										<div class="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
											<h4 class="text-sm font-bold text-green-700 uppercase mb-2 flex items-center gap-2">
												<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
												</svg>
												Mẹo đặc biệt
											</h4>
											<ul class="space-y-1">
												{#each dish.tips as tip}
													<li class="flex gap-2 text-sm text-green-800">
														<span>✨</span>
														<span>{tip}</span>
													</li>
												{/each}
											</ul>
										</div>
									{/if}

									<!-- Variations -->
									{#if dish.variations && dish.variations.length > 0}
										<div class="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
											<h4 class="text-sm font-bold text-pink-700 uppercase mb-2 flex items-center gap-2">
												<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M23 4v6h-6"/>
													<path d="M1 20v-6h6"/>
													<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
												</svg>
												Biến thể
											</h4>
											<ul class="space-y-1">
												{#each dish.variations as variation}
													<li class="flex gap-2 text-sm text-pink-800">
														<span>🔄</span>
														<span>{variation}</span>
													</li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Global Tips -->
			{#if currentCombo.tips && currentCombo.tips.length > 0}
				<div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-200">
					<h3 class="text-xl font-black text-gray-800 mb-4 flex items-center gap-3">
						<span class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white">
							💡
						</span>
						Mẹo Bữa Ăn
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each currentCombo.tips as tip, i}
							<div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
								<div class="flex gap-3">
									<span class="text-2xl">
										{#if i === 0}👨‍🍳{:else if i === 1}🍽️{:else}👍{/if}
									</span>
									<p class="text-sm text-gray-700">{tip}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Shopping List -->
			<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
						<svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="9" cy="21" r="1"/>
							<circle cx="20" cy="21" r="1"/>
							<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
						</svg>
					</div>
					<div>
						<h3 class="text-xl font-black text-gray-800">List Đi Chợ</h3>
						<p class="text-sm text-gray-500">{getAllIngredients().length} nguyên liệu cần mua</p>
					</div>
				</div>

				<!-- Group by dish -->
				{#each currentCombo.dishes as dish}
					<div class="mb-4">
						<h4 class="text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
							<span>{getDishEmoji(dish.name_vi, dish.type)}</span>
							<span>{dish.name_vi}</span>
						</h4>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{#each dish.ingredients as item}
								<button
									onclick={() => toggleItem(item.name)}
									class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left
									{checkedItems.has(item.name)
										? 'bg-green-100 border-2 border-green-400'
										: 'bg-gray-50 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}"
								>
									<div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
										{checkedItems.has(item.name)
											? 'bg-green-500 border-green-500'
											: 'border-gray-300'}">
										{#if checkedItems.has(item.name)}
											<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
												<path d="M5 12l5 5L20 7"/>
											</svg>
										{/if}
									</div>
									<div class="flex-1 min-w-0">
										<span class="font-medium text-gray-800 block truncate
											{checkedItems.has(item.name) ? 'line-through opacity-60' : ''}">
											{item.name}
										</span>
										<span class="text-xs text-gray-500">{item.quantity} {item.unit}</span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/each}

				<!-- Progress -->
				{#if checkedItems.size > 0}
					<div class="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
						<div class="flex items-center justify-between mb-3">
							<span class="font-bold text-green-700">
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
						<div class="w-full bg-green-200 rounded-full h-3 overflow-hidden">
							<div
								class="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-700"
								style="width: {(checkedItems.size / getAllIngredients().length) * 100}%"
							></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Try Again -->
			<div class="text-center pb-8">
				<button
					onclick={handleGenerate}
					disabled={isLoading}
					class="group px-10 py-4 bg-white text-orange-600 font-black rounded-2xl border-4 border-orange-300 shadow-xl
						hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all duration-300 text-lg
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
		{/if}
	</main>

	<!-- Footer -->
	<footer class="text-center mt-12 px-6 py-6 text-gray-500 text-sm">
		<p>Powered by Groq AI + Llama 3.3</p>
	</footer>
</div>
