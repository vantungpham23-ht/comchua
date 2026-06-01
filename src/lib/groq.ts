import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY || '', dangerouslyAllowBrowser: true });

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

const locationConfig = {
	vietnam: {
		stores: 'Bách Hoá Xanh, Winmart, Co.opmart, Lotte Mart, hoặc chợ',
		currency: 'VND',
		style: 'Ẩm thực Việt Nam truyền thống với hương vị cân bằng, nhiều rau xanh, nước mắm, herb tươi'
	},
	europe: {
		stores: 'Billa, Lidl, Kaufland, Tesco, Aldi',
		currency: 'EUR',
		style: 'Ẩm thực châu Âu với nguyên liệu tươi, phomai, rau củ nướng'
	}
};

const budgetConfig = {
	famine: {
		tiengViet: 'Đói Bụng - Tiết Kiệm',
		prompt: `Bạn đang chọn món cho bữa ăn ĐƠN GIẢN, TIẾT KIỆM nhưng VẪN NGON.
- Món ăn: RẺ, NO BỤNG, dễ làm với nguyên liệu cơ bản
- Số lượng: 1-2 món nhưng ĐỦ NO và ĐỦ CHẤT
- Ví dụ món hay: canh chua, cơm trắng + thịt kho, mì xào, bún xào, rau muống xào tỏi
- Ưu tiên: món 1 nồi, món nấu nhanh, nguyên liệu rẻ và dễ mua
- TRÁNH: món cần nhiều nguyên liệu đắt tiền hoặc thời gian nấu lâu`
	},
	normal: {
		tiengViet: 'Bình Thường - Vừa Vặn',
		prompt: `Bạn đang chọn món cho bữa ăn CÂN BẰNG, NGON VỪA PHẢI.
- Món ăn: QUEN THUỘC, AI CŨNG NẤU ĐƯỢC, vừa miệng cả nhà
- Số lượng: 2-3 món tùy số người
- Cân đối: 1 món chính protein + 1 món rau/canh
- Ví dụ món hay: thịt kho trứng, gà xào sả ớt, cá chiên xù, rau muống xào, canh rau củ, bún thịt nướng
- TRÁNH: món quá phổ biến như phở, bún bò (trừ khi budget famine cần tiết kiệm)`
	},
	luxury: {
		tiengViet: 'Hôm Nay Sang!',
		prompt: `Bạn đang chọn món cho bữa ăn ĐẶC BIỆT, ĐA DẠNG.
- Món ăn: NGON HƠN BÌNH THƯỜNG, ĐÁNG ĐỂ THỬ
- Số lượng: 3-5 món đa dạng
- Cân đối: món chính + món phụ + canh/súp + tráng miệng nhẹ
- Ví dụ món hay: bò lúc lắc, tôm rang muối, cá hồi áp chảo, gỏi cuốn, bún bò Huế, bánh xèo, bún chả Hà Nội
- Ưu tiên: món đặc sản vùng miền, món có hương vị độc đáo, món ít ai nấu
- THÊM: món tráng miệng đơn giản hoặc món ăn vặt Việt`
	}
};

function getDishesCount(people: number, budget: BudgetLevel): { min: number; max: number } {
	if (budget === 'famine') {
		return { min: 1, max: 2 };
	} else if (budget === 'normal') {
		if (people <= 2) return { min: 2, max: 2 };
		if (people <= 4) return { min: 2, max: 3 };
		return { min: 3, max: 4 };
	} else {
		if (people <= 2) return { min: 2, max: 3 };
		if (people <= 4) return { min: 3, max: 4 };
		return { min: 4, max: 6 };
	}
}

function getPortionGuide(people: number): string {
	return `
HƯỚNG DẪN LƯỢNG NGUYÊN LIỆU CHO ${people} NGƯỜI:
- Thịt heo: ${people * 100}-${people * 150}g/người = ${people * 100}-${people * 150}g tổng
- Thịt bò: ${people * 80}-${people * 120}g/người = ${people * 80}-${people * 120}g tổng
- Thịt gà: ${people * 100}-${people * 150}g/người = ${people * 100}-${people * 150}g tổng
- Cá: ${people * 100}-${people * 150}g/người = ${people * 100}-${people * 150}g tổng
- Tôm: ${people * 50}-${people * 80}g/người = ${people * 50}-${people * 80}g tổng
- Rau xanh: ${people * 100}-${people * 150}g/người = ${people * 100}-${people * 150}g tổng
- Gạo: ${people * 50}-${people * 80}g/người = ${people * 50}-${people * 80}g tổng
- Nước mắm: ${people * 1}-${people * 2} muỗng canh
- Dầu ăn: ${people * 1}-${people * 2} muỗng canh
- Hành tím: ${Math.ceil(people / 2)} củ
- Tỏi: ${people} tép
- Hành lá: ${people} nhánh
`;
}

