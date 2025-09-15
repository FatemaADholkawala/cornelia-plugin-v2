"use client";

import React from "react";
import { Typography, Input } from "antd";
// Note: icon imports removed to avoid unused warnings; re-add if needed
import {
	ClauseAnalysis,
	Party,
	AnalysisCounts,
	Comment,
	ChatMessage,
	RedraftContent,
	Explanation,
	CommentDraft,
} from "@/types";
import ClauseAnalysisSection from "../sections/ClauseAnalysisSection";
import ActionPanelSection from "../sections/ActionPanelSection";
import SummarySection from "../sections/SummarySection";
import ChatSection from "../sections/ChatSection";
import DocumentCommentSection from "../sections/DocumentCommentSection";
import RedraftModal from "../modals/RedraftModal";
import BrainStormModal from "../modals/BrainStormModal";
import DraftModal from "../modals/DraftModal";
import ExplanationPreview from "../previews/ExplanationPreview";
import RedraftPreview from "../previews/RedraftPreview";
import CommentPreview from "../previews/CommentPreview";

const { Text } = Typography;
const { TextArea } = Input;

interface HomeViewProps {
	homeSummaryLoading: boolean;
	summaryProgress: number;
	homeSummaryReady: boolean;
	handleHomeSummaryClick: () => void;
	summary: unknown;
	setActiveView: (view: string) => void;
	selectedText: string;
	setCommentDraft: React.Dispatch<React.SetStateAction<CommentDraft | null>>;
	isExplaining: boolean;
	handleExplain: () => void;
	generatingRedrafts: Map<string, boolean>;
	setRedraftContent: (content: string) => void;
	setIsRedraftModalVisible: (visible: boolean) => void;
	setIsBrainstormModalVisible: (visible: boolean) => void;
	setBrainstormMessages: (messages: ChatMessage[]) => void;
	explanation: Explanation | null;
	setExplanation: (explanation: Explanation | null) => void;
	generatedRedraft: RedraftContent | null;
	setGeneratedRedraft: (redraft: RedraftContent | null) => void;
	handleAcceptRedraft: () => void;
	commentDraft: CommentDraft | null;
	handleAddComment: () => void;
	isAddingComment: boolean;
	clauseAnalysis: ClauseAnalysis | null;
	isLoadingParties: boolean;
	clauseAnalysisLoading: boolean;
	parties: Party[];
	getTagColor: (role: string) => string;
	selectedParty: Party | null;
	setSelectedParty: (party: Party | null) => void;
	setClauseAnalysisLoading: (loading: boolean) => void;
	setClauseAnalysis: (analysis: ClauseAnalysis | null) => void;
	setClauseAnalysisCounts: (counts: AnalysisCounts) => void;
	clauseAnalysisCounts: AnalysisCounts;
	comments: Comment[];
	setComments: (comments: Comment[]) => void;
	initialResolvedComments: Comment[];
	handleCommentUpdate: (comment: Comment) => void;
	isRedraftModalVisible: boolean;
	redraftContent: string;
	handleRedraft: () => void;
	redraftTextAreaRef: React.RefObject<HTMLTextAreaElement>;
	isBrainstormModalVisible: boolean;
	brainstormMessages: ChatMessage[];
	brainstormLoading: boolean;
	handleBrainstormSubmit: (
		message: string,
		clauseText: string,
		analysis: string,
		documentContent: string
	) => void;
	documentContent: string;
	isDraftModalVisible: boolean;
	setIsDraftModalVisible: (visible: boolean) => void;
	draftPrompt: string;
	setDraftPrompt: (prompt: string) => void;
	isDrafting: boolean;
	handleDraftSubmit: () => void;
	handleCloseDraftModal: () => void;
	onTextSelect: (text: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
	homeSummaryLoading,
	summaryProgress,
	homeSummaryReady,
	handleHomeSummaryClick,
	summary,
	setActiveView,
	selectedText,
	setCommentDraft,
	isExplaining,
	handleExplain,
	generatingRedrafts,
	setRedraftContent,
	setIsRedraftModalVisible,
	setIsBrainstormModalVisible,
	setBrainstormMessages,
	explanation,
	setExplanation,
	generatedRedraft,
	setGeneratedRedraft,
	handleAcceptRedraft,
	commentDraft,
	handleAddComment,
	isAddingComment,
	clauseAnalysis,
	isLoadingParties,
	clauseAnalysisLoading,
	parties,
	getTagColor,
	selectedParty,
	setSelectedParty,
	setClauseAnalysisLoading,
	setClauseAnalysis,
	setClauseAnalysisCounts,
	clauseAnalysisCounts,
	comments,
	setComments,
	initialResolvedComments,
	handleCommentUpdate,
	isRedraftModalVisible,
	redraftContent,
	handleRedraft,
	redraftTextAreaRef,
	isBrainstormModalVisible,
	brainstormMessages,
	brainstormLoading,
	handleBrainstormSubmit,
	documentContent,
	isDraftModalVisible,
	setIsDraftModalVisible,
	draftPrompt,
	setDraftPrompt,
	isDrafting,
	handleDraftSubmit,
	handleCloseDraftModal,
	onTextSelect,
}) => {
	return (
		<div className="flex flex-col h-full space-y-4 py-4">
			{/* Document Analysis Card */}
			<ClauseAnalysisSection
				clauseAnalysis={clauseAnalysis}
				isLoadingParties={isLoadingParties}
				clauseAnalysisLoading={clauseAnalysisLoading}
				parties={parties}
				getTagColor={getTagColor}
				selectedParty={selectedParty}
				setSelectedParty={setSelectedParty}
				setClauseAnalysisLoading={setClauseAnalysisLoading}
				setClauseAnalysis={setClauseAnalysis}
				setClauseAnalysisCounts={setClauseAnalysisCounts}
				clauseAnalysisCounts={clauseAnalysisCounts}
				setActiveView={setActiveView}
				documentContent={documentContent}
			/>

			{/* Actions Panel Card */}
			<ActionPanelSection
				selectedText={selectedText}
				isExplaining={isExplaining}
				generatingRedrafts={generatingRedrafts}
				handleExplain={handleExplain}
				setCommentDraft={setCommentDraft}
				setRedraftContent={setRedraftContent}
				setIsRedraftModalVisible={setIsRedraftModalVisible}
				setIsBrainstormModalVisible={setIsBrainstormModalVisible}
				setBrainstormMessages={setBrainstormMessages}
				isDrafting={isDrafting}
				setIsDraftModalVisible={setIsDraftModalVisible}
			/>

			{/* Explanation Preview Card */}
			<ExplanationPreview
				explanation={explanation}
				onClose={() => setExplanation(null)}
			/>

			<RedraftPreview
				redraft={generatedRedraft}
				onClose={() => setGeneratedRedraft(null)}
				onRegenerate={() => {
					setRedraftContent("");
					setIsRedraftModalVisible(true);
				}}
				onAccept={handleAcceptRedraft}
			/>

			<CommentPreview
				comment={commentDraft}
				onClose={() => setCommentDraft(null)}
				onChange={(e) =>
					setCommentDraft((prev) =>
						prev
							? { ...prev, text: e.target.value }
							: { text: e.target.value, timestamp: new Date().toISOString() }
					)
				}
				onSubmit={handleAddComment}
				isLoading={isAddingComment}
			/>

			{/* Summary & Chat Card */}
			<div className="px-4">
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all duration-200">
					<div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
						{/* Chat Section */}
						<ChatSection setActiveView={setActiveView} />
						{/* Summary Section */}
						<SummarySection
							homeSummaryLoading={homeSummaryLoading}
							summaryProgress={summaryProgress}
							homeSummaryReady={homeSummaryReady}
							handleHomeSummaryClick={handleHomeSummaryClick}
							summary={summary}
							setActiveView={setActiveView}
						/>
					</div>
				</div>
			</div>

			{/* Comments Section */}
			<DocumentCommentSection
				comments={comments}
				setComments={setComments}
				initialResolvedComments={initialResolvedComments}
				onCommentUpdate={handleCommentUpdate}
			/>

			{/* Redraft Instructions Modal */}
			<RedraftModal
				isVisible={isRedraftModalVisible}
				onClose={() => {
					setIsRedraftModalVisible(false);
					setRedraftContent("");
				}}
				onRedraft={() => {
					setIsRedraftModalVisible(false);
					handleRedraft();
				}}
				redraftContent={redraftContent}
				setRedraftContent={setRedraftContent}
				redraftTextAreaRef={redraftTextAreaRef}
			/>

			{/* Brainstorm Solutions Modal */}
			<BrainStormModal
				isVisible={isBrainstormModalVisible}
				onClose={() => {
					setIsBrainstormModalVisible(false);
					setBrainstormMessages([]);
				}}
				selectedText={selectedText}
				documentContent={documentContent}
				brainstormMessages={brainstormMessages}
				setBrainstormMessages={setBrainstormMessages}
				brainstormLoading={brainstormLoading}
				handleBrainstormSubmit={handleBrainstormSubmit}
			/>

			{/* Draft Modal */}
			<DraftModal
				isVisible={isDraftModalVisible}
				onClose={handleCloseDraftModal}
				onDraft={handleDraftSubmit}
				draftPrompt={draftPrompt}
				setDraftPrompt={setDraftPrompt}
			/>
		</div>
	);
};

export default HomeView;
