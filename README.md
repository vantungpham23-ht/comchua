# Bếp Ai 🍳

Ứng dụng web giúp người Việt tại Slovakia random chọn bữa ăn hằng ngày với nguyên liệu mua tại Lidl/Billa.

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS
- **Backend/Database**: Supabase

## Features

- 🎲 Random chọn món ăn theo ngân sách
- 🥗 Gợi ý combo Đạm + Rau
- 🛒 Danh sách mua sắm có checkbox
- 💰 Filter theo mức giá (Tiết kiệm/Vừa vặn/Đầy đặn)
- 📱 Responsive design

## Design

- **Style**: Modern Cute Minimalism
- **Color Palette**:
  - Background: Cream (#FFFBF0)
  - Primary: Coral (#FF8FAB)
  - Accent: Butter Yellow (#FFE169)
  - Text: Charcoal (#333333)
- **UI Elements**: Squircle corners, Flat design with neubrutalism shadows
- **Animations**: Bouncy button effects

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Supabase (Optional)

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Run the SQL schema in your Supabase dashboard:

```bash
supabase/schema.sql
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── lib/
│   │   └── supabase.ts      # Supabase client & local data
│   ├── routes/
│   │   ├── +layout.svelte   # Root layout
│   │   └── +page.svelte     # Main page
│   ├── app.css              # Global styles & animations
│   ├── app.html             # HTML template
│   └── app.d.ts             # TypeScript declarations
├── static/
│   └── favicon.png
├── supabase/
│   └── schema.sql           # Database schema & seed data
├── tailwind.config.js       # Tailwind configuration
├── package.json
└── README.md
```

## License

MIT
