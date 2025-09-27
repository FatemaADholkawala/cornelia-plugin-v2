// Authentication Types
export interface User {
	id: string;
	username: string;
	email?: string;
	first_name?: string;
	last_name?: string;
}

export interface AuthTokens {
	access: string;
	refresh: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

// Document Analysis Types
export interface Party {
	name: string;
	role: string;
}

export interface ClauseAnalysis {
	acceptable: Clause[];
	risky: Clause[];
	missing: Clause[];
}

export interface Clause {
	id: string;
	text: string;
	type: string;
	risk_level: "low" | "medium" | "high";
	description?: string;
	suggestions?: string[];
}

export interface AnalysisCounts {
	acceptable: number;
	risky: number;
	missing: number;
}

// Chat Types
export interface ChatMessage {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: string;
	isError?: boolean;
	isInitialTip?: boolean;
}

// Comment Types
export interface Comment {
	id: string;
	text: string;
	timestamp: string;
	isResolved?: boolean;
}

export interface CommentDraft {
	text: string;
	timestamp: string;
}

// Redraft Types
export interface RedraftContent {
	originalText: string;
	redraftedText: string;
	instructions: string;
	timestamp: string;
}

// Explanation Types
export interface Explanation {
	text: string;
	explanation: string;
	timestamp: string;
}

// Summary Types
export interface DocumentSummary {
	content: string;
	keyPoints: string[];
	timestamp: string;
}

// App State Types
export type ActiveView =
	| "home"
	| "analysis"
	| "chat"
	| "contextual-intelligence";

export interface AppState {
	activeView: ActiveView | null;
	selectedText: string;
	documentContent: string;
	isExplaining: boolean;
	isAddingComment: boolean;
	isDrafting: boolean;
}

// Modal Types
export interface ModalState {
	isRedraftModalVisible: boolean;
	isBrainstormModalVisible: boolean;
	isDraftModalVisible: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
	success: boolean;
	result?: T;
	error?: string;
	message?: string;
}

export interface AnalysisRequest {
	analysis_type: string;
	text: string;
	include_history?: boolean;
	filename?: string;
	referenced_text?: string;
}

export interface ClauseAnalysisRequest {
	text: string;
	partyInfo?: {
		name: string;
		role: string;
	};
}

// Context Types
export interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	login: (
		credentials: LoginCredentials
	) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
	checkAuthStatus: () => Promise<void>;
	authError: string | null;
	clearError: () => void;
}

export interface AnalysisContextType {
	contextualIntelligence: {
		isPatternDetected: boolean;
		isAnalyzing: boolean;
		hasStarted: boolean;
	};
	nonCompeteDetection: {
		detectionPhase: "scanning" | "analyzing" | "detected";
		detectedConflicts: Conflict[];
		hasStarted: boolean;
	};
	setContextualIntelligence: (value: any) => void;
	setNonCompeteDetection: (value: any) => void;
}

export interface Conflict {
	company: string;
	riskLevel: "low" | "medium" | "high";
	conflictType: string;
	details: string;
}

// Hook Types
export interface UseDocumentReturn {
	documentContent: string;
	selectedText: string;
	comments: Comment[];
	initialResolvedComments: Comment[];
	setComments: (comments: Comment[]) => void;
	setSelectedText: (text: string) => void;
	handleCommentUpdate: (comment: Comment) => void;
}

export interface UseAppStateReturn {
	activeView: ActiveView | null;
	setActiveView: (view: ActiveView | null) => void;
	clauseAnalysis: ClauseAnalysis | null;
	setClauseAnalysis: (analysis: ClauseAnalysis | null) => void;
	clauseAnalysisLoading: boolean;
	setClauseAnalysisLoading: (loading: boolean) => void;
	clauseAnalysisCounts: AnalysisCounts;
	setClauseAnalysisCounts: (counts: AnalysisCounts) => void;
	isRedraftModalVisible: boolean;
	setIsRedraftModalVisible: (visible: boolean) => void;
	redraftContent: string;
	setRedraftContent: (content: string) => void;
	selectedClause: Clause | null;
	setSelectedClause: (clause: Clause | null) => void;
	generatedRedraft: RedraftContent | null;
	setGeneratedRedraft: (redraft: RedraftContent | null) => void;
	generatingRedrafts: Map<string, boolean>;
	setGeneratingRedrafts: (redrafts: Map<string, boolean>) => void;
	redraftedClauses: Set<string>;
	setRedraftedClauses: (clauses: Set<string>) => void;
	redraftedTexts: Map<string, string>;
	setRedraftedTexts: (texts: Map<string, string>) => void;
	redraftReviewStates: Map<string, any>;
	setRedraftReviewStates: (states: Map<string, any>) => void;
	isExplaining: boolean;
	setIsExplaining: (explaining: boolean) => void;
	explanation: Explanation | null;
	setExplanation: (explanation: Explanation | null) => void;
	commentDraft: CommentDraft | null;
	setCommentDraft: (draft: CommentDraft | null) => void;
	isAddingComment: boolean;
	setIsAddingComment: (adding: boolean) => void;
	redraftTextAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

// Demo Data Types
export interface DemoDocument {
	id: string;
	title: string;
	content: string;
	type: "contract" | "agreement" | "policy";
	parties: Party[];
	sampleClauses: string[];
}

export interface DemoScenario {
	id: string;
	title: string;
	description: string;
	document: DemoDocument;
	selectedText: string;
	expectedAnalysis: Partial<ClauseAnalysis>;
}
