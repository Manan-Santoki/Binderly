# Binderly

A modern web application for converting Markdown to beautifully styled PDFs with live preview, custom theming, and instant export.

## Features

- **Live Markdown Editor**: Write and edit Markdown with real-time preview
- **GitHub Flavored Markdown**: Full support for tables, task lists, and more
- **Custom Themes**: Choose from curated typography themes (Editorial Serif, Modern Neutral, Midnight Focus)
- **Custom CSS**: Add your own CSS to align with your brand or design system
- **Instant PDF Export**: Generate print-ready PDFs directly in your browser
- **File Upload**: Import existing .md files for editing and conversion
- **Metadata Control**: Set PDF title, author, and filename
- **Word & Character Count**: Track document statistics in real-time
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 22 or higher
- pnpm 9.15.2 or higher

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd binderly

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Usage

1. **Write Markdown**: Type or paste your Markdown content in the left editor panel
2. **Upload Files**: Click "Upload .md" to import existing Markdown files
3. **Choose a Theme**: Select from Editorial Serif, Modern Neutral, or Midnight Focus
4. **Add Custom CSS**: Optionally add custom CSS to match your brand
5. **Set Metadata**: Configure the PDF title, author, and filename
6. **Preview**: See your styled document in real-time in the right preview panel
7. **Export**: Click "Download PDF" to generate and download your PDF

## Technology Stack

- **Framework**: Next.js 15.5
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Custom components built with Radix UI primitives
- **Markdown Rendering**: react-markdown with remark-gfm
- **PDF Generation**: Puppeteer
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/pdf/          # PDF generation API endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── pdf-workbench/     # Main editor component
│   │   └── ui/                # Reusable UI components
│   └── lib/
│       ├── themes.ts          # Theme definitions
│       ├── sample-markdown.ts # Sample content
│       └── utils.ts           # Utility functions
├── package.json
└── README.md
```

## Customization

### Adding New Themes

Edit `src/lib/themes.ts` to add new theme definitions:

```typescript
const themeTokens = {
  yourTheme: {
    label: "Your Theme Name",
    description: "Theme description",
    vars: `
      .md-theme {
        --md-bg: #ffffff;
        --md-text: #000000;
        // ... other CSS variables
      }
    `,
  },
};
```

### Modifying PDF Styles

The PDF generation uses the same CSS as the live preview. Modify the theme CSS variables in `src/lib/themes.ts` to change the PDF output styling.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
