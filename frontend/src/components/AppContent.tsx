"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Layout, Button, Typography, message, Input, Space } from "antd";
import { ArrowLeftOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useDocument } from "@/hooks/useDocument";
import { useSummary } from "@/hooks/useSummary";
import { useAppState } from "@/hooks/useAppState";
import { useChat } from "@/hooks/useChat";
import { useBrainstorm } from "@/hooks/useBrainstorm";
import { useDraft } from "@/hooks/useDraft";
import { useParties } from "@/hooks/useParties";
import { analysisApi } from "@/services/api";
import { DEMO_DOCUMENTS, DEMO_SCENARIOS } from "@/data/demoData";
import { ActiveView, CommentDraft, RedraftContent } from "@/types";
import Timer from "./Timer";
import MainContent from "./MainContent";
import DocumentSelector from "./DocumentSelector";

const { Text } = Typography;
const { Content } = Layout;

const AppContent: React.FC = () => {
	const { isAuthenticated, logout, user } = useAuth();

	const {
		documentContent,
		selectedText,
		comments,
		initialResolvedComments,
		setComments,
		setSelectedText,
		handleCommentUpdate,
	} = useDocument();

	const {
		summary,
		summaryLoading,
		summaryProgress,
		summaryError,
		homeSummaryLoading,
		homeSummaryReady,
		handleGenerateSummary,
		handleHomeSummaryClick,
	} = useSummary(documentContent, () => {});

	const {
		chatMessages,
		setChatMessages,
		chatLoading,
		chatError,
		handleChatSubmit,
	} = useChat(documentContent);

	const {
		isBrainstormModalVisible,
		setIsBrainstormModalVisible,
		brainstormMessages,
		setBrainstormMessages,
		brainstormLoading,
		handleBrainstormSubmit,
	} = useBrainstorm();

	const {
		isDraftModalVisible,
		setIsDraftModalVisible,
		draftPrompt,
		setDraftPrompt,
		isDrafting,
		handleDraftSubmit,
		handleCloseDraftModal,
	} = useDraft();

	const {
		activeView,
		setActiveView,
		clauseAnalysis,
		setClauseAnalysis,
		clauseAnalysisLoading,
		setClauseAnalysisLoading,
		clauseAnalysisCounts,
		setClauseAnalysisCounts,
		isRedraftModalVisible,
		setIsRedraftModalVisible,
		redraftContent,
		setRedraftContent,
		selectedClause,
		setSelectedClause,
		generatedRedraft,
		setGeneratedRedraft,
		generatingRedrafts,
		setGeneratingRedrafts,
		redraftedClauses,
		setRedraftedClauses,
		redraftedTexts,
		setRedraftedTexts,
		redraftReviewStates,
		setRedraftReviewStates,
		isExplaining,
		setIsExplaining,
		explanation,
		setExplanation,
		commentDraft,
		setCommentDraft,
		isAddingComment,
		setIsAddingComment,
		redraftTextAreaRef,
	} = useAppState();

	const {
		parties,
		setParties,
		isLoadingParties,
		setIsLoadingParties,
		selectedParty,
		setSelectedParty,
		getTagColor,
		loadParties,
	} = useParties();

	// Demo state
	const [showDocumentSelector, setShowDocumentSelector] =
		useState<boolean>(false);
	const [currentDocument, setCurrentDocument] = useState<any>(null);

	// Load demo document on mount
	useEffect(() => {
		if (!documentContent && DEMO_DOCUMENTS.length > 0) {
			setShowDocumentSelector(true);
		}
	}, [documentContent]);

	// Load parties when document content changes
	useEffect(() => {
		if (documentContent) {
			loadParties(documentContent);
		}
	}, [documentContent, loadParties]);

	const handleChangeParty = useCallback(() => {
		setClauseAnalysis(null);
		setSelectedParty(null);
		setClauseAnalysisCounts({
			acceptable: 0,
			risky: 0,
			missing: 0,
		});
	}, [setClauseAnalysis, setSelectedParty, setClauseAnalysisCounts]);

	const handleTextSelection = useCallback(
		async (text: string) => {
			setSelectedText(text);
		},
		[setSelectedText]
	);

	const handleLogout = (): void => {
		logout();
		message.success("Successfully logged out");
	};

	const handleDocumentSelect = (document: any): void => {
		// In a real app, this would load the document content
		setCurrentDocument(document);
		setShowDocumentSelector(false);
		message.success(`Loaded: ${document.title}`);
	};

	const handleExplain = async (): Promise<void> => {
		if (!selectedText || !documentContent) return;

		setIsExplaining(true);
		try {
			const result = await analysisApi.explainText(
				selectedText,
				documentContent
			);

			if (result) {
				setExplanation({
					text: selectedText,
					explanation: result,
					timestamp: new Date().toISOString(),
				});
			} else {
				message.error("Failed to get explanation");
			}
		} catch (error) {
			console.error("Error in explain text:", error);
			message.error("Failed to get explanation: " + (error as Error).message);
		} finally {
			setIsExplaining(false);
		}
	};

	const handleRedraft = async (): Promise<void> => {
		if (!selectedText) return;

		try {
			setGeneratingRedrafts((prev) => {
				const newMap = new Map(prev);
				newMap.set(selectedText, true);
				return newMap;
			});
			setIsRedraftModalVisible(false);

			const result = await analysisApi.redraftText(
				selectedText,
				documentContent,
				redraftContent
			);

			if (result) {
				setGeneratedRedraft({
					originalText: selectedText,
					redraftedText: result,
					instructions: redraftContent,
					timestamp: new Date().toISOString(),
				});
			}
		} catch (error) {
			console.error("Error generating redraft:", error);
			message.error("Failed to generate redraft: " + (error as Error).message);
		} finally {
			setGeneratingRedrafts((prev) => {
				const newMap = new Map(prev);
				newMap.delete(selectedText);
				return newMap;
			});
			setRedraftContent("");
		}
	};

	const handleAcceptRedraft = async (): Promise<void> => {
		if (!generatedRedraft) return;

		try {
			// In a real app, this would update the document
			message.success("Redraft applied successfully");

			setRedraftedTexts((prev) => {
				const newMap = new Map(prev);
				newMap.set(selectedText, generatedRedraft.redraftedText);
				return newMap;
			});
			setRedraftedClauses((prev) => {
				const newSet = new Set(prev);
				newSet.add(selectedText);
				return newSet;
			});
			setGeneratedRedraft(null);
			setRedraftReviewStates((prev) => {
				const newMap = new Map(prev);
				newMap.delete(selectedText);
				return newMap;
			});
			setRedraftContent("");
		} catch (error) {
			console.error("Error accepting redraft:", error);
			message.error("Failed to apply redraft");
		}
	};

	const handleAddComment = async (): Promise<void> => {
		if (!commentDraft?.text || !selectedText) return;

		try {
			setIsAddingComment(true);

			const newComment = {
				id: Date.now().toString(),
				text: commentDraft.text,
				timestamp: new Date().toISOString(),
			};

			setComments((prev) => [...prev, newComment]);
			setCommentDraft(null);
			message.success("Comment added successfully");
		} catch (error) {
			console.error("Error adding comment:", error);
			message.error("Failed to add comment: " + (error as Error).message);
		} finally {
			setIsAddingComment(false);
		}
	};

	const handleRedraftModalVisibility = (visible: boolean): void => {
		setIsRedraftModalVisible(visible);
	};

	const handleRedraftContentChange = (content: string): void => {
		setRedraftContent(content);
	};

	const handleSelectedClauseChange = (clause: any): void => {
		setSelectedClause(clause);
	};

	const handleGeneratingRedraftsChange = (
		drafts: Map<string, boolean>
	): void => {
		setGeneratingRedrafts(drafts);
	};

	const handleRedraftedClausesChange = (clauses: Set<string>): void => {
		setRedraftedClauses(clauses);
	};

	const handleRedraftedTextsChange = (texts: Map<string, string>): void => {
		setRedraftedTexts(texts);
	};

	const handleRedraftReviewStatesChange = (states: Map<string, any>): void => {
		setRedraftReviewStates(states);
	};

	if (showDocumentSelector) {
		return (
			<DocumentSelector
				documents={DEMO_DOCUMENTS}
				scenarios={DEMO_SCENARIOS}
				onDocumentSelect={handleDocumentSelect}
				onTextSelect={handleTextSelection}
			/>
		);
	}

	return (
		<Layout className="h-screen">
			<div className="flex justify-between items-center p-4 bg-white border-b">
				<div className="flex items-center gap-3">
					{(activeView === "chat" ||
						activeView === "analysis" ||
						activeView === "contextual-intelligence") && (
						<Button
							onClick={() => setActiveView("home")}
							type="text"
							className="flex items-center !p-2 hover:bg-gray-50 rounded-full"
							icon={<ArrowLeftOutlined />}
						/>
					)}
					<Text strong className="text-lg">
						{activeView === "chat"
							? "Chat with Cornelia"
							: activeView === "analysis"
							? "Document Analysis"
							: activeView === "contextual-intelligence"
							? "Contextual Intelligence"
							: "Cornelia"}
					</Text>
				</div>
				<div className="flex items-center gap-4">
					<Timer />
					<Button
						onClick={() => setShowDocumentSelector(true)}
						type="default"
						className="hover:bg-blue-50"
					>
						Switch Document
					</Button>
					<Button
						onClick={handleLogout}
						type="link"
						danger
						className="hover:text-red-600"
						icon={<LogoutOutlined />}
					>
						Logout
					</Button>
				</div>
			</div>
			<Content className="flex-1 overflow-auto bg-gray-100">
				<MainContent
					activeView={activeView}
					documentContent={documentContent}
					summary={summary}
					summaryLoading={summaryLoading}
					summaryProgress={summaryProgress}
					summaryError={summaryError}
					handleGenerateSummary={handleGenerateSummary}
					comments={comments}
					setComments={setComments}
					initialResolvedComments={initialResolvedComments}
					handleCommentUpdate={handleCommentUpdate}
					chatMessages={chatMessages}
					setChatMessages={setChatMessages}
					chatLoading={chatLoading}
					chatError={chatError}
					handleChatSubmit={handleChatSubmit}
					clauseAnalysisLoading={clauseAnalysisLoading}
					selectedParty={selectedParty}
					setSelectedParty={setSelectedParty}
					clauseAnalysis={clauseAnalysis}
					setClauseAnalysis={setClauseAnalysis}
					setClauseAnalysisLoading={setClauseAnalysisLoading}
					setClauseAnalysisCounts={setClauseAnalysisCounts}
					setActiveView={setActiveView}
					getTagColor={getTagColor}
					handleChangeParty={handleChangeParty}
					isRedraftModalVisible={isRedraftModalVisible}
					redraftContent={redraftContent}
					selectedClause={selectedClause}
					generatedRedraft={generatedRedraft}
					generatingRedrafts={generatingRedrafts}
					redraftedClauses={redraftedClauses}
					redraftedTexts={redraftedTexts}
					redraftReviewStates={redraftReviewStates}
					onRedraftModalVisibility={handleRedraftModalVisibility}
					onRedraftContentChange={handleRedraftContentChange}
					onSelectedClauseChange={handleSelectedClauseChange}
					onGeneratingRedraftsChange={handleGeneratingRedraftsChange}
					onRedraftedClausesChange={handleRedraftedClausesChange}
					onRedraftedTextsChange={handleRedraftedTextsChange}
					onRedraftReviewStatesChange={handleRedraftReviewStatesChange}
					homeSummaryLoading={homeSummaryLoading}
					homeSummaryReady={homeSummaryReady}
					handleHomeSummaryClick={handleHomeSummaryClick}
					selectedText={selectedText}
					setCommentDraft={setCommentDraft}
					isExplaining={isExplaining}
					handleExplain={handleExplain}
					setRedraftContent={setRedraftContent}
					setIsRedraftModalVisible={setIsRedraftModalVisible}
					setIsBrainstormModalVisible={setIsBrainstormModalVisible}
					setBrainstormMessages={setBrainstormMessages}
					explanation={explanation}
					setExplanation={setExplanation}
					setGeneratedRedraft={setGeneratedRedraft}
					handleAcceptRedraft={handleAcceptRedraft}
					commentDraft={commentDraft}
					handleAddComment={handleAddComment}
					isAddingComment={isAddingComment}
					isLoadingParties={isLoadingParties}
					parties={parties}
					clauseAnalysisCounts={clauseAnalysisCounts}
					handleRedraft={handleRedraft}
					redraftTextAreaRef={redraftTextAreaRef}
					isBrainstormModalVisible={isBrainstormModalVisible}
					brainstormMessages={brainstormMessages}
					brainstormLoading={brainstormLoading}
					handleBrainstormSubmit={handleBrainstormSubmit}
					isDraftModalVisible={isDraftModalVisible}
					setIsDraftModalVisible={setIsDraftModalVisible}
					draftPrompt={draftPrompt}
					setDraftPrompt={setDraftPrompt}
					isDrafting={isDrafting}
					handleDraftSubmit={handleDraftSubmit}
					handleCloseDraftModal={handleCloseDraftModal}
					onTextSelect={handleTextSelection}
				/>
			</Content>
		</Layout>
	);
};

export default AppContent;
