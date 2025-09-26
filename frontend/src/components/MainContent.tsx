"use client";

import React from "react";
import {
	ActiveView,
	ClauseAnalysis,
	AnalysisCounts,
	Party,
	Comment,
	ChatMessage,
	RedraftContent,
	Explanation,
	CommentDraft,
} from "@/types";
import HomeView from "./views/HomeView";
import AnalysisView from "./views/AnalysisView";
import ChatWindowView from "./views/ChatWindowView";
import ContextualIntelligenceView from "./views/ContextualIntelligenceView";
import DocumentSummaryView from "./views/DocumentSummaryView";

interface MainContentProps {
	activeView: ActiveView | null;
	documentContent: string;
	summary: any;
	summaryLoading: boolean;
	summaryProgress: number;
	summaryError: string | null;
	handleGenerateSummary: () => void;
	comments: Comment[];
	setComments: (comments: Comment[]) => void;
	initialResolvedComments: Comment[];
	handleCommentUpdate: (comment: Comment) => void;
	chatMessages: ChatMessage[];
	setChatMessages: (messages: ChatMessage[]) => void;
	chatLoading: boolean;
	chatError: string | null;
	handleChatSubmit: (message: string) => void;
	clauseAnalysisLoading: boolean;
	selectedParty: Party | null;
	setSelectedParty: (party: Party | null) => void;
	clauseAnalysis: ClauseAnalysis | null;
	setClauseAnalysis: (analysis: ClauseAnalysis | null) => void;
	setClauseAnalysisLoading: (loading: boolean) => void;
	setClauseAnalysisCounts: (counts: AnalysisCounts) => void;
	setActiveView: (view: ActiveView | null) => void;
	getTagColor: (role: string) => string;
	handleChangeParty: () => void;
	isRedraftModalVisible: boolean;
	redraftContent: string;
	selectedClause: any;
	generatedRedraft: RedraftContent | null;
	generatingRedrafts: Map<string, boolean>;
	redraftedClauses: Set<string>;
	redraftedTexts: Map<string, string>;
	redraftReviewStates: Map<string, any>;
	onRedraftModalVisibility: (visible: boolean) => void;
	onRedraftContentChange: (content: string) => void;
	onSelectedClauseChange: (clause: any) => void;
	onGeneratingRedraftsChange: (redrafts: Map<string, boolean>) => void;
	onRedraftedClausesChange: (clauses: Set<string>) => void;
	onRedraftedTextsChange: (texts: Map<string, string>) => void;
	onRedraftReviewStatesChange: (states: Map<string, any>) => void;
	homeSummaryLoading: boolean;
	homeSummaryReady: boolean;
	handleHomeSummaryClick: () => void;
	selectedText: string;
	setCommentDraft: (draft: CommentDraft | null) => void;
	isExplaining: boolean;
	handleExplain: () => void;
	setRedraftContent: (content: string) => void;
	setIsRedraftModalVisible: (visible: boolean) => void;
	setIsBrainstormModalVisible: (visible: boolean) => void;
	setBrainstormMessages: (messages: ChatMessage[]) => void;
	explanation: Explanation | null;
	setExplanation: (explanation: Explanation | null) => void;
	setGeneratedRedraft: (redraft: RedraftContent | null) => void;
	handleAcceptRedraft: () => void;
	commentDraft: CommentDraft | null;
	handleAddComment: () => void;
	isAddingComment: boolean;
	isLoadingParties: boolean;
	parties: Party[];
	clauseAnalysisCounts: AnalysisCounts;
	handleRedraft: () => void;
	redraftTextAreaRef: React.RefObject<HTMLTextAreaElement | null>;
	isBrainstormModalVisible: boolean;
	brainstormMessages: ChatMessage[];
	brainstormLoading: boolean;
	handleBrainstormSubmit: (
		message: string,
		clauseText: string,
		analysis: string,
		documentContent: string
	) => void;
	isDraftModalVisible: boolean;
	setIsDraftModalVisible: (visible: boolean) => void;
	draftPrompt: string;
	setDraftPrompt: (prompt: string) => void;
	isDrafting: boolean;
	handleDraftSubmit: () => void;
	handleCloseDraftModal: () => void;
}

const MainContent: React.FC<MainContentProps> = (props) => {
	const { activeView } = props;

	switch (activeView) {
		case "summary":
			return (
				<DocumentSummaryView
					documentContent={props.documentContent}
					summary={props.summary}
					isLoading={props.summaryLoading}
					progress={props.summaryProgress}
					error={props.summaryError}
					onGenerateSummary={props.handleGenerateSummary}
					setActiveView={props.setActiveView}
				/>
			);
		case "analysis":
			return <AnalysisView {...props} />;
		case "chat":
			return (
				<ChatWindowView
					documentContent={props.documentContent}
					messages={props.chatMessages}
					setMessages={props.setChatMessages}
					isLoading={props.chatLoading}
					error={props.chatError}
					onSubmit={props.handleChatSubmit}
					selectedText={props.selectedText}
				/>
			);
		case "contextual-intelligence":
			return <ContextualIntelligenceView {...props} />;
		case "home":
		default:
			return <HomeView {...props} />;
	}
};

export default MainContent;
