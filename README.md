# Cornelia Plugin V2 - AI Legal Document Analysis

A modern Next.js 15 application that replicates the functionality of the original Cornelia Office Add-in, built with TypeScript, Tailwind CSS, and AI-powered features for legal document analysis.

## 🚀 Features

### Core Functionality

- **Document Analysis**: AI-powered clause analysis from different party perspectives
- **Interactive Chat**: Chat with Cornelia about your document
- **Text Actions**: Explain, redraft, comment, brainstorm, and draft text
- **Contextual Intelligence**: Pattern detection and non-compete analysis
- **Comment Management**: Add and manage document comments
- **Timer System**: Session tracking and management

### Technical Features

- **Next.js 15**: Latest App Router with TypeScript
- **Tailwind CSS**: Modern utility-first styling
- **Ant Design**: Professional UI components
- **Mock API**: Complete demo environment with simulated responses
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Ant Design 5
- **Icons**: Ant Design Icons
- **State Management**: React Context API
- **HTTP Client**: Axios

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── demo/              # Demo page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── modals/           # Modal components
│   │   ├── previews/         # Preview components
│   │   ├── sections/         # Section components
│   │   ├── views/            # View components
│   │   ├── AppContent.tsx    # Main app content
│   │   ├── DocumentSelector.tsx
│   │   ├── Login.tsx
│   │   └── LoadingSpinner.tsx
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── AnalysisContext.tsx
│   │   └── TimerContext.tsx
│   ├── hooks/                # Custom hooks
│   │   ├── useAppState.ts
│   │   ├── useBrainstorm.ts
│   │   ├── useChat.ts
│   │   ├── useDocument.ts
│   │   ├── useDraft.ts
│   │   ├── useParties.ts
│   │   └── useSummary.ts
│   ├── services/             # API services
│   │   └── api.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── data/                 # Demo data
│       └── demoData.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cornelia-plugin-v2/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3002](http://localhost:3002)

### Demo Credentials

- **Username**: `demo`
- **Password**: `demo`

## 🎯 Demo Flow

### 1. Authentication

- Login with demo credentials
- Automatic session management

### 2. Document Selection

- Choose from pre-loaded demo documents
- Select demo scenarios for guided experience
- Documents include:
  - Software Development Agreement
  - Employment Agreement
  - Service Level Agreement

### 3. Document Analysis

- Select a party perspective
- View clause analysis results
- See acceptable, risky, and missing clauses
- Get detailed recommendations

### 4. Interactive Features

- **Chat**: Ask questions about the document
- **Text Actions**: Select text and use various actions
  - Explain: Get AI explanations
  - Redraft: Generate improved versions
  - Comment: Add annotations
  - Brainstorm: Get alternative approaches
  - Draft: Generate new content

### 5. Contextual Intelligence

- View pattern detection results
- See non-compete analysis
- Monitor compliance checking

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Subtle transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark Mode Ready**: Prepared for dark theme implementation
- **Custom Scrollbars**: Styled scrollbars for better aesthetics

## 🔌 API Integration

The application includes a complete mock API that simulates:

- Authentication endpoints
- Document analysis services
- Chat functionality
- Text processing features
- Party analysis

### Mock API Endpoints

- `POST /token/` - User authentication
- `GET /user/profile/` - User profile
- `POST /perform_analysis/` - Document analysis
- `POST /plugin/analyze_clauses/` - Clause analysis
- `POST /plugin/analyze_parties/` - Party analysis
- `POST /plugin/explain_text/` - Text explanation
- `POST /plugin/redraft_text/` - Text redrafting
- `POST /plugin/brainstorm_chat/` - Brainstorming
- `POST /plugin/draft_text/` - Content drafting

## 🧪 Testing the Application

### Demo Scenarios

1. **IP Ownership Analysis**: Analyze intellectual property clauses
2. **Non-Compete Review**: Review non-compete provisions
3. **Service Level Guarantees**: Evaluate SLA commitments

### Test Cases

- Login/logout functionality
- Document loading and selection
- Party selection and analysis
- Text selection and actions
- Chat interactions
- Modal operations
- Responsive behavior

## 🔮 Future Enhancements

- Real API integration
- User management system
- Document upload functionality
- Advanced analytics
- Export capabilities
- Collaboration features
- Mobile app version

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**
