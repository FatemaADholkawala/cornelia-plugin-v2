import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
	AuthTokens,
	ApiResponse,
	AnalysisRequest,
	ClauseAnalysisRequest,
	ClauseAnalysis,
	Party,
	ChatMessage,
	Comment,
	RedraftContent,
	Explanation,
	DocumentSummary,
} from "@/types";

// Cornelia API base URL
const BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://cornelialegal.ai/api";

// Create axios instance
const api: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 180000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Token management
const getTokens = (): AuthTokens | null => {
	if (typeof window === "undefined") return null;
	const tokens = localStorage.getItem("cornelia_tokens");
	return tokens ? JSON.parse(tokens) : null;
};

const storeTokens = (tokens: AuthTokens): void => {
	if (typeof window === "undefined") return;
	localStorage.setItem("cornelia_tokens", JSON.stringify(tokens));
};

const clearTokens = (): void => {
	if (typeof window === "undefined") return;
	localStorage.removeItem("cornelia_tokens");
};

const isTokenExpired = (token: string): boolean => {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return Date.now() >= payload.exp * 1000;
	} catch {
		return true;
	}
};

// Request interceptor
api.interceptors.request.use(async (config) => {
	const tokens = getTokens();
	if (tokens && !isTokenExpired(tokens.access)) {
		config.headers.Authorization = `Bearer ${tokens.access}`;
	}
	return config;
});

// Response interceptor
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			clearTokens();
			if (typeof window !== "undefined") {
				window.location.reload();
			}
		}
		return Promise.reject(error);
	}
);

// Authentication API - Using Real Cornelia API
export const authApi = {
	login: async (
		username: string,
		password: string
	): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> => {
		try {
			const response = await api.post("/token/", { username, password });
			if (response.data.access) {
				const tokens: AuthTokens = {
					access: response.data.access,
					refresh: response.data.refresh,
				};
				storeTokens(tokens);
				return { success: true, tokens };
			}
			return { success: false, error: "Invalid credentials" };
		} catch (error: any) {
			const errorMessage =
				error.response?.status === 401
					? "Incorrect username or password"
					: error.response?.data?.detail || "Login failed";
			return { success: false, error: errorMessage };
		}
	},

	logout: (): void => {
		clearTokens();
	},

	getProfile: async (): Promise<any> => {
		const response = await api.get("/user/profile/");
		return response.data;
	},

	checkAuthStatus: async (): Promise<boolean> => {
		const tokens = getTokens();
		if (!tokens || isTokenExpired(tokens.access)) {
			return false;
		}
		try {
			await api.get("/user/profile/");
			return true;
		} catch {
			return false;
		}
	},
};

