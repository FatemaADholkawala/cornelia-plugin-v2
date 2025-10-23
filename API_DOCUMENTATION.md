# 📚 Cornelia Plugin API Documentation

> **Complete API Reference for Cornelia Legal Word Add-in**  
> **Version:** 2.0 | **Last Updated:** October 21, 2025

---

## 🌐 **API Configuration**

| **Property**       | **Value**                      |
| ------------------ | ------------------------------ |
| **Base URL**       | `https://cornelialegal.ai/api` |
| **Timeout**        | 180 seconds                    |
| **Content-Type**   | `application/json`             |
| **Authentication** | Bearer Token (JWT)             |

---

## 🔐 **Authentication APIs**

### **Login User**

**Endpoint:** `POST /token/`  
**Purpose:** Authenticate user and retrieve access tokens

**Request Parameters:**

```typescript
{
	username: string; // User's email or username
	password: string; // User's password
}
```

**Request Example:**

```json
{
	"username": "user@example.com",
	"password": "password123"
}
```

**Response Example:**

```json
{
	"access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
	"refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
	"user": {
		"id": 1,
		"username": "user@example.com",
		"email": "user@example.com"
	}
}
```

**Usage:**

```typescript
const result = await authApi.login(username, password);
if (result.success) {
	// User authenticated successfully
}
```

**Used In:** `Login.tsx`, `AuthContext.tsx`

---

### **Get User Profile**

**Endpoint:** `GET /user/profile/`  
**Purpose:** Retrieve current user's profile information

**Request:** None (uses Bearer token)

**Response Example:**

```json
{
	"id": 1,
	"username": "user@example.com",
	"email": "user@example.com",
	"first_name": "John",
	"last_name": "Doe",
	"is_active": true
}
```

**Usage:**

```typescript
const profile = await authApi.getProfile();
```

**Used In:** `AuthContext.tsx`

---

### **Check Authentication Status**

**Endpoint:** `GET /user/profile/`  
**Purpose:** Verify if user is still authenticated

**Request:** None (uses Bearer token)

**Response:** Same as Get User Profile

**Usage:**

```typescript
const isAuthenticated = await authApi.checkAuthStatus();
```

**Used In:** `AuthContext.tsx`

---

### **Logout User**

**Purpose:** Clear stored authentication tokens

**Usage:**

```typescript
authApi.logout();
```

**Used In:** `AuthContext.tsx`, `AppContent.tsx`

---

## 📊 **Analysis APIs**

### **Perform General Analysis**

**Endpoint:** `POST /perform_analysis/`  
**Purpose:** General analysis endpoint for various analysis types

**Request Parameters:**

```typescript
{
  analysis_type: string;     // "summary", "ask", "draft"
  text: string;              // Document content to analyze
  include_history?: boolean; // Include chat history (for "ask" type)
}
```

**Request Example:**

```json
{
	"analysis_type": "summary",
	"text": "This is a service agreement between Company A and Company B...",
	"include_history": false
}
```

**Response Example:**

```json
{
	"success": true,
	"result": "This document contains a comprehensive service agreement with standard terms including payment schedules, deliverables, intellectual property rights, and dispute resolution mechanisms."
}
```

**Usage:**

```typescript
const result = await analysisApi.performAnalysis(
	"summary",
	documentContent,
	"document.docx",
	onProgress
);
```

**Used In:** `useSummary.ts`, `useChat.ts`, `useDraft.ts`

---

### **Analyze Document Clauses** ⭐

**Endpoint:** `POST /plugin/analyze_clauses/`  
**Purpose:** Analyze document clauses from a specific party's perspective with comprehensive form data

**Request Parameters:**

```typescript
{
  text: string;                    // Document content
  partyInfo?: {                    // Party information
    name: string;
    role: string;
  };
  contractType?: string;           // Contract type (NDA, Employment, etc.)
  concerns?: string;               // User's specific concerns
  focusAreas?: string;             // Areas to focus on
}
```

**Request Example:**

```json
{
	"text": "The Company shall provide services...",
	"partyInfo": {
		"name": "TechCorp Inc.",
		"role": "Service Provider"
	},
	"contractType": "Service Agreement",
	"concerns": "Liability caps, indemnification, payment terms",
	"focusAreas": "Intellectual property, confidentiality, termination clauses"
}
```

**Response Example:**

