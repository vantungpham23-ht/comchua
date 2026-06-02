export interface Ingredient {
	name: string;
	quantity: string;
	unit: string;
}

export interface AIGeneratedDish {
	name: string;
	name_vi: string;
	type: 'main' | 'side' | 'soup' | 'dessert' | 'extra';
	ingredients: Ingredient[];
	prep_work: string[];
	instructions: string[];
	notes?: string;
}

export interface AIGeneratedCombo {
	dishes: AIGeneratedDish[];
	tips: string[];
	why_recommend: string;
	summary: string;
	meal_type: string;
}

export type LocationType = 'vietnam' | 'europe';
export type BudgetLevel = 'famine' | 'normal' | 'luxury';

interface GenerateParams {
	location: LocationType;
	budget: BudgetLevel;
	people: number;
}

export async function generateCombo(params: GenerateParams): Promise<AIGeneratedCombo> {
	const response = await fetch('/api/generate', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify(params)
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || 'Lỗi khi gọi AI');
	}

	return (await response.json()) as AIGeneratedCombo;
}