// Analysis API
export const analysisApi = {
	performAnalysis: async (
		type: string,
		text: string,
		fileName: string,
		onProgress?: (fileName: string, progress: number) => void,
		signal?: AbortSignal
	): Promise<any> => {
		try {
			onProgress?.(fileName, 0);

			const requestBody: AnalysisRequest = {
				analysis_type: type,
				text: text,
				include_history: type === "ask",
			};

			const response = await api.post("/perform_analysis/", requestBody, {
				signal,
				onDownloadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / (progressEvent.total || 1)
					);
					onProgress?.(fileName, percentCompleted);
				},
			});

			return response.data.success ? response.data.result : "";
		} catch (error: any) {
			if (error.name === "AbortError" || error.name === "CanceledError") {
				console.warn(`${type} analysis was manually aborted for ${fileName}`);
			} else {
				console.error(`Error in ${type} analysis for ${fileName}:`, error);
			}
			onProgress?.(fileName, 0);
			throw error;
		}
	},

	analyzeDocumentClauses: async (
		text: string,
		partyInfo?: Party
	): Promise<ClauseAnalysis | null> => {
		try {
			const requestBody: ClauseAnalysisRequest = {
				text: text,
				partyInfo: partyInfo
					? {
							name: partyInfo.name,
							role: partyInfo.role,
					  }
					: undefined,
			};

			const response = await api.post("/plugin/analyze_clauses/", requestBody);
			return response.data.success ? response.data.result : null;
		} catch (error) {
			console.error("Error in clause analysis:", error);
			throw error;
		}
	},

	analyzeParties: async (text: string): Promise<Party[] | null> => {
		try {
			const response = await api.post("/plugin/analyze_parties/", { text });
			return response.data.success ? response.data.parties : null;
		} catch (error) {
			console.error("Error in party analysis:", error);
			throw error;
		}
	},

	explainText: async (
		selectedText: string,
		contextText: string
	): Promise<string> => {
		try {
			const response = await api.post("/plugin/explain_text/", {
				selectedText,
				contextText,
			});
			return response.data;
		} catch (error) {
			console.error("Error in explain text:", error);
			throw error;
		}
	},

	redraftText: async (
		selectedText: string,
		documentContent: string,
		instructions: string
	): Promise<string> => {
		try {
			const response = await api.post("/plugin/redraft_text/", {
				selectedText,
				documentContent,
				instructions,
			});
			return response.data.success ? response.data.result : "";
		} catch (error) {
			console.error("Error in redrafting text:", error);
			throw error;
		}
	},

	replyToComment: async (
		comment: string,
		documentContent: string,
		instructions: string = "",
		replies: string[] = []
	): Promise<string> => {
		try {
			const response = await api.post("/plugin/reply_to_comment/", {
				comment,
				documentContent,
				instructions,
				replies,
			});
			return response.data.success ? response.data.result : "";
		} catch (error) {
			console.error("Error in replying to comment:", error);
			throw error;
		}
	},

	redraftComment: async (
		comment: string,
		documentContent: string,
		selectedText: string,
		instructions: string = "",
		replies: string[] = []
	): Promise<string> => {
		try {
			const response = await api.post("/plugin/redraft_comment/", {
				comment,
				documentContent,
				selectedText,
				instructions,
				replies,
			});
			return response.data.success ? response.data.result : "";
		} catch (error) {
			console.error("Error in redrafting comment:", error);
			throw error;
		}
	},

	brainstormChat: async (
		message: string,
		clauseText: string,
		analysis: string = "",
		documentContent: string
	): Promise<string> => {
		try {
			const response = await api.post("/plugin/brainstorm_chat/", {
				message,
				clauseText,
				analysis,
				documentContent,
			});
			return response.data.success ? response.data.message : "";
		} catch (error) {
			console.error("Error in brainstorm chat:", error);
			throw error;
		}
	},

	draftText: async (prompt: string): Promise<string> => {
		try {
			const response = await api.post("/perform_analysis/", {
				analysis_type: "draft",
				text: prompt,
				filename: "draft.docx",
				referenced_text: null,
			});
			return response.data.success ? response.data.result : "";
		} catch (error) {
			console.error("Error in draft text:", error);
			throw error;
		}
	},
};

