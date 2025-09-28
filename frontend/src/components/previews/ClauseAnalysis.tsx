"use client";

import React, { useEffect, useRef, useState } from "react";
import {
	Collapse,
	Typography,
	List,
	Tag,
	Spin,
	Empty,
	Button,
	Modal,
	Input,
	message,
	Tooltip,
} from "antd";
import {
	CheckCircleOutlined,
	WarningOutlined,
	ExclamationCircleOutlined,
	ReloadOutlined,
	InfoCircleOutlined,
	EditOutlined,
	CloseCircleOutlined,
	SyncOutlined,
	UserOutlined,
	MessageOutlined,
	BulbOutlined,
} from "@ant-design/icons";
import { analysisApi } from "@/services/api";
import { findClauseInDocument, findAndReplaceClause } from "@/utils/wordUtils";
import ChatWindow from "../views/ChatWindow";

const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

interface ClauseAnalysisProps {
	results: any;
	loading: boolean;
	selectedParty: any;
	getTagColor: (role: string) => string;
	onChangeParty: () => void;
	isRedraftModalVisible: boolean;
	redraftContent: string;
	selectedClause: any;
	generatedRedraft: any;
	generatingRedrafts: Map<string, boolean>;
	redraftedClauses: Set<string>;
	redraftedTexts: Map<string, string>;
	redraftReviewStates: Map<string, any>;
	onRedraftModalVisibility: (visible: boolean) => void;
	onRedraftContentChange: (content: string) => void;
	onSelectedClauseChange: (clause: any) => void;
	onGeneratingRedraftsChange: (drafts: Map<string, boolean>) => void;
	onRedraftedClausesChange: (clauses: Set<string>) => void;
	onRedraftedTextsChange: (texts: Map<string, string>) => void;
	onRedraftReviewStatesChange: (states: Map<string, any>) => void;
}