```json
{
	"success": true,
	"result": {
		"acceptable": [
			{
				"id": "1",
				"text": "The term of this agreement shall be for a period of two (2) years.",
				"type": "Term",
				"risk_level": "low",
				"description": "Clear and reasonable term duration"
			}
		],
		"risky": [
			{
				"id": "2",
				"text": "The Company shall have the right to modify this agreement at any time.",
				"type": "Modification",
				"risk_level": "high",
				"description": "Unilateral modification rights",
				"suggestions": ["Add notice requirement", "Include mutual consent"]
			}
		],
		"missing": [
			{
				"id": "3",
				"text": "Confidentiality clause",
				"type": "Confidentiality",
				"risk_level": "high",
				"description": "No confidentiality provisions found",
				"suggestions": ["Add comprehensive confidentiality clause"]
			}
		]
	}
}
```

**Usage:**

```typescript
const analysis = await analysisApi.analyzeDocumentClauses(
	documentContent,
	selectedParty,
	{
		contractType: formData.contractType,
		concerns: formData.concerns,
		focusAreas: formData.focusAreas,
	}
);
```

**Used In:** `ClauseAnalysisSection.tsx`

---

### **Extract Parties from Document**

**Endpoint:** `POST /plugin/analyze_parties/`  
**Purpose:** Identify and extract parties from document content

**Request Parameters:**

```typescript
{
	text: string; // Document content
}
```

**Request Example:**

```json
{
	"text": "This agreement is between TechCorp Inc. and Client Solutions LLC..."
}
```

**Response Example:**

```json
{
	"success": true,
	"parties": [
		{
			"name": "TechCorp Inc.",
			"role": "Service Provider"
		},
		{
			"name": "Client Solutions LLC",
			"role": "Client"
		}
	]
}
```

**Usage:**

```typescript
const parties = await analysisApi.analyzeParties(documentContent);
```

**Used In:** `useParties.ts`

---

### **Explain Selected Text**

**Endpoint:** `POST /plugin/explain_text/`  
**Purpose:** Provide detailed explanation of selected text in context

**Request Parameters:**

```typescript
{
	selectedText: string; // Text to explain
	contextText: string; // Surrounding document context
}
```

**Request Example:**

```json
{
	"selectedText": "The Company shall retain all intellectual property rights.",
	"contextText": "This agreement covers software development services..."
}
```

**Response Example:**

```json
"This clause establishes the terms for intellectual property ownership. It appears to be a standard provision that grants the company broad rights to any work product created during the engagement. Key considerations include:

1. **Scope of IP Rights**: The clause covers all work product, which may be overly broad
2. **Work-for-Hire Doctrine**: This follows standard work-for-hire principles
3. **Client Rights**: Consider whether the client should retain any rights to pre-existing IP

**Recommendations:**
- Consider adding carve-outs for pre-existing intellectual property
- Clarify ownership of background IP
- Ensure compliance with applicable employment laws"
```

**Usage:**

```typescript
const explanation = await analysisApi.explainText(
	selectedText,
	documentContent
);
```

**Used In:** `useAppState.ts`

---

### **Redraft Text with Instructions**

**Endpoint:** `POST /plugin/redraft_text/`  
**Purpose:** Redraft selected text based on specific instructions

**Request Parameters:**

```typescript
{
	selectedText: string; // Text to redraft
	documentContent: string; // Full document context
	instructions: string; // Redrafting instructions
}
```

**Request Example:**

```json
{
	"selectedText": "The Company may terminate this agreement at any time.",
	"documentContent": "This is a service agreement...",
	"instructions": "Add 30-day notice requirement"
}
```

**Response Example:**

```json
{
  "success": true,
  "result": "**Redrafted Version:**

The Company may terminate this agreement with thirty (30) days written notice to the other party.

**Key Improvements:**
- Added specific notice period requirement
- Clarified written notice requirement
- Enhanced fairness and predictability"
}
```

**Usage:**

```typescript
const redraft = await analysisApi.redraftText(
	selectedText,
	documentContent,
	instructions
);
```

**Used In:** `useNegotiate.ts`, `NegotiateModal.tsx`

---

### **Brainstorm Chat for Clause Improvement**

**Endpoint:** `POST /plugin/brainstorm_chat/`  
**Purpose:** Generate brainstorming ideas and alternative approaches for clause improvement

**Request Parameters:**

```typescript
{
	message: string; // User's question or request
	clauseText: string; // Clause being discussed
	analysis: string; // Current analysis of the clause
	documentContent: string; // Full document context
}
```

**Request Example:**

