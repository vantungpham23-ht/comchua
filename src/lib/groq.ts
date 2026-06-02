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

const LOCATION_CONFIG = {
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

const BUDGET_CONFIG = {
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
- TRÁNH: món quá phổ biến như phở, bún bò`
	},
	luxury: {
		tiengViet: 'Hôm Nay Sang!',
		prompt: `Bạn đang chọn món cho bữa ăn ĐẶC BIỆT, ĐA DẠNG.
- Món ăn: NGON HƠN BÌNH THƯỜNG, ĐÁNG ĐỂ THỬ
- Số lượng: 3-5 món đa dạng
- Cân đối: món chính + món phụ + canh/súp + tráng miệng nhẹ
- Ví dụ món hay: bò lúc lắc, tôm rang muối, cá hồi áp chảo, gỏi cuốn, bún bò Huế, bánh xèo, bún chả Hà Nội
- Ưu tiên: món đặc sản vùng miền, món có hương vị độc đáo
- THÊM: món tráng miệng đơn giản hoặc món ăn vặt Việt`
	}
};

function getDishesCount(people: number, budget: string): { min: number; max: number } {
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

export async function generateCombo(params: GenerateParams): Promise<AIGeneratedCombo> {
	const { location, budget, people } = params;

	const budgetInfo = BUDGET_CONFIG[budget as keyof typeof BUDGET_CONFIG];
	const locationInfo = LOCATION_CONFIG[location as keyof typeof LOCATION_CONFIG];
	const dishesRange = getDishesCount(people, budget);

	const prompt = `Bạn là một đầu bếp Việt Nam CHUYÊN NGHIỆP, am hiểu sâu ẩm thực Việt Nam.

PHONG CÁCH: ${locationInfo.style}
CỬA HÀNG: ${locationInfo.stores}
TIỀN TỆ: ${locationInfo.currency}
SỐ NGƯỜI: ${people}
${budgetInfo.prompt}
SỐ MÓN: Từ ${dishesRange.min} đến ${dishesRange.max} món

YÊU CẦU TRẢ VỀ JSON CHÍNH XÁC (không giải thích, chỉ JSON thuần):
{
  "meal_type": "bữa sáng/bữa trưa/bữa tối/bữa xế",
  "summary": "1 câu mô tả ngắn tổng quan bữa ăn (dưới 50 chữ)",
  "why_recommend": "1 câu giải thích tại sao nên ăn món này (dưới 50 chữ)",
  "tips": ["mẹo 1", "mẹo 2", "mẹo 3"],
  "dishes": [
    {
      "name": "tên tiếng Anh",
      "name_vi": "tên tiếng Việt",
      "type": "main/side/soup/dessert/extra",
      "ingredients": [
        { "name": "tên nguyên liệu", "quantity": "số lượng", "unit": "đơn vị" }
      ],
      "prep_work": ["bước chuẩn bị 1", "bước chuẩn bị 2"],
      "instructions": ["bước 1", "bước 2", "bước 3"],
      "notes": "mẹo nấu (nếu có)"
    }
  ]
}

QUY TẮC:
- Trả về đúng JSON, không có markdown code block, không có text khác
- Mỗi món ăn phải có đủ: name, name_vi, type, ingredients, prep_work, instructions
- ingredients: 3-6 nguyên liệu chính, ghi số lượng và đơn vị thực tế
- instructions: 3-8 bước ngắn gọn, mỗi bước dưới 30 chữ
- Đảm bảo món ăn phù hợp với ${people} người
- Nếu phong cách là Việt Nam: ưu tiên món Việt
- Nếu phong cách là châu Âu: ưu tiên món Âu`;

	const apiKey = import.meta.env.VITE_GROQ_API_KEY;

	if (!apiKey) {
		throw new Error('VITE_GROQ_API_KEY chưa được cài đặt. Vui lòng thêm vào file .env');
	}

	const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'llama-3.3-70b-versatile',
			messages: [
				{
					role: 'system',
					content:
						'Bạn là một đầu bếp Việt Nam chuyên nghiệp. Trả về JSON thuần túy, không có markdown code block hay text giải thích.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.8,
			max_tokens: 4096
		})
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData?.error?.message || `Lỗi API Groq: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();
	const content = data.choices?.[0]?.message?.content;

	if (!content) {
		throw new Error('Không nhận được phản hồi từ AI');
	}

	try {
		let jsonStr = content.trim();
		if (jsonStr.startsWith('```json')) {
			jsonStr = jsonStr.slice(7);
		} else if (jsonStr.startsWith('```')) {
			jsonStr = jsonStr.slice(3);
		}
		if (jsonStr.endsWith('```')) {
			jsonStr = jsonStr.slice(0, -3);
		}
		jsonStr = jsonStr.trim();

		const result = JSON.parse(jsonStr) as AIGeneratedCombo;
		return result;
	} catch {
		throw new Error('AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
	}
}