const ClauseAnalysis = React.memo<ClauseAnalysisProps>(
	({
		results,
		loading,
		selectedParty,
		getTagColor,
		onChangeParty,
		isRedraftModalVisible,
		redraftContent,
		selectedClause,
		generatedRedraft,
		generatingRedrafts,
		redraftedClauses,
		redraftedTexts,
		redraftReviewStates,
		onRedraftModalVisibility,
		onRedraftContentChange,
		onSelectedClauseChange,
		onGeneratingRedraftsChange,
		onRedraftedClausesChange,
		onRedraftedTextsChange,
		onRedraftReviewStatesChange,
	}) => {
		const redraftTextAreaRef = useRef<any>(null);
		const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
		const [commentContent, setCommentContent] = useState("");
		const [activeCommentItem, setActiveCommentItem] = useState<any>(null);
		const commentTextAreaRef = useRef<any>(null);
		const [isBrainstormModalVisible, setIsBrainstormModalVisible] =
			useState(false);
		const [brainstormMessages, setBrainstormMessages] = useState<any[]>([]);
		const [brainstormLoading, setBrainstormLoading] = useState(false);
		const [activeBrainstormItem, setActiveBrainstormItem] = useState<any>(null);
		const [documentContent, setDocumentContent] = useState("");

		const parseResults = (resultsString: any) => {
			try {
				if (typeof resultsString === "object" && resultsString !== null) {
					return resultsString;
				}

				if (typeof resultsString !== "string") {
					console.warn("Results is neither string nor object:", resultsString);
					return { acceptable: [], risky: [], missing: [] };
				}

				const parsed = JSON.parse(resultsString);
				return parsed;
			} catch (error) {
				console.error("Error parsing analysis results:", {
					error,
					resultsString: resultsString?.substring(0, 100),
				});
				return { acceptable: [], risky: [], missing: [] };
			}
		};

		const parsedResults = parseResults(results);
		const acceptable = parsedResults?.acceptable || [];
		const risky = parsedResults?.risky || [];
		const missing = parsedResults?.missing || [];

		const scrollToClause = async (clauseText: string) => {
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
						// Use our advanced clause finding utility
						const foundRange = await findClauseInDocument(context, clauseText);

						if (foundRange) {
							// Successfully found the clause
							foundRange.select();
							foundRange.scrollIntoView();

							// No highlighting to avoid issues with it persisting
						} else {
							// If advanced search fails, notify the user
							message.warning(
								"Could not find the exact clause in the document"
							);

							// Log the failure for debugging
							console.warn("Failed to find clause:", {
								clauseTextLength: clauseText.length,
								clauseTextPreview: clauseText.substring(0, 100) + "...",
							});
						}
					});
				} else {
					console.log("Not in Office environment - navigation not available");
					message.info("Office environment not available for navigation");
				}
			} catch (error) {
				console.error("Error scrolling to clause:", error);
				message.error("Failed to navigate to clause");
			}
		};

		const handleRedraft = async () => {
			if (!selectedClause) return;

			try {
				// Set loading state for this specific clause
				onGeneratingRedraftsChange(
					new Map(generatingRedrafts).set(selectedClause.text, true)
				);
				onRedraftModalVisibility(false);
				onRedraftContentChange("");

				let documentContent = "";
				// Check if we're in Office environment and Word is available
				if (
					typeof window !== "undefined" &&
					typeof Office !== "undefined" &&
					Office.context &&
					Office.context.document &&
					typeof Word !== "undefined"
				) {
					documentContent = await Word.run(async (context) => {
						const body = context.document.body;
						body.load("text");
						await context.sync();
						return body.text;
					});
				} else {
					documentContent = "Mock document content for browser testing";
				}

				const result = await analysisApi.redraftComment(
					selectedClause.explanation || selectedClause.description,
					documentContent,
					selectedClause.text,
					redraftContent.trim()
				);

				if (result) {
					// Update redraft review state for this specific clause
					onRedraftReviewStatesChange(
						new Map(redraftReviewStates).set(selectedClause.text, {
							text: result,
							clause: selectedClause,
						})
					);
				}
			} catch (error: any) {
				message.error("Failed to generate redraft: " + error.message);
			} finally {
				onGeneratingRedraftsChange((prev) => {
					const next = new Map(prev);
					next.delete(selectedClause.text);
					return next;
				});
			}
		};

		const handleRegenerateRedraft = (item: any) => {
			// Set the selected clause (use the original item, not null)
			onSelectedClauseChange(item);

			// Clear any existing redraft content
			onRedraftContentChange("");

			// Show the redraft modal
			onRedraftModalVisibility(true);

			// Remove the current redraft review state for this item
			onRedraftReviewStatesChange((prev) => {
				const next = new Map(prev);
				next.delete(item.text);
				return next;
			});

			// Focus the redraft textarea when modal opens
			setTimeout(() => {
				redraftTextAreaRef.current?.focus();
			}, 100);
		};

		const handleAcceptRedraft = async (item: any) => {
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
						// Get the current redraft state for this item
						const redraftState = redraftReviewStates.get(item.text);
						if (!redraftState) {
							throw new Error("No redraft found for this clause");
						}

						// Get the text to search for - either the current redrafted text or the original
						const searchText = redraftedTexts.get(item.text) || item.text;

						// Use our advanced clause finding and replacement utility
						const success = await findAndReplaceClause(
							context,
							searchText,
							redraftState.text
						);

						if (success) {
							// Update tracking states
							onRedraftedClausesChange(
								new Set([...redraftedClauses, item.text])
							);
							onRedraftedTextsChange(
								new Map(redraftedTexts).set(item.text, redraftState.text)
							);

							// Clear the redraft review state for this item
							onRedraftReviewStatesChange((prev) => {
								const next = new Map(prev);
								next.delete(item.text);
								return next;
							});

							message.success("Text redrafted successfully");
						} else {
							throw new Error("Could not find the clause to redraft");
						}
					});
				} else {
					// In browser environment, just update UI state
					const redraftState = redraftReviewStates.get(item.text);
					if (redraftState) {
						onRedraftedClausesChange(new Set([...redraftedClauses, item.text]));
						onRedraftedTextsChange(
							new Map(redraftedTexts).set(item.text, redraftState.text)
						);
						onRedraftReviewStatesChange((prev) => {
							const next = new Map(prev);
							next.delete(item.text);
							return next;
						});
						message.success("Text redrafted successfully (UI only)");
					}
				}
			} catch (error: any) {
				console.error("Error in accept redraft:", error);
				message.error("Failed to redraft: " + error.message);
			}
		};

		const handleRedraftClick = (item: any) => {
			onSelectedClauseChange({
				...item,
				text: redraftedTexts.get(item.text) || item.text,
			});
			onRedraftModalVisibility(true);

			// Clear any existing redraft review state for this item
			onRedraftReviewStatesChange((prev) => {
				const next = new Map(prev);
				next.delete(item.text);
				return next;
			});

			setTimeout(() => {
				redraftTextAreaRef.current?.focus();
			}, 0);
		};

		const handleKeyPress = (event: React.KeyboardEvent) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				handleRedraft();
			}
		};

		const renderPartyContext = () => {
			if (!selectedParty) return null;

			return (
				<div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div className="flex flex-col sm:flex-row sm:items-center gap-2">
							<div className="flex items-center gap-2">
								<UserOutlined className="text-blue-500 flex-shrink-0" />
								<Text strong className="whitespace-nowrap">
									Analyzing from perspective of:
								</Text>
							</div>
							<div className="flex flex-col ml-6 sm:ml-0 max-w-full">
								<Text className="break-words max-w-full">
									{selectedParty.name}
								</Text>
								<Tag
									color={getTagColor(selectedParty.role)}
									className="mt-1 max-w-full break-words"
									style={{ whiteSpace: "normal", height: "auto" }}
								>
									{selectedParty.role}
								</Tag>
							</div>
						</div>
						<Button
							type="link"
							onClick={onChangeParty}
							className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
						>
							Change Party
						</Button>
					</div>
				</div>
			);
		};

		const renderClauseItem = (item: any, type: string) => (
			<List.Item
				className={`bg-white mb-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border
        ${
					type === "acceptable"
						? "border-blue-100/50"
						: type === "risky"
						? "border-yellow-100/50"
						: "border-red-100/50"
				}
        first:mt-0 last:mb-0`}
			>
				<div className="w-full px-4 py-3">
					{/* Header Section */}
					<div className="flex items-center justify-between mb-2.5">
						<Text strong className="text-gray-800 text-base">
							{item.title || item.type || "Clause"}
						</Text>
						{type !== "missing" && (
							<Button
								type="link"
								size="small"
								className={`
                ${
									type === "acceptable"
										? "text-blue-600 hover:text-blue-700"
										: type === "risky"
										? "text-yellow-600 hover:text-yellow-700"
										: "text-red-600 hover:text-red-700"
								}
              `}
								onClick={(e) => {
									e.stopPropagation();
									scrollToClause(item.text);
								}}
							>
								Go to clause →
							</Button>
						)}
					</div>

					{/* Content Grid */}
					<div className="grid grid-cols-1 gap-2">
						{/* Clause Text */}
						{type !== "missing" && (
							<div
								className={`rounded-md p-2.5 text-gray-700 text-sm
              ${type === "acceptable" ? "bg-blue-50/50" : "bg-yellow-50/50"}`}
							>
								{item.text}
							</div>
						)}

						{/* Analysis Section */}
						<div className="bg-gray-50/70 rounded-md p-2.5 text-gray-600 text-sm">
							<div className="text-xs text-gray-500 mb-1 font-medium flex items-center">
								<InfoCircleOutlined
									className={`mr-1.5 
                ${
									type === "acceptable"
										? "text-blue-500"
										: type === "risky"
										? "text-yellow-500"
										: "text-red-500"
								}`}
								/>
								Analysis:
							</div>
							{item.explanation || item.description}
						</div>

						{/* Action Buttons Section */}
						{type === "risky" && !redraftedClauses.has(item.text) && (
							<div className="flex flex-wrap gap-2 mt-2">
								<Button
									size="small"
									icon={<MessageOutlined />}
									onClick={(e) => {
										e.stopPropagation();
										setActiveCommentItem(item);
										setIsCommentModalVisible(true);
										setTimeout(() => {
											commentTextAreaRef.current?.focus();
										}, 100);
									}}
									className="flex-1 basis-[calc(50%-4px)] min-w-[110px] flex items-center justify-center gap-1.5 !px-3 !h-8
    text-blue-500 hover:text-blue-600 border-blue-500 hover:border-blue-600"
								>
									<span className="truncate">Comment</span>
								</Button>
								<Button
									size="small"
									icon={<BulbOutlined />}
									onClick={async (e) => {
										e.stopPropagation();
										setActiveBrainstormItem(item);
										await fetchDocumentContent();
										setIsBrainstormModalVisible(true);
										setBrainstormMessages([]);
									}}
									className="flex-1 basis-[calc(50%-4px)] min-w-[110px] flex items-center justify-center gap-1.5 !px-3 !h-8
    text-purple-500 hover:text-purple-600 border-purple-500 hover:border-purple-600"
								>
									<span className="truncate">Brainstorm</span>
								</Button>
								<Button
									type="primary"
									size="small"
									icon={<EditOutlined />}
									onClick={(e) => {
										e.stopPropagation();
										handleRedraftClick(item);
									}}
									loading={generatingRedrafts.get(item.text)}
									className="flex-1 basis-full min-w-[140px] flex items-center justify-center gap-1.5 !px-3 !h-8
    bg-yellow-500 hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600"
								>
									<span className="truncate">Suggest Improvements</span>
								</Button>
							</div>
						)}

						{/* Inline Redraft Review Panel */}
						{redraftReviewStates.get(item.text) && (
							<div className="mt-2 p-3 bg-white shadow-sm border border-yellow-200 rounded-lg">
								<div className="text-xs text-yellow-600 font-medium mb-2">
									AI Generated Redraft:
								</div>
								<div className="max-h-[600px] overflow-y-auto mb-3">
									<TextArea
										value={redraftReviewStates.get(item.text).text}
										onChange={(e) =>
											onRedraftReviewStatesChange(
												new Map(redraftReviewStates).set(item.text, {
													...redraftReviewStates.get(item.text),
													text: e.target.value,
												})
											)
										}
										autoSize={{ minRows: 4, maxRows: 16 }}
										className="text-sm redraft-preview"
									/>
								</div>
								<div className="flex flex-wrap gap-2 justify-end">
									<Button
										size="small"
										onClick={() => {
											onRedraftReviewStatesChange((prev) => {
												const next = new Map(prev);
												next.delete(item.text);
												return next;
											});
										}}
										className="flex-1 sm:flex-none min-w-[80px] hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
									>
										Reject
									</Button>
									<Button
										size="small"
										onClick={() => handleRegenerateRedraft(item)}
										className="flex-1 sm:flex-none min-w-[80px] hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
									>
										Regenerate
									</Button>
									<Button
										size="small"
										type="primary"
										onClick={() => handleAcceptRedraft(item)}
										className="flex-1 sm:flex-none min-w-[80px] bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
									>
										Accept Changes
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</List.Item>
		);

		const handleAddComment = async () => {
			if (!activeCommentItem || !commentContent.trim()) return;

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
						// Use our advanced clause finding utility
						const foundRange = await findClauseInDocument(
							context,
							activeCommentItem.text
						);

						if (foundRange) {
							// Add comment to the found range
							const comment = foundRange.insertComment(commentContent);
							await context.sync();

							// Reset state
							setIsCommentModalVisible(false);
							setCommentContent("");
							setActiveCommentItem(null);
							message.success("Comment added successfully");
						} else {
							// If advanced search fails, notify the user
							message.warning(
								"Could not find the exact clause in the document"
							);

							// Log the failure for debugging
							console.warn("Failed to find clause for comment:", {
								clauseTextLength: activeCommentItem.text.length,
								clauseTextPreview:
									activeCommentItem.text.substring(0, 100) + "...",
							});
						}
					});
				} else {
					// In browser environment, just reset state
					setIsCommentModalVisible(false);
					setCommentContent("");
					setActiveCommentItem(null);
					message.success("Comment added successfully (UI only)");
				}
			} catch (error) {
				console.error("Error adding comment:", error);
				message.error("Failed to add comment");
			}
		};

		const handleBrainstormSubmit = async (messageText: string) => {
			try {
				setBrainstormLoading(true);

				// Add user message
				setBrainstormMessages((prev) => [
					...prev,
					{
						role: "user",
						content: messageText,
						timestamp: new Date().toLocaleTimeString(),
					},
				]);

				// Call the brainstorm API
				const result = await analysisApi.brainstormChat(
					messageText,
					activeBrainstormItem.text,
					activeBrainstormItem.explanation || activeBrainstormItem.description,
					documentContent
				);

				if (result) {
					// Add assistant response
					setBrainstormMessages((prev) => [
						...prev,
						{
							role: "assistant",
							content: result,
							timestamp: new Date().toLocaleTimeString(),
						},
					]);
				}
			} catch (error) {
				console.error("Error in brainstorm:", error);
				setBrainstormMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content:
							"Sorry, I encountered an error while processing your request.",
						isError: true,
						timestamp: new Date().toLocaleTimeString(),
					},
				]);
			} finally {
				setBrainstormLoading(false);
			}
		};

		const fetchDocumentContent = async () => {
			try {
				let content = "";
				// Check if we're in Office environment and Word is available
				if (
					typeof window !== "undefined" &&
					typeof Office !== "undefined" &&
					Office.context &&
					Office.context.document &&
					typeof Word !== "undefined"
				) {
					content = await Word.run(async (context) => {
						const body = context.document.body;
						body.load("text");
						await context.sync();
						return body.text;
					});
				} else {
					content = "Mock document content for browser testing";
				}
				setDocumentContent(content);
			} catch (error) {
				console.error("Error fetching document content:", error);
				message.error("Failed to fetch document content");
			}
		};

		return (
			<>
				<div className="p-4">
					{/* Party Context Banner */}
					{renderPartyContext()}

					{/* Analysis Content */}
					<Title level={4} className="mb-4">
						Document Analysis
					</Title>

					{loading ? (
						<div className="flex flex-col items-center justify-center p-8">
							<Spin size="large" />
							<Text className="text-gray-500">
								Analyzing clauses from {selectedParty?.name}'s perspective...
							</Text>
						</div>
					) : !results ? (
						<Empty
							description="No analysis results available"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					) : (
						<Collapse
							defaultActiveKey={["risky", "redrafted"]}
							className="shadow-sm space-y-2"
						>
							{/* Redrafted Clauses Panel */}
							{redraftedClauses.size > 0 && (
								<Panel
									header={
										<div className="flex items-center">
											<EditOutlined className="text-green-500 mr-2 text-lg" />
											<span className="font-semibold text-green-700">
												Redrafted Clauses ({redraftedClauses.size})
											</span>
										</div>
									}
									key="redrafted"
									className="bg-green-50/50 border-green-100 rounded-md overflow-hidden"
								>
									<List
										dataSource={[...acceptable, ...risky, ...missing].filter(
											(item) => redraftedClauses.has(item.text)
										)}
										renderItem={(item) => (
											<List.Item
												className="bg-white mb-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-green-100/50
                        first:mt-0 last:mb-0"
											>
												<div className="w-full px-4 py-3">
													<div className="flex items-center justify-between mb-2.5">
														<Text strong className="text-gray-800 text-base">
															{item.title || item.type || "Clause"}
														</Text>
														<Button
															type="link"
															size="small"
															className="text-green-600 hover:text-green-700"
															onClick={(e) => {
																e.stopPropagation();
																const redraftedText = redraftedTexts.get(
																	item.text
																);

																if (!redraftedText) {
																	message.warning("Redrafted text not found");
																	return;
																}

																scrollToClause(redraftedText);
															}}
															icon={<CheckCircleOutlined />}
														>
															Go to clause →
														</Button>
													</div>

													<div className="grid grid-cols-1 gap-2">
														<div className="bg-gray-50/70 rounded-md p-2.5 text-gray-600 text-sm">
															<div className="text-xs text-gray-500 mb-1 font-medium">
																Original:
															</div>
															{item.text}
														</div>

														<div className="bg-green-50/50 rounded-md p-2.5 text-gray-700 text-sm">
															<div className="text-xs text-green-600 mb-1 font-medium">
																Redrafted:
															</div>
															{redraftedTexts.get(item.text)}
														</div>

														<div className="bg-gray-50/70 rounded-md p-2.5 text-gray-600 text-sm">
															<div className="text-xs text-gray-500 mb-1 font-medium flex items-center">
																<InfoCircleOutlined className="mr-1.5 text-green-500" />
																Analysis:
															</div>
															{item.explanation || item.description}
														</div>
													</div>
												</div>
											</List.Item>
										)}
									/>
								</Panel>
							)}

							{/* Favorable Clauses Panel */}
							<Panel
								header={
									<div className="flex items-center">
										<CheckCircleOutlined className="text-blue-500 mr-2 text-lg" />
										<span className="font-semibold text-blue-700">
											Favorable Clauses (
											{
												acceptable.filter(
													(item) => !redraftedClauses.has(item.text)
												).length
											}
											)
										</span>
									</div>
								}
								key="acceptable"
								className="bg-blue-50/50 border-blue-100 rounded-md overflow-hidden"
							>
								<List
									dataSource={acceptable.filter(
										(item) => !redraftedClauses.has(item.text)
									)}
									renderItem={(item) => renderClauseItem(item, "acceptable")}
								/>
							</Panel>

							<Panel
								header={
									<div className="flex items-center">
										<WarningOutlined className="text-yellow-500 mr-2 text-lg" />
										<span className="font-semibold text-yellow-700">
											Clauses Needing Review (
											{
												risky.filter((item) => !redraftedClauses.has(item.text))
													.length
											}
											)
										</span>
									</div>
								}
								key="risky"
								className="bg-yellow-50/50 border-yellow-100 rounded-md overflow-hidden"
							>
								<List
									dataSource={risky.filter(
										(item) => !redraftedClauses.has(item.text)
									)}
									renderItem={(item) => renderClauseItem(item, "risky")}
								/>
							</Panel>

							<Panel
								header={
									<div className="flex items-center">
										<ExclamationCircleOutlined className="text-red-500 mr-2 text-lg" />
										<span className="font-semibold text-red-700">
											Missing Protections (
											{
												missing.filter(
													(item) => !redraftedClauses.has(item.text)
												).length
											}
											)
										</span>
									</div>
								}
								key="missing"
								className="bg-red-50/50 border-red-100 rounded-md overflow-hidden"
							>
								<List
									dataSource={missing.filter(
										(item) => !redraftedClauses.has(item.text)
									)}
									renderItem={(item) => renderClauseItem(item, "missing")}
								/>
							</Panel>
						</Collapse>
					)}
				</div>

				<Modal
					title={
						<div className="modal-title text-sm sm:text-base">
							<EditOutlined className="modal-icon mr-2" />
							<span>Redraft this clause</span>
						</div>
					}
					open={isRedraftModalVisible}
					onCancel={() => {
						onRedraftModalVisibility(false);
						onRedraftContentChange("");
						onSelectedClauseChange(null);
					}}
					footer={
						<Button
							type="primary"
							icon={<CheckCircleOutlined />}
							onClick={handleRedraft}
							loading={generatingRedrafts.get(selectedClause?.text)}
							className="w-full sm:w-auto"
						>
							Redraft
						</Button>
					}
					width="90vw"
					className="sm:max-w-[600px]"
				>
					{selectedClause && (
						<>
							<div className="mb-4 p-3 bg-gray-50 rounded">
								<Text strong>Original Clause:</Text>
								<div className="mt-2">{selectedClause.text}</div>
								<Text strong className="mt-3 block">
									Issue:
								</Text>
								<div className="mt-1">
									{selectedClause.explanation || selectedClause.description}
								</div>
							</div>
							<TextArea
								ref={redraftTextAreaRef}
								rows={5}
								value={redraftContent}
								onChange={(e) => onRedraftContentChange(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Give instructions for redrafting this clause..."
								className="redraft-textarea"
							/>
						</>
					)}
				</Modal>

				<Modal
					title={
						<div className="modal-title text-sm sm:text-base">
							<MessageOutlined className="modal-icon mr-2" />
							<span>Add Comment</span>
						</div>
					}
					open={isCommentModalVisible}
					onCancel={() => {
						setIsCommentModalVisible(false);
						setCommentContent("");
						setActiveCommentItem(null);
					}}
					footer={
						<Button
							type="primary"
							icon={<CheckCircleOutlined />}
							onClick={handleAddComment}
							disabled={!commentContent.trim()}
						>
							Add Comment
						</Button>
					}
					width="90vw"
					className="sm:max-w-[600px]"
				>
					{activeCommentItem && (
						<>
							<div className="mb-4 p-3 bg-gray-50 rounded">
								<Text strong>Selected Clause:</Text>
								<div className="mt-2">{activeCommentItem.text}</div>
								<Text strong className="mt-3 block">
									Analysis:
								</Text>
								<div className="mt-1">
									{activeCommentItem.explanation ||
										activeCommentItem.description}
								</div>
							</div>
							<TextArea
								ref={commentTextAreaRef}
								rows={5}
								value={commentContent}
								onChange={(e) => setCommentContent(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleAddComment();
									}
								}}
								placeholder="Enter your comment..."
								className="comment-textarea"
							/>
						</>
					)}
				</Modal>

				<Modal
					title={
						<div className="modal-title text-sm sm:text-base">
							<BulbOutlined className="modal-icon text-purple-500 mr-2" />
							<span>Brainstorm Solutions</span>
						</div>
					}
					open={isBrainstormModalVisible}
					onCancel={() => {
						setIsBrainstormModalVisible(false);
						setActiveBrainstormItem(null);
						setBrainstormMessages([]);
					}}
					footer={null}
					width="90vw"
					className="sm:max-w-[800px] brainstorm-modal"
					style={{
						maxHeight: "90vh",
						top: 20,
					}}
				>
					{activeBrainstormItem && (
						<div className="flex flex-col h-[calc(90vh-120px)] sm:h-[600px]">
							<div className="mb-4 p-3 bg-gray-50 rounded overflow-y-auto max-h-[30vh]">
								<Text strong>Selected Clause:</Text>
								<div className="mt-2">{activeBrainstormItem.text}</div>
								<Text strong className="mt-3 block">
									Analysis:
								</Text>
								<div className="mt-1">
									{activeBrainstormItem.explanation ||
										activeBrainstormItem.description}
								</div>
							</div>
							<div className="flex-1 border rounded-lg overflow-hidden min-h-[300px]">
								<ChatWindow
									documentContent={documentContent}
									messages={brainstormMessages}
									setMessages={setBrainstormMessages}
									isLoading={brainstormLoading}
									onSubmit={handleBrainstormSubmit}
								/>
							</div>
						</div>
					)}
				</Modal>
			</>
		);
	}
);

export default ClauseAnalysis;