// Mock API for demo purposes
export const mockApi = {
	// Mock authentication
	login: async (
		username: string,
		password: string
	): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (username === "demo" && password === "demo") {
			const tokens: AuthTokens = {
				access: "mock-access-token",
				refresh: "mock-refresh-token",
			};
			storeTokens(tokens);
			return { success: true, tokens };
		}
		return { success: false, error: "Invalid credentials" };
	},

	getProfile: async (): Promise<any> => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		return {
			id: "1",
			username: "demo",
			email: "demo@cornelialegal.ai",
			first_name: "Demo",
			last_name: "User",
		};
	},

	checkAuthStatus: async (): Promise<boolean> => {
		const tokens = getTokens();
		if (!tokens || isTokenExpired(tokens.access)) {
			return false;
		}
		return true;
	},

	logout: (): void => {
		clearTokens();
	},

	performAnalysis: async (
		type: string,
		text: string,
		fileName: string,
		onProgress?: (fileName: string, progress: number) => void,
		signal?: AbortSignal
	): Promise<any> => {
		try {
			onProgress?.(fileName, 0);

			// Simulate progress updates
			const progressInterval = setInterval(() => {
				onProgress?.(fileName, Math.min(90, Math.random() * 100));
			}, 200);

			await new Promise((resolve) => setTimeout(resolve, 2000));

			clearInterval(progressInterval);
			onProgress?.(fileName, 100);

			// Return mock analysis based on type
			if (type === "summary") {
				return "This document contains a comprehensive service agreement with standard terms including payment schedules, deliverables, intellectual property rights, and dispute resolution mechanisms.";
			} else if (type === "ask") {
				return "Based on the document content, I can help you understand the key terms and provisions. What specific aspect would you like me to explain?";
			}

			return "Analysis completed successfully.";
		} catch (error) {
			console.error(`Error in ${type} analysis:`, error);
			throw error;
		}
	},

	// Mock document analysis
	analyzeDocumentClauses: async (
		text: string,
		partyInfo?: Party
	): Promise<ClauseAnalysis> => {
		await new Promise((resolve) => setTimeout(resolve, 2000));

		return {
			acceptable: [
				{
					id: "1",
					text: "The term of this agreement shall be for a period of two (2) years.",
					type: "Term",
					risk_level: "low",
					description: "Clear and reasonable term duration",
				},
				{
					id: "2",
					text: "Either party may terminate this agreement with thirty (30) days written notice.",
					type: "Termination",
					risk_level: "low",
					description: "Fair termination clause with reasonable notice period",
				},
			],
			risky: [
				{
					id: "3",
					text: "The Company shall have the right to modify this agreement at any time without notice.",
					type: "Modification",
					risk_level: "high",
					description: "Unilateral modification rights without notice",
					suggestions: [
						"Add requirement for written notice",
						"Include mutual consent requirement",
					],
				},
			],
			missing: [
				{
					id: "4",
					text: "Confidentiality clause",
					type: "Confidentiality",
					risk_level: "high",
					description: "No confidentiality provisions found",
					suggestions: [
						"Add comprehensive confidentiality clause",
						"Define confidential information",
					],
				},
				{
					id: "5",
					text: "Dispute resolution clause",
					type: "Dispute Resolution",
					risk_level: "medium",
					description: "No dispute resolution mechanism specified",
					suggestions: [
						"Add arbitration clause",
						"Specify governing law and jurisdiction",
					],
				},
			],
		};
	},

	analyzeParties: async (text: string): Promise<Party[]> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return [
			{ name: "TechCorp Inc.", role: "Service Provider" },
			{ name: "Client Solutions LLC", role: "Client" },
			{ name: "Legal Partners LLP", role: "Legal Counsel" },
		];
	},

	explainText: async (
		selectedText: string,
		contextText: string
	): Promise<string> => {
		await new Promise((resolve) => setTimeout(resolve, 1500));

		return `This clause establishes the terms for intellectual property ownership. It appears to be a standard provision that grants the company broad rights to any work product created during the engagement. Key considerations include:

1. **Scope of IP Rights**: The clause covers all work product, which may be overly broad
2. **Work-for-Hire Doctrine**: This follows standard work-for-hire principles
3. **Client Rights**: Consider whether the client should retain any rights to pre-existing IP
4. **Confidentiality**: Ensure this aligns with confidentiality provisions

**Recommendations:**
- Consider adding carve-outs for pre-existing intellectual property
- Clarify ownership of background IP
- Ensure compliance with applicable employment laws`;
	},

	redraftText: async (
		selectedText: string,
		documentContent: string,
		instructions: string
	): Promise<string> => {
		await new Promise((resolve) => setTimeout(resolve, 2000));

		return `**Redrafted Version:**

The Company shall retain all rights, title, and interest in and to any and all intellectual property, including but not limited to inventions, discoveries, improvements, works of authorship, trade secrets, and other proprietary information, that are conceived, developed, or created by Employee during the course of employment, whether or not during working hours or using Company resources.

**Key Improvements:**
- Added specific examples of intellectual property types
- Clarified scope with "whether or not during working hours"
- Maintained clear ownership language
- Enhanced enforceability with comprehensive coverage`;
	},

	brainstormChat: async (
		message: string,
		clauseText: string,
		analysis: string,
		documentContent: string
	): Promise<string> => {
		await new Promise((resolve) => setTimeout(resolve, 1500));

		return `Here are some alternative approaches to consider for this clause:

**Option 1: Mutual IP Rights**
- Both parties retain rights to their pre-existing IP
- Joint ownership of collaborative work
- Clear delineation of background vs. foreground IP

**Option 2: Client-Focused Approach**
- Client retains ownership of work product
- Service provider gets license to use for business purposes
- More favorable to client in most cases

**Option 3: Hybrid Model**
- Different treatment for different types of work
- Core deliverables owned by client
- Tools and methodologies retained by service provider

**Risk Mitigation Strategies:**
- Include detailed definitions of IP types
- Specify dispute resolution for IP conflicts
- Add confidentiality obligations
- Consider industry-specific requirements`;
	},

	draftText: async (prompt: string): Promise<string> => {
		await new Promise((resolve) => setTimeout(resolve, 3000));

		return `**Draft Document Generated:**

Based on your request for "${prompt}", here's a comprehensive draft:

**1. Executive Summary**
This document outlines the key terms and conditions for the proposed agreement, addressing all critical aspects of the relationship between the parties.

**2. Key Provisions**
- **Term and Termination**: Clear duration and exit strategies
- **Scope of Work**: Detailed description of services and deliverables
- **Payment Terms**: Structured compensation and payment schedules
- **Intellectual Property**: Comprehensive IP ownership and licensing terms
- **Confidentiality**: Robust protection of sensitive information
- **Dispute Resolution**: Efficient conflict resolution mechanisms

**3. Risk Management**
- Liability limitations and indemnification
- Insurance requirements
- Compliance obligations
- Force majeure provisions

**4. Implementation**
- Timeline and milestones
- Reporting requirements
- Change management procedures
- Success metrics and KPIs

This draft provides a solid foundation that can be customized based on specific requirements and negotiations.`;
	},
};

export default api;
