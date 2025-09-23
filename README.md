# Poster2Web

Transform PDFs, PowerPoints, and documents into beautiful, responsive websites in minutes. No coding required.

## 🚀 Features

- **Multi-Format Support**: PDF, PowerPoint (PPTX), Text, HTML, and Image files
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Rich Text Editor**: Advanced content editing with formatting tools
- **Responsive Design**: Mobile-first approach with device preview modes
- **Multiple Export Formats**: HTML, React, Next.js, Vue, Markdown, PDF
- **Deploy-Ready Packages**: Netlify, Vercel, and GitHub Pages configurations
- **Accessibility First**: WCAG compliant with screen reader support
- **Dark Mode**: Builder interface with theme switching
- **Custom Branding**: Logo upload, color schemes, and typography controls
- **OCR Processing**: Extract text from images and scanned documents

## 🛠 Technology Stack

- **Frontend**: Next.js 15 + React 19 (for v0 preview) + Vanilla JavaScript (for full functionality)
- **Styling**: Tailwind CSS v4 + CSS Custom Properties
- **Libraries**: 
  - PDF.js for PDF processing
  - JSZip for PowerPoint extraction
  - Tesseract.js for OCR functionality
  - Radix UI for component primitives
- **Build**: Next.js (preview) + Static HTML (full app)
- **Deployment**: Vercel, Netlify, GitHub Pages ready

## 📦 Quick Start

### Development Modes

This project supports two development modes:

#### 1. Next.js Mode (v0 Preview)
For development in v0 or basic preview:
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit `http://localhost:3000` - Shows a preview interface with instructions.

#### 2. HTML Mode (Full Functionality)
For complete Poster2Web functionality with file upload:
\`\`\`bash
npm install
npm run html-dev
\`\`\`
Visit `http://localhost:3000` - Full HTML application with all features.

### Option 1: Direct Deployment

**Deploy to Vercel:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/poster2web)

**Deploy to Netlify:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/poster2web)

### Option 2: Local Development

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/yourusername/poster2web.git
   cd poster2web
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Choose your development mode:**
   \`\`\`bash
   # For full HTML functionality
   npm run html-dev
   
   # For Next.js preview mode
   npm run dev
   \`\`\`

4. **Start building websites!**

## 🎯 Usage

1. **Upload Content**: Drag and drop your PDF, PowerPoint, or other supported files
2. **Edit & Customize**: Use the visual editor to modify content, colors, and layout
3. **Preview**: See real-time changes across different device sizes
4. **Export**: Choose from multiple formats (HTML, React, Next.js, etc.)
5. **Deploy**: Use the generated deployment packages for instant hosting

## 🎨 Customization

### Color Schemes
- Growth Green (default)
- Trust Blue
- Premium Purple
- Bold Red
- Modern Teal
- Sunset Orange
- Energy Yellow
- Professional Grey
- Custom colors

### Layout Options
- Single Page (Traditional)
- Section Navigation Bar
- Hamburger Menu

### Export Formats
- **Static**: HTML (standalone)
- **Frameworks**: React, Next.js, Vue.js
- **Documentation**: Markdown
- **Print**: PDF
- **Deploy-Ready**: Netlify, Vercel, GitHub Pages packages

## 🔧 Configuration

### Available Scripts

\`\`\`bash
# Next.js development (v0 preview)
npm run dev

# HTML development (full functionality)
npm run html-dev

# Build Next.js app
npm run build

# Build HTML static files
npm run html-build

# Start production Next.js server
npm start
\`\`\`

### Environment Variables (Optional)
\`\`\`bash
# For enhanced OCR processing
GOOGLE_VISION_API_KEY=your_api_key_here

# Port configuration
PORT=3000
\`\`\`

### Custom Deployment
The app includes configuration files for major platforms:
- `vercel.json` - Vercel deployment settings
- `netlify.toml` - Netlify configuration
- `.github/workflows/deploy.yml` - GitHub Pages workflow

## 🌐 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Support

Fully responsive design with touch-friendly interface:
- Mobile-first CSS approach
- Touch gestures for drag & drop
- Optimized preview modes
- Mobile-safe viewport units

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- High contrast mode
- Focus management
- ARIA labels and roles

## 🔒 Privacy & Security

- **Client-Side Processing**: All file processing happens in your browser
- **No Data Upload**: Files never leave your device
- **Secure Headers**: CSP and security headers configured
- **No Tracking**: No analytics or tracking scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- PDF.js team for PDF processing capabilities
- Tesseract.js for OCR functionality
- JSZip for PowerPoint extraction
- The open-source community for inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/poster2web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/poster2web/discussions)
- **Email**: support@poster2web.com

---

Made with 🧡 by [Jack](https://www.linkedin.com/in/jackdemanche/)