```json
{
	"message": "How can we make this termination clause more fair?",
	"clauseText": "The Company may terminate this agreement at any time.",
	"analysis": "This clause gives unilateral termination rights.",
	"documentContent": "This is a service agreement..."
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Here are some alternative approaches to consider for this clause:

**Option 1: Mutual Termination Rights**
- Both parties can terminate with notice
- Equal treatment for both sides
- Clear notice periods

**Option 2: Cause-Based Termination**
- Termination only for material breach
- Specific breach definitions
- Cure periods before termination

**Option 3: Hybrid Approach**
- Mutual termination with notice
- Cause-based immediate termination
- Different notice periods for different scenarios

**Risk Mitigation Strategies:**
- Include detailed breach definitions
- Specify cure periods
- Add dispute resolution for termination disputes"
}
```

**Usage:**

```typescript
const brainstorm = await analysisApi.brainstormChat(
	message,
	clauseText,
	analysis,
	documentContent
);
```

**Used In:** `useNegotiate.ts`, `NegotiateModal.tsx`

---

### **Reply to Comment**

**Endpoint:** `POST /plugin/reply_to_comment/`  
**Purpose:** Generate intelligent replies to comments

**Request Parameters:**

```typescript
{
  comment: string;           // Comment to reply to
  documentContent: string;   // Document context
  instructions?: string;     // Specific instructions for reply
  replies?: string[];        // Previous replies in thread
}
```

**Request Example:**

```json
{
	"comment": "This clause seems unfair to the client.",
	"documentContent": "This is a service agreement...",
	"instructions": "Provide a diplomatic response",
	"replies": []
}
```

**Response Example:**

```json
{
  "success": true,
  "result": "I understand your concern about the fairness of this clause. Let me suggest some modifications that could make it more balanced:

1. **Mutual Termination Rights**: Both parties should have equal termination rights
2. **Notice Period**: A reasonable notice period should be required
3. **Cause-Based Termination**: Immediate termination only for material breaches

Would you like me to draft a revised version that addresses these concerns?"
}
```

**Usage:**

```typescript
const reply = await analysisApi.replyToComment(
	comment,
	documentContent,
	instructions
);
```

**Used In:** `useAppState.ts`

---

### **Redraft Based on Comment**

**Endpoint:** `POST /plugin/redraft_comment/`  
**Purpose:** Redraft text based on comment analysis and feedback

**Request Parameters:**

```typescript
{
  comment: string;           // Comment providing feedback
  documentContent: string;   // Document context
  selectedText: string;      // Text to redraft
  instructions?: string;     // Additional instructions
  replies?: string[];        // Previous replies in thread
}
```

**Request Example:**

```json
{
	"comment": "This termination clause is too one-sided.",
	"documentContent": "This is a service agreement...",
	"selectedText": "The Company may terminate this agreement at any time.",
	"instructions": "Make it more balanced",
	"replies": []
}
```

**Response Example:**

```json
{
  "success": true,
  "result": "**Redrafted Version:**

Either party may terminate this agreement with thirty (30) days written notice to the other party, provided that such termination shall not affect any obligations that have already accrued prior to the effective date of termination.

**Key Improvements:**
- Changed from unilateral to mutual termination rights
- Added specific notice period requirement
- Clarified that existing obligations remain unaffected
- Enhanced fairness and predictability"
}
```

**Usage:**

```typescript
const redraft = await analysisApi.redraftComment(
	comment,
	documentContent,
	selectedText,
	instructions
);
```

**Used In:** `ClauseAnalysis.tsx`

---

### **Generate Text from Prompt**

**Endpoint:** `POST /perform_analysis/`  
**Purpose:** Generate new text content from a descriptive prompt

**Request Parameters:**

```typescript
{
  analysis_type: "draft";    // Fixed value for text generation
  text: string;              // The prompt/description
  filename: string;          // Output filename
  referenced_text?: string;  // Optional reference text
}
```

**Request Example:**

```json
{
	"analysis_type": "draft",
	"text": "Create a confidentiality clause for a software development agreement",
	"filename": "draft.docx",
	"referenced_text": null
}
```

**Response Example:**

```json
{
  "success": true,
  "result": "**Draft Document Generated:**

**CONFIDENTIALITY CLAUSE**

1. **Definition of Confidential Information**
   - All technical specifications, source code, and documentation
   - Business plans, financial information, and customer data
   - Any information marked as confidential or proprietary

2. **Obligations**
   - Recipient shall maintain strict confidentiality
   - No disclosure to third parties without written consent
   - Use only for the purposes of this agreement

3. **Exceptions**
   - Information already in public domain
   - Information independently developed
   - Information received from third parties without restriction

4. **Duration**
   - Confidentiality obligations survive termination
   - Minimum 5-year protection period
   - Return or destruction of confidential materials

5. **Remedies**
   - Injunctive relief available
   - Damages for breach
   - Attorney's fees for enforcement"
}
```

