This is the Blimp frontend (Next.js 15 + TypeScript + Tailwind CSS). Package manager: npm only.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install dependencies
```bash
npm install
```

### Configure environment
Create `./.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_WS_URL=http://localhost:3333
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
```

### Run the dev server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### UI
- Uses shadcn/ui components only (`https://ui.shadcn.com/docs`).
- Tailwind CSS is configured in `tailwind.config.ts`.

### Learn More
- Next.js docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Production
```bash
npm run build && npm start
```
