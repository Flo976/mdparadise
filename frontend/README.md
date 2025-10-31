# MDParadise Frontend

Modern Next.js 16 interface for MDParadise markdown editor built with shadcn/ui.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (requires backend running on port 4444)
npm run dev
```

Visit http://localhost:4445

**Note**: The frontend requires the Flask backend to be running. Use `../start_full_stack.sh` from the project root to start both servers.

## 🏗️ Tech Stack

- **Next.js 16** - React framework with App Router and Turbopack
- **React 19** - UI library
- **TypeScript** - Type safety
- **shadcn/ui** - Component library
- **Tailwind CSS 4** - Styling
- **CodeMirror** - Code editor
- **Marked** - Markdown rendering

## 📁 Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── markdown-editor/     # Custom components
│       ├── editor-layout.tsx    # Main layout
│       ├── file-sidebar.tsx     # File list sidebar
│       ├── editor.tsx           # CodeMirror editor
│       └── preview.tsx          # Markdown preview
├── lib/
│   ├── api/
│   │   └── client.ts        # API client
│   └── utils.ts             # Utilities
└── types/
    └── index.ts             # TypeScript types
```

## 🔧 Configuration

### API URL

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4444
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Components

### EditorLayout
Main application layout with sidebar, resizable panels, and toolbar.

### FileSidebar
Collapsible sidebar showing markdown files with search and filtering.

### MarkdownEditor
CodeMirror-based editor with One Dark theme and markdown syntax highlighting.

### MarkdownPreview
Live preview of rendered markdown with GitHub-flavored styling.

## 🔌 API Integration

The frontend communicates with the Flask backend API:

- `GET /api/files` - List all markdown files
- `GET /api/file/:path` - Get file content
- `POST /api/file/:path` - Save file content

## 📱 Mobile Support

The interface is fully responsive:
- **Desktop**: Sidebar + resizable editor/preview panels
- **Mobile**: Hamburger menu + single panel view

## 🎯 Features

- ✅ Resizable split-view panels
- ✅ Collapsible sidebar with search
- ✅ Real-time markdown preview
- ✅ Auto-save detection
- ✅ Keyboard shortcuts (Ctrl+S / Cmd+S)
- ✅ Mobile responsive design
- ✅ Three view modes (both/editor/preview)
- ✅ TypeScript type safety
- ✅ Modern UI with shadcn/ui

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in package.json
"dev": "next dev -p 4446"  # Or another available port
```

### API connection failed
- Ensure Flask backend is running on port 4444
- Check `.env.local` has correct API URL
- Verify CORS is enabled in Flask (`md_server.py`)

### Dependencies issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

MIT - See LICENSE file in project root