**Usage:**

```typescript
const draft = await analysisApi.draftText(prompt);
```

**Used In:** `useDraft.ts`, `DraftModal.tsx`

---

## 🔧 **Error Handling**

### **Common Error Response Format**

```json
{
	"success": false,
	"error": "Error message",
	"detail": "Detailed error information"
}
```

### **HTTP Status Codes**

| **Code** | **Meaning**           | **Description**                    |
| -------- | --------------------- | ---------------------------------- |
| `200`    | Success               | Request completed successfully     |
| `400`    | Bad Request           | Invalid request parameters         |
| `401`    | Unauthorized          | Authentication required or invalid |
| `403`    | Forbidden             | Access denied                      |
| `404`    | Not Found             | Resource not found                 |
| `500`    | Internal Server Error | Server error                       |

---

## 📋 **Quick Reference**

| **API Function**                     | **Endpoint**                     | **Purpose**          | **Used In**           |
| ------------------------------------ | -------------------------------- | -------------------- | --------------------- |
| `authApi.login`                      | `POST /token/`                   | User authentication  | Login, AuthContext    |
| `authApi.getProfile`                 | `GET /user/profile/`             | Get user info        | AuthContext           |
| `analysisApi.performAnalysis`        | `POST /perform_analysis/`        | General analysis     | Summary, Chat, Draft  |
| `analysisApi.analyzeDocumentClauses` | `POST /plugin/analyze_clauses/`  | Clause analysis      | ClauseAnalysisSection |
| `analysisApi.analyzeParties`         | `POST /plugin/analyze_parties/`  | Extract parties      | useParties            |
| `analysisApi.explainText`            | `POST /plugin/explain_text/`     | Explain text         | useAppState           |
| `analysisApi.redraftText`            | `POST /plugin/redraft_text/`     | Redraft text         | NegotiateModal        |
| `analysisApi.brainstormChat`         | `POST /plugin/brainstorm_chat/`  | Brainstorm ideas     | NegotiateModal        |
| `analysisApi.replyToComment`         | `POST /plugin/reply_to_comment/` | Reply to comment     | useAppState           |
| `analysisApi.redraftComment`         | `POST /plugin/redraft_comment/`  | Redraft from comment | ClauseAnalysis        |
| `analysisApi.draftText`              | `POST /perform_analysis/`        | Generate text        | DraftModal            |

---

## 🚀 **Common Usage Patterns**

### **Authentication Flow**

```typescript
// 1. Login
const result = await authApi.login(username, password);
if (result.success) {
	// 2. Check auth status
	const isAuth = await authApi.checkAuthStatus();
	// 3. Get profile
	const profile = await authApi.getProfile();
}
```

### **Document Analysis Flow**

```typescript
// 1. Extract parties
const parties = await analysisApi.analyzeParties(documentContent);

// 2. Analyze clauses with comprehensive data
const analysis = await analysisApi.analyzeDocumentClauses(
	documentContent,
	selectedParty,
	{
		contractType: "Service Agreement",
		concerns: "Liability caps, payment terms",
		focusAreas: "IP rights, confidentiality",
	}
);

// 3. Explain specific text
const explanation = await analysisApi.explainText(
	selectedText,
	documentContent
);
```

### **Negotiation Flow**

```typescript
// 1. Brainstorm ideas
const brainstorm = await analysisApi.brainstormChat(
	message,
	clauseText,
	analysis,
	documentContent
);

// 2. Redraft text
const redraft = await analysisApi.redraftText(
	selectedText,
	documentContent,
	instructions
);
```

---

## ✅ **Recent Updates**

### **v2.0 - Enhanced Clause Analysis**

- ✅ **Added comprehensive form data** to `analyzeDocumentClauses`
- ✅ **Contract type, concerns, and focus areas** now sent to API
- ✅ **Improved analysis accuracy** with additional context
- ✅ **Backward compatibility** maintained

### **Fixed Issues**

- ✅ **Removed duplicate** `analyzeParties` function
- ✅ **Enhanced type safety** with proper interfaces
- ✅ **Improved error handling** throughout

---

**Documentation Maintainer:** Senior Next.js Developer  
**API Version:** 2.0  
**Last Verified:** October 21, 2025
