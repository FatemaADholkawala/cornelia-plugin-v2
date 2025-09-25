"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Modal, Input, message, Tooltip } from "antd";
import {
	EditOutlined,
	MessageOutlined,
	CloseCircleOutlined,
	CheckCircleOutlined,
	SyncOutlined,
} from "@ant-design/icons";
import { Comment } from "@/types";
import { analysisApi } from "@/services/api";

const { TextArea } = Input;

interface CommentActionsProps {
	comment: Comment;
	onCommentUpdate?: (comment: Comment) => void;
}

const CommentActions: React.FC<CommentActionsProps> = React.memo(
	({ comment, onCommentUpdate }) => {
		const [lastModifiedPosition, setLastModifiedPosition] = useState<any>(null);
		const [isRedraftModalVisible, setIsRedraftModalVisible] = useState(false);
		const [isAIReplyModalVisible, setIsAIReplyModalVisible] = useState(false);
		const [redraftContent, setRedraftContent] = useState("");
		const [aiReplyContent, setAIReplyContent] = useState("");
		const [isGeneratingReply, setIsGeneratingReply] = useState(false);
		const [isGeneratingRedraft, setIsGeneratingRedraft] = useState(false);
		const [generatedReply, setGeneratedReply] = useState<string | null>(null);
		const [generatedRedraft, setGeneratedRedraft] = useState<any>(null);
		const replyTextAreaRef = useRef<HTMLTextAreaElement>(null);
		const redraftTextAreaRef = useRef<HTMLTextAreaElement>(null);
		const [redraftRangeTracking, setRedraftRangeTracking] = useState<any>(null);

		// Effect for AI Reply Modal
		useEffect(() => {
			if (isAIReplyModalVisible && replyTextAreaRef.current) {
				// Small delay to ensure modal is fully rendered
				const timer = setTimeout(() => {
					replyTextAreaRef.current?.focus();
				}, 100);
				return () => clearTimeout(timer);
			}
		}, [isAIReplyModalVisible]);

		// Effect for Redraft Modal
		useEffect(() => {
			if (isRedraftModalVisible && redraftTextAreaRef.current) {
				const timer = setTimeout(() => {
					redraftTextAreaRef.current?.focus();
				}, 100);
				return () => clearTimeout(timer);
			}
		}, [isRedraftModalVisible]);

		const handleAIReply = async (): Promise<void> => {
			if (!comment) return;

			try {
				setIsGeneratingReply(true);
				setIsAIReplyModalVisible(false);
				setAIReplyContent("");

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
					// In browser environment, use mock content
					documentContent = "Mock document content for browser testing";
				}

				const result = await analysisApi.replyToComment(
					comment.text,
					documentContent,
					aiReplyContent.trim(),
					comment.replies || []
				);

				if (result) {
					setGeneratedReply(result);
				}
			} catch (error) {
				message.error("Failed to generate reply: " + (error as Error).message);
			} finally {
				setIsGeneratingReply(false);
			}
		};

		const handleAcceptGeneratedReply = useCallback(async (): Promise<void> => {
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
						const comments = context.document.body.getComments();
						comments.load("items");
						await context.sync();

						const targetComment = comments.items.find(
							(c) => c.id === comment.id
						);
						if (!targetComment) {
							throw new Error("Comment not found");
						}

						targetComment.replies.load();
						await context.sync();

						const newReply = targetComment.reply(generatedReply!);
						newReply.load(["id", "authorName", "created"]);
						await context.sync();

						const updatedComment = {
							...comment,
							replies: [
								...(comment.replies || []),
								{
									id: newReply.id,
									content: generatedReply,
									author: newReply.authorName || "Unknown Author",
									date: new Date().toISOString(),
								},
							],
						};

						onCommentUpdate?.(updatedComment);
						setGeneratedReply(null);
						message.success("Reply added successfully");
					});
				} else {
					// In browser environment, just update the UI
					const updatedComment = {
						...comment,
						replies: [
							...(comment.replies || []),
							{
								id: `reply-${Date.now()}`,
								content: generatedReply,
								author: "User",
								date: new Date().toISOString(),
							},
						],
					};

					onCommentUpdate?.(updatedComment);
					setGeneratedReply(null);
					message.success("Reply added successfully");
				}
			} catch (error) {
				console.error("Error adding reply:", error);
				message.error("Failed to add reply: " + (error as Error).message);
			}
		}, [comment, generatedReply, onCommentUpdate]);

		const handleRejectGeneratedReply = (): void => {
			setGeneratedReply(null);
		};

		const handleRegenerateAIReply = (): void => {
			setGeneratedReply(null);
			setIsAIReplyModalVisible(true);
		};

		// Update handleRedraft to handle cases where the comment range might have changed
		const handleRedraft = async (): Promise<void> => {
			if (!comment) return;

			try {
				setIsGeneratingRedraft(true);
				setIsRedraftModalVisible(false);
				setRedraftContent("");

				let documentContent = "";
				let selectedText = comment.text;

				// Check if we're in Office environment and Word is available
				if (
					typeof window !== "undefined" &&
					typeof Office !== "undefined" &&
					Office.context &&
					Office.context.document &&
					typeof Word !== "undefined"
				) {
					await Word.run(async (context) => {
						const body = context.document.body;
						body.load("text");

						const comments = context.document.body.getComments();
						comments.load("items");
						await context.sync();

						const targetComment = comments.items.find(
							(c) => c.id === comment.id
						);
						if (!targetComment) {
							throw new Error("Comment not found");
						}

						let contentRange = targetComment.getRange();
						contentRange.load(["text", "start", "end"]);
						await context.sync();

						// If range is empty and we have lastModifiedPosition, try to use that
						if (
							!contentRange.text &&
							lastModifiedPosition?.commentId === comment.id
						) {
							const paragraphs = context.document.body.paragraphs;
							paragraphs.load("items");
							await context.sync();

							// Search for the modified text in nearby paragraphs
							for (let i = 0; i < paragraphs.items.length; i++) {
								const para = paragraphs.items[i];
								para.load("text");
								await context.sync();

								if (para.text.includes(lastModifiedPosition.text)) {
									contentRange = para.getRange();
									break;
								}
							}
						}

						// Get document content for AI processing
						documentContent = body.text;
						selectedText =
							contentRange.text || lastModifiedPosition?.text || comment.text;
					});
				} else {
					// In browser environment, use mock content
					documentContent = "Mock document content for browser testing";
					selectedText = comment.text;
				}

				const result = await analysisApi.redraftComment(
					comment.text,
					documentContent,
					selectedText,
					redraftContent.trim(),
					comment.replies || []
				);

				if (result) {
					setGeneratedRedraft({
						text: result,
						range: null, // Not available in browser environment
					});
				}
			} catch (error) {
				console.error("Error redrafting:", error);
				message.error("Failed to redraft: " + (error as Error).message);
			} finally {
				setIsGeneratingRedraft(false);
			}
		};

		const handleKeyPress = (e: React.KeyboardEvent, action: string): void => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				if (action === "aiReply") {
					handleAIReply();
				} else if (action === "redraft") {
					handleRedraft();
				}
			}
		};

		const handleAcceptRedraft = async (): Promise<void> => {
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
						const comments = context.document.body.getComments();
						comments.load("items");
						await context.sync();

						const targetComment = comments.items.find(
							(c) => c.id === comment.id
						);
						if (!targetComment) {
							throw new Error("Comment not found");
						}

						// Get the comment's range and load its properties
						const contentRange = targetComment.getRange();
						contentRange.load(["text", "start", "end"]);
						await context.sync();

						// If the comment range has text, use it directly
						if (contentRange.text && contentRange.text.trim().length > 0) {
							contentRange.insertText(
								generatedRedraft.text,
								Word.InsertLocation.replace
							);
						} else {
							// If the comment range is empty, try to find the text using our advanced search
							const selectedText = lastModifiedPosition?.text || comment.text;
							throw new Error("Could not find the text to redraft");
						}

						// Store range information for undo tracking
						setRedraftRangeTracking({
							originalText:
								contentRange.text || lastModifiedPosition?.text || comment.text,
							originalStart: contentRange.start,
							originalEnd: contentRange.end,
							newStart: contentRange.start,
							newEnd: contentRange.start + generatedRedraft.text.length,
							commentId: comment.id,
						});

						await context.sync();
						setGeneratedRedraft(null);
						message.success("Text redrafted successfully");
					});
				} else {
					// In browser environment, just show success message
					console.log("Not in Office environment - redraft applied in UI only");
					setGeneratedRedraft(null);
					message.success("Text redrafted successfully");
				}
			} catch (error) {
				console.error("Error applying redraft:", error);
				message.error("Failed to apply redraft: " + (error as Error).message);
			}
		};

		const handleRejectRedraft = (): void => {
			setGeneratedRedraft(null);
		};

		const handleRegenerateRedraft = (): void => {
			setGeneratedRedraft(null);
			setIsRedraftModalVisible(true);
		};

		const handleAcceptAndResolve = async (): Promise<void> => {
			try {
				// First redraft the text using the existing handler
				// This will set up the redraftRangeTracking
				await handleAcceptRedraft();

				// Check if we're in Office environment and Word is available
				if (
					typeof window !== "undefined" &&
					typeof Office !== "undefined" &&
					Office.context &&
					Office.context.document &&
					typeof Word !== "undefined"
				) {
					await Word.run(async (context) => {
						const comments = context.document.body.getComments();
						comments.load("items");
						await context.sync();

						const targetComment = comments.items.find(
							(c) => c.id === comment.id
						);
						if (!targetComment) {
							throw new Error("Comment not found");
						}

						// Then resolve the comment
						targetComment.resolved = true;
						await context.sync();

						// Update UI state through CommentList with the new content
						onCommentUpdate?.({
							...comment,
							resolved: true,
							content: generatedRedraft?.text || comment.text, // Store the updated content
						});

						message.success("Text redrafted and comment resolved");
					});
				} else {
					// In browser environment, just update the UI
					onCommentUpdate?.({
						...comment,
						resolved: true,
						content: generatedRedraft?.text || comment.text,
					});
					message.success("Text redrafted and comment resolved");
				}
			} catch (error) {
				console.error("Error in accept and resolve:", error);
				message.error(
					"Failed to redraft and resolve: " + (error as Error).message
				);
				// Clear tracking state on error
				setRedraftRangeTracking(null);
				setGeneratedRedraft(null);
			}
		};

		// Update handleAcceptAndComment to track the new range
		const handleAcceptAndComment = async (): Promise<void> => {
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
						const comments = context.document.body.getComments();
						comments.load("items");
						await context.sync();

						const targetComment = comments.items.find(
							(c) => c.id === comment.id
						);
						if (!targetComment) {
							throw new Error("Comment not found");
						}

						// Get the comment's range
						const contentRange = targetComment.getRange();
						contentRange.load(["text", "start", "end"]);
						await context.sync();

						// Store the position before modification
						const startPosition = contentRange.start;
						const textLength = generatedRedraft.text.length;

						// Insert the new text
						contentRange.insertText(
							generatedRedraft.text,
							Word.InsertLocation.replace
						);
						await context.sync();

						// Store the modified position info
						setLastModifiedPosition({
							start: startPosition,
							end: startPosition + textLength,
							commentId: comment.id,
							text: generatedRedraft.text,
						});

						// Open the reply modal
						setIsAIReplyModalVisible(true);
						setGeneratedRedraft(null);

						// Update UI state
						onCommentUpdate?.({
							...comment,
							content: generatedRedraft.text,
						});
					});
				} else {
					// In browser environment, just open the reply modal
					setIsAIReplyModalVisible(true);
					setGeneratedRedraft(null);
				}
			} catch (error) {
				console.error("Error in accept and comment:", error);
				message.error(
					"Failed to redraft and open comment: " + (error as Error).message
				);
			}
		};

		const handleDirectReply = async (): Promise<void> => {
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
						const comments = context.document.body.getComments();
						comments.load("items");
						await context.sync();

						const targetComment = comments.items.find(
							(c) => c.id === comment.id
						);
						if (!targetComment) {
							throw new Error("Comment not found");
						}

						const newReply = targetComment.reply(aiReplyContent);
						newReply.load(["id", "authorName", "created"]);
						await context.sync();

						const updatedComment = {
							...comment,
							replies: [
								...(comment.replies || []),
								{
									id: newReply.id,
									content: aiReplyContent,
									author: newReply.authorName || "Unknown Author",
									date: new Date().toISOString(),
								},
							],
						};

						onCommentUpdate?.(updatedComment);
						setAIReplyContent("");
						setIsAIReplyModalVisible(false);
						message.success("Reply added successfully");
					});
				} else {
					// In browser environment, just update the UI
					const updatedComment = {
						...comment,
						replies: [
							...(comment.replies || []),
							{
								id: `reply-${Date.now()}`,
								content: aiReplyContent,
								author: "User",
								date: new Date().toISOString(),
							},
						],
					};

					onCommentUpdate?.(updatedComment);
					setAIReplyContent("");
					setIsAIReplyModalVisible(false);
					message.success("Reply added successfully");
				}
			} catch (error) {
				console.error("Error adding direct reply:", error);
				message.error("Failed to add reply: " + (error as Error).message);
			}
		};

		return (
			<>
				<div className="flex justify-end gap-4 p-4">
					<Button
						icon={<EditOutlined />}
						onClick={() => setIsRedraftModalVisible(true)}
						loading={isGeneratingRedraft}
					>
						Redraft
					</Button>
					<Button
						type="primary"
						icon={<MessageOutlined />}
						onClick={() => setIsAIReplyModalVisible(true)}
						loading={isGeneratingReply}
					>
						Reply
					</Button>
				</div>

				{/* Generated Redraft Card */}
				{generatedRedraft && (
					<div className="redraft-result-card mt-4 p-4 bg-white shadow-sm border border-gray-200">
						<div className="text-sm text-gray-600 mb-2">
							AI Generated Redraft:
						</div>
						<div className="max-h-[200px] overflow-y-auto mb-4">
							<TextArea
								value={generatedRedraft.text}
								onChange={(e) =>
									setGeneratedRedraft((prev) => ({
										...prev,
										text: e.target.value,
									}))
								}
								onKeyPress={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleAcceptRedraft();
									}
								}}
								autoSize={{ minRows: 4, maxRows: 12 }}
								className="text-base redraft-preview"
							/>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Button
								size="small"
								onClick={handleRejectRedraft}
								className="hover:bg-red-600 hover:border-red-600"
							>
								Reject
							</Button>
							<Button
								size="small"
								onClick={handleRegenerateRedraft}
								className="hover:bg-blue-600 hover:border-blue-600 transition-colors"
							>
								Regenerate
							</Button>
							<Button
								size="small"
								type="primary"
								onClick={handleAcceptAndResolve}
								className="hover:bg-green-600 hover:border-green-600 transition-colors"
							>
								Accept & Resolve
							</Button>
							<Button
								size="small"
								type="primary"
								onClick={handleAcceptAndComment}
								className="hover:bg-green-600 hover:border-green-600 transition-colors"
							>
								Accept & Reply
							</Button>
						</div>
					</div>
				)}

				{/* Generated Reply Card */}
				{generatedReply && (
					<div className="reply-result-card mt-4 p-4 bg-white shadow-sm border border-gray-200">
						<div className="text-sm text-gray-600 mb-2">
							AI Generated Reply:
						</div>
						<div className="max-h-[200px] overflow-y-auto mb-4">
							<TextArea
								value={generatedReply}
								onChange={(e) => setGeneratedReply(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleAcceptGeneratedReply();
									}
								}}
								autoSize={{ minRows: 4, maxRows: 12 }}
								className="text-base reply-preview"
							/>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Button
								size="small"
								onClick={handleRejectGeneratedReply}
								className="hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 flex items-center justify-center gap-1"
								icon={<CloseCircleOutlined />}
							>
								Reject
							</Button>
							<Button
								size="small"
								onClick={handleRegenerateAIReply}
								className="hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 flex items-center justify-center gap-1"
								icon={<SyncOutlined />}
							>
								Regenerate
							</Button>
							<Button
								size="small"
								type="primary"
								onClick={handleAcceptGeneratedReply}
								className="hover:bg-green-600 hover:border-green-600 transition-all duration-200 flex items-center justify-center gap-1 col-span-2"
								icon={<CheckCircleOutlined />}
							>
								Accept Reply
							</Button>
						</div>
					</div>
				)}

				{/* AI Reply Modal */}
				<Modal
					title={
						<div className="modal-title">
							<EditOutlined className="modal-icon mr-2" />
							<span>Reply with Cornelia</span>
						</div>
					}
					open={isAIReplyModalVisible}
					onCancel={() => {
						setIsAIReplyModalVisible(false);
						setAIReplyContent("");
					}}
					footer={
						<div className="flex justify-end space-x-2">
							<Button
								disabled={!aiReplyContent.trim()}
								onClick={handleDirectReply}
							>
								Reply
							</Button>
							<Button
								type="primary"
								icon={<CheckCircleOutlined />}
								onClick={handleAIReply}
							>
								Generate Reply
							</Button>
						</div>
					}
					width={360}
					className="ai-reply-modal"
					closeIcon={null}
				>
					<TextArea
						ref={replyTextAreaRef}
						rows={5}
						value={aiReplyContent}
						onChange={(e) => setAIReplyContent(e.target.value)}
						onKeyPress={(e) => handleKeyPress(e, "aiReply")}
						placeholder="Give instructions for your reply..."
						className="ai-reply-textarea"
					/>
				</Modal>

				{/* Redraft Modal */}
				<Modal
					title={
						<div className="modal-title">
							<EditOutlined className="modal-icon mr-2" />
							<span>Redraft with Cornelia</span>
						</div>
					}
					open={isRedraftModalVisible}
					onCancel={() => {
						setIsRedraftModalVisible(false);
						setRedraftContent("");
					}}
					footer={
						<Button
							type="primary"
							icon={<CheckCircleOutlined />}
							onClick={handleRedraft}
						>
							Redraft
						</Button>
					}
					width={360}
					className="redraft-modal"
					closeIcon={null}
				>
					<TextArea
						ref={redraftTextAreaRef}
						rows={5}
						value={redraftContent}
						onChange={(e) => setRedraftContent(e.target.value)}
						onKeyPress={(e) => handleKeyPress(e, "redraft")}
						placeholder="Give instructions for your redraft..."
						className="redraft-textarea"
					/>
				</Modal>
			</>
		);
	}
);

export default CommentActions;