export async function generateCombo(params: GenerateParams): Promise<AIGeneratedCombo> {
	const { location, budget, people } = params;
	const budgetInfo = budgetConfig[budget];
	const locationInfo = locationConfig[location];
	const dishesRange = getDishesCount(people, budget);

	const prompt = `Bạn là một đầu bếp Việt Nam CHUYÊN NGHIỆP, am hiểu sâu ẩm thực Việt Nam.

PHONG CÁCH: ${locationInfo.style}

NHIỆM VỤ: Gợi ý bữa ăn ngon, đa dạng cho ${people} người.

📍 ĐỊA ĐIỂM MUA: ${locationInfo.stores}
💰 MỨC CHI: ${budgetInfo.tiengViet}

${budgetInfo.prompt}

📊 SỐ MÓN CẦN GỢI Ý: ${dishesRange.min}-${dishesRange.max} món

${getPortionGuide(people)}

YÊU CẦU BẮT BUỘC:
1. SỐ LƯỢNG MÓN: ${dishesRange.min}-${dishesRange.max} món phù hợp với mức chi
2. ĐA DẠNG: Chọn món KHÔNG TRÙNG LẶP, mỗi lần gợi ý KHÁC NHAU
3. MÓN VIỆT: Ưu tiên món ăn Việt Nam, có thể mix với món Á-Âu phổ biến
4. NGUYÊN LIỆU CHÍNH XÁC: Tính toán số lượng cụ thể cho ${people} người
5. MỖI MÓN PHẢI CÓ prep_work và instructions CHI TIẾT

VÍ DỤ prep_work CHI TIẾT (cho ${people} người):
- "Thịt heo: rửa sạch, thái miếng mỏng ${people * 1.5}cm, ướp với ${people * 1} muỗng nước mắm, ${people * 0.5} muỗng đường, ${people} tép tỏi băm nhuyễn, ${Math.ceil(people / 2)} muỗng dầu ăn. Để 15-20 phút cho thấm"
- "Rau muống: nhặt bỏ lá già và rễ, rửa sạch ${people * 150}g, để ráo nước"
- "Tỏi: bóc vỏ, băm nhuyễn (không băm quá nhỏ sẽ nát)"
- "Hành tím: bóc vỏ, thái múi cau hoặc băm nhỏ"

VÍ DỤ instructions CHI TIẾT:
- "Bước 1: Phi thơm ${people} muỗng canh dầu ăn với ${people} tép tỏi băm. Đợi tỏi vàng thơm (khoảng 30 giây) thì hạ lửa nhỏ"
- "Bước 2: Cho thịt vào, đảo đều. Đợi thịt chuyển màu đều thì mới đảo tiếp (khoảng 2-3 phút)"
- "Bước 3: Nêm ${people * 1.5} muỗng nước mắm, ${people * 0.5} muỗng đường, ${people * 0.5} muỗng hạt nêm. Đảo đều trong 1 phút rồi tắt bếp"

TRẢ LỜI CHÍNH XÁC format JSON sau:
{
  "dishes": [
    {
      "name": "Tên tiếng Anh",
      "name_vi": "Tên tiếng Việt",
      "type": "main|side|soup|dessert|extra",
      "ingredients": [
        {"name": "Nguyên liệu", "quantity": "số lượng cụ thể cho ${people} người", "unit": "đơn vị (g, muỗng canh, tép...)"}
      ],
      "prep_work": [
        "Chuẩn bị trước bước 1...",
        "Sơ chế nguyên liệu 2...",
        "Ướp/thực hiện trước 3..."
      ],
      "instructions": [
        "Bước 1 cụ thể và chi tiết...",
        "Bước 2 cụ thể và chi tiết...",
        "Bước 3 cụ thể và chi tiết..."
      ],
      "notes": "Mẹo đặc biệt cho món này (hoặc bỏ trống)"
    }
  ],
  "tips": ["Mẹo hay 1", "Mẹo hay 2", "Mẹo hay 3"],
  "why_recommend": "Câu giải thích HÀI HƯỚC/SIÊU THUYẾT PHỤC tại sao nên nấu combo này HÔM NAY",
  "summary": "Tóm tắt ngắn gọn bữa ăn: ví dụ 'Cơm trắng + Thịt kho + Rau muống xào + Canh rau'",
  "meal_type": "bữa trưa|bữa tối"
}

QUAN TRỌNG:
- Chỉ trả lời JSON, không có text khác
- Đảm bảo số lượng món: ${dishesRange.min}-${dishesRange.max} món
- prep_work và instructions PHẢI rất chi tiết, có số lượng cụ thể
- KHÔNG trùng lặp món - mỗi lần gợi ý phải ĐA DẠNG
- Nên chọn món từ các vùng miền khác nhau của Việt Nam`;

	try {
		const chat = await groq.chat.completions.create({
			model: 'llama-3.3-70b-versatile',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.95,
			max_tokens: 8192,
			response_format: { type: 'json_object' }
		});

		const text = chat.choices[0]?.message?.content || '';

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('AI trả lời lạ quá, thử lại đi!');
		}

		const result = JSON.parse(jsonMatch[0]) as AIGeneratedCombo;

		// Validate dishes count
		if (!result.dishes || result.dishes.length < dishesRange.min || result.dishes.length > dishesRange.max) {
			result.dishes = result.dishes?.slice(dishesRange.min - 1, dishesRange.max) || [];
		}

		return result;
	} catch (error) {
		console.error('Groq API Error:', error);
		throw error;
	}
}
