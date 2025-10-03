"use client";

import React, { useCallback, useEffect } from "react";
import { Layout, Button, Typography, message, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useDocument } from "@/hooks/useDocument";
import { useSummary } from "@/hooks/useSummary";
import { useAppState } from "@/hooks/useAppState";
import { useChat } from "@/hooks/useChat";
import { useBrainstorm } from "@/hooks/useBrainstorm";
import { useDraft } from "@/hooks/useDraft";
import { useParties } from "@/hooks/useParties";
import { analysisApi } from "@/services/api";
import { findAndReplaceClause } from "@/utils/wordUtils";
import Timer from "./Timer";
import MainContent from "./MainContent";

const { Text } = Typography;
const { Content } = Layout;

const AppContent: React.FC = () => {
	const { isAuthenticated, logout } = useAuth();

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
		summary,
		summaryLoading,
		summaryProgress,
		summaryError,
		homeSummaryLoading,
		homeSummaryReady,
		handleGenerateSummary,
		handleHomeSummaryClick,
	} = useSummary(documentContent);

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
		parties,
		setParties,
		isLoadingParties,
		setIsLoadingParties,
		selectedParty,
		setSelectedParty,
		getTagColor,
		//loadParties,
	} = useParties();

	const handleChangeParty = useCallback(() => {
		setClauseAnalysis(null);
		setSelectedParty(null);
		setClauseAnalysisCounts({
			acceptable: 0,
			risky: 0,
			missing: 0,
		});
	}, [setClauseAnalysis, setSelectedParty, setClauseAnalysisCounts]);

	const handleTextSelection = useCallback(async () => {
		try {
			// Check if we're in Office environment and Word is available
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					const selection = context.document.getSelection();
					selection.load("text");
					await context.sync();
					const selectedContent = selection.text.trim();
					setSelectedText(selectedContent);
				});
			} else {
				// In browser environment, we can't get selected text from Word
				// This is expected behavior
				console.log("Not in Office environment - text selection not available");
			}
		} catch (error) {
			console.error("Error getting selected text:", error);
			setSelectedText("");
		}
	}, [setSelectedText]);

	useEffect(() => {
		const handleSelectionChange = () => {
			handleTextSelection();
		};

		// Add event handler when component mounts - only in Office environment
		if (
			typeof window !== "undefined" &&
			typeof Office !== "undefined" &&
			Office.context &&
			Office.context.document &&
			typeof Word !== "undefined"
		) {
			try {
				Office.context.document.addHandlerAsync(
					Office.EventType.DocumentSelectionChanged,
					handleSelectionChange
				);

				// Remove event handler when component unmounts
				return () => {
					try {
						Office.context.document.removeHandlerAsync(
							Office.EventType.DocumentSelectionChanged,
							handleSelectionChange
						);
					} catch (error) {
						console.log("Error removing Office event handler:", error);
					}
				};
			} catch (error) {
				console.log("Error adding Office event handler:", error);
			}
		}
	}, [handleTextSelection]);

	// Load parties when document content changes
	// useEffect(() => {
	// 	if (documentContent) {
	// 		//loadParties(documentContent);
	// 	}
	// }, [documentContent, loadParties]);

	const handleLogout = (): void => {
		logout();
		message.success("Successfully logged out");
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
			(setGeneratingRedrafts as any)((prev: any) => {
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
			(setGeneratingRedrafts as any)((prev: any) => {
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
			// Check if we're in Office environment and Word is available
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context: any) => {
					// Get the selected text
					const selection = context.document.getSelection();
					selection.load("text");
					await context.sync();
					
					// Use our enhanced findAndReplaceClause function
					const success = await findAndReplaceClause(
						context, 
						selection.text, 
						generatedRedraft.redraftedText
					);
					
					if (!success) {
						// Fallback to direct replacement if our enhanced method fails
						selection.insertText(
							generatedRedraft.redraftedText,
							Word.InsertLocation.replace
						);
						await context.sync();
					}
				});
			} else {
				// In browser environment, just show success message
				console.log("Not in Office environment - redraft applied in UI only");
			}

			(setRedraftedTexts as any)((prev: any) =>
				new Map(prev).set(
					selectedText,
					generatedRedraft.redraftedText
				)
			);
			(setRedraftedClauses as any)((prev: any) => new Set([...prev, selectedText]));
			setGeneratedRedraft(null);
			(setRedraftReviewStates as any)((prev: any) => {
				const newMap = new Map(prev);
				newMap.delete(selectedText);
				return newMap;
			});
			setRedraftContent("");
			message.success("Redraft applied successfully");
		} catch (error) {
			console.error("Error accepting redraft:", error);
			message.error("Failed to apply redraft");
		}
	};

	const handleAddComment = async (): Promise<void> => {
		if (!commentDraft?.text || !selectedText) return;

		try {
			setIsAddingComment(true);

			// Check if we're in Office environment and Word is available
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				await Word.run(async (context) => {
					const selection = context.document.getSelection();
					selection.insertComment(commentDraft.text);
					await context.sync();
				});
			} else {
				// In browser environment, just add to UI
				console.log("Not in Office environment - comment added to UI only");
			}

			const newComment = {
				id: Date.now().toString(),
				text: commentDraft.text,
				timestamp: new Date().toISOString(),
			};

			(setComments as any)((prev: any) => [...prev, newComment]);
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
						onClick={handleLogout}
						type="link"
						danger
						className="hover:text-red-600"
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
					setSelectedText={setSelectedText}
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
					setCommentDraft={setCommentDraft as any}
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
				/>
			</Content>
		</Layout>
	);
};

export default AppContent;
