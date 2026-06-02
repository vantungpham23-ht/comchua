import Groq from 'groq-sdk';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { location, budget, people } = body;

	if (!location || !budget || !people) {
		throw error(400, 'Missing required fields');
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

	const budgetInfo = budgetConfig[budget as keyof typeof budgetConfig];
	const locationInfo = locationConfig[location as keyof typeof locationConfig];
	const dishesRange = getDishesCount(people, budget);

	const prompt = `Bạn là một đầu bếp Việt Nam CHUYÊN NGHIỆP, am hiểu sâu ẩm thực Việt Nam.

PHONG CÁCH: ${locationInfo.style}

NHIỆM VỤ: Gợi ý bữa ăn ngon, đa dạng cho ${people} người.

📍 ĐỊA ĐIỂM MUA: ${locationInfo.stores}
💰 MỨC CHI: ${budgetInfo.tiengViet}

${budgetInfo.prompt}

📊 SỐ MÓN CẦN GỢI Ý: ${dishesRange.min}-${dishesRange.max} món

YÊU CẦU BẮT BUỘC:
1. SỐ LƯỢNG MÓN: ${dishesRange.min}-${dishesRange.max} món phù hợp với mức chi
2. ĐA DẠNG: Chọn món KHÔNG TRÙNG LẶP, mỗi lần gợi ý KHÁC NHAU
3. MÓN VIỆT: Ưu tiên món ăn Việt Nam
4. NGUYÊN LIỆU CHÍNH XÁC: Tính toán số lượng cụ thể cho ${people} người

TRẢ LỜI CHÍNH XÁC format JSON sau:
{
  "dishes": [
    {
      "name": "Tên tiếng Anh",
      "name_vi": "Tên tiếng Việt",
      "type": "main|side|soup|dessert|extra",
      "ingredients": [
        {"name": "Nguyên liệu", "quantity": "số lượng cụ thể cho ${people} người", "unit": "đơn vị"}
      ],
      "prep_work": ["Chuẩn bị trước..."],
      "instructions": ["Bước 1 cụ thể..."],
      "notes": "Mẹo đặc biệt"
    }
  ],
  "tips": ["Mẹo hay 1", "Mẹo hay 2"],
  "why_recommend": "Câu giải thích HÀI HƯỚC tại sao nên nấu combo này",
  "summary": "Tóm tắt ngắn gọn bữa ăn",
  "meal_type": "bữa trưa|bữa tối"
}

QUAN TRỌNG: Chỉ trả lời JSON, không có text khác`;

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

		return json(JSON.parse(jsonMatch[0]));
	} catch (err) {
		console.error('Groq API Error:', err);
		throw error(500, 'Lỗi khi gọi AI, thử lại đi nào!');
	}
};
