"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	List,
	Card,
	Typography,
	Badge,
	Button,
	Tooltip,
	Collapse,
	message,
} from "antd";
import {
	UserOutlined,
	ClockCircleOutlined,
	CheckCircleOutlined,
	UndoOutlined,
	CaretRightOutlined,
} from "@ant-design/icons";
import { Comment } from "@/types";
import CommentActions from "./CommentActions";

const { Text } = Typography;
const { Panel } = Collapse;

const CommentListView = React.memo(
	({
		comments,
		setComments,
		initialResolvedComments = [],
		onCommentUpdate,
	}: {
		comments: Comment[];
		setComments: (comments: Comment[]) => void;
		initialResolvedComments?: Comment[];
		onCommentUpdate?: (comment: Comment) => void;
	}) => {
		const [resolvedComments, setResolvedComments] = useState<Comment[]>([]);

		useEffect(() => {
			if (initialResolvedComments?.length > 0) {
				setResolvedComments(initialResolvedComments);
			}
		}, [initialResolvedComments]);

		const formatDate = (dateString: string): string => {
			try {
				console.log("Incoming date string:", dateString);

				if (!dateString) {
					return "Date not available";
				}

				const parsedDate = new Date(dateString);

				if (parsedDate instanceof Date && !isNaN(parsedDate)) {
					return parsedDate.toLocaleString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: true,
					});
				}

				const parts = dateString.match(
					/([A-Za-z]+ \d+, \d+) at (\d+:\d+:\d+ [AP]M) GMT([+-]\d+:\d+)/
				);

				if (parts) {
					const [_, datePart, timePart] = parts;
					const date = new Date(`${datePart} ${timePart}`);

					if (date instanceof Date && !isNaN(date)) {
						return date.toLocaleString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						});
					}
				}

				return "Date not available";
			} catch (error) {
				console.error("Error formatting date:", error, "Input:", dateString);
				return "Date not available";
			}
		};

		const navigateToComment = async (commentId: string): Promise<void> => {
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
						// Get all comments in the document
						const docComments = context.document.body.getComments();
						docComments.load("items");
						await context.sync();
						const comment = docComments.items.find((c) => c.id === commentId);

						if (comment) {
							// Load the comment's content range
							const contentRange = comment.getRange();
							contentRange.load("text");
							await context.sync();

							// Select and scroll to the comment's range
							contentRange.select();
							contentRange.scrollIntoView();
							await context.sync();
						} else {
							console.warn("Comment not found:", { commentId });
						}
					});
				} else {
					console.log("Not in Office environment - navigation not available");
				}
			} catch (error) {
				console.error("Error navigating to comment:", { error, commentId });
				console.error("Failed to navigate to comment:", error);
			}
		};

		const handleResolveComment = useCallback(
			async (commentId: string): Promise<void> => {
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
							const docComments = context.document.body.getComments();
							docComments.load("items");
							await context.sync();

							const comment = docComments.items.find((c) => c.id === commentId);

							if (comment) {
								comment.resolved = true;
								await context.sync();

								setComments((prevComments) => {
									const commentToMove = prevComments.find(
										(c) => c.id === commentId
									);
									setResolvedComments((prev) => [
										...prev,
										{
											...commentToMove,
											resolved: true,
											content: commentToMove?.content,
										},
									]);
									return prevComments.filter((c) => c.id !== commentId);
								});

								message.success("Comment resolved successfully");
							}
						});
					} else {
						// In browser environment, just update the UI
						setComments((prevComments) => {
							const commentToMove = prevComments.find(
								(c) => c.id === commentId
							);
							setResolvedComments((prev) => [
								...prev,
								{
									...commentToMove,
									resolved: true,
									content: commentToMove?.content,
								},
							]);
							return prevComments.filter((c) => c.id !== commentId);
						});
						message.success("Comment resolved successfully");
					}
				} catch (error) {
					console.error("Failed to resolve comment:", error);
					message.error("Failed to resolve comment");
				}
			},
			[setComments]
		);

		const handleUnresolveComment = async (commentId: string): Promise<void> => {
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
						const docComments = context.document.body.getComments();
						docComments.load("items");
						await context.sync();

						const comment = docComments.items.find((c) => c.id === commentId);

						if (comment) {
							comment.resolved = false;
							await context.sync();

							setResolvedComments((prevResolved) => {
								const commentToMove = prevResolved.find(
									(c) => c.id === commentId
								);
								setComments((prev) => [
									...prev,
									{ ...commentToMove, resolved: false },
								]);
								return prevResolved.filter((c) => c.id !== commentId);
							});

							message.success("Comment unresolved successfully");
						} else {
							message.error("Comment not found");
						}
					});
				} else {
					// In browser environment, just update the UI
					setResolvedComments((prevResolved) => {
						const commentToMove = prevResolved.find((c) => c.id === commentId);
						setComments((prev) => [
							...prev,
							{ ...commentToMove, resolved: false },
						]);
						return prevResolved.filter((c) => c.id !== commentId);
					});
					message.success("Comment unresolved successfully");
				}
			} catch (error) {
				console.error("Failed to unresolve comment:", error);
				message.error("Failed to unresolve comment");
			}
		};

		const renderReplyList = (replies: any[]) => {
			if (!replies || replies.length === 0) return null;

			return (
				<div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-200">
					{replies.map((reply) => (
						<div
							key={reply.id}
							className="pl-4 py-2 hover:bg-gray-50 transition-colors duration-200"
						>
							<div className="flex items-center mb-2">
								<div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
									<UserOutlined className="text-gray-500 text-sm" />
								</div>
								<Text strong className="text-sm ml-2">
									{reply.author}
								</Text>
								<Text
									type="secondary"
									className="text-xs ml-2 flex items-center"
								>
									<ClockCircleOutlined className="mr-1" />
									{formatDate(reply.date)}
								</Text>
							</div>
							<div className="ml-8 text-sm text-gray-700">{reply.content}</div>
						</div>
					))}
				</div>
			);
		};

		const renderCommentCard = (comment: Comment, isResolved = false) => (
			<Card
				className={`rounded-lg shadow-sm hover:shadow transition-all duration-200 
        ${isResolved ? "bg-gray-50/50" : "bg-white"}`}
				bodyStyle={{ padding: "12px" }}
			>
				<div className="flex justify-between items-start mb-2">
					<div className="flex items-start space-x-2">
						<div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
							<UserOutlined className="text-white text-xs" />
						</div>
						<div className="flex flex-col">
							<Text strong className="text-xs">
								{comment.author || "User"}
							</Text>
							<Text type="secondary" className="text-xs flex items-center">
								<ClockCircleOutlined className="mr-1 text-xs" />
								{formatDate(comment.timestamp)}
							</Text>
						</div>
					</div>
					<div>
						{!isResolved && (
							<Tooltip title="Mark as Resolved">
								<Button
									type="text"
									size="small"
									icon={
										<CheckCircleOutlined className="text-green-600 hover:text-green-700 text-sm" />
									}
									className="hover:bg-green-50 rounded-full p-1"
									onClick={() => handleResolveComment(comment.id)}
								/>
							</Tooltip>
						)}
					</div>
				</div>

				<div
					className="ml-8 p-2 rounded-md cursor-pointer hover:bg-gray-50 
          transition-colors duration-200"
					onClick={() => navigateToComment(comment.id)}
				>
					<Text className="text-gray-700 text-sm">{comment.text}</Text>
				</div>

				{comment.replies && comment.replies.length > 0 && (
					<div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200">
						{comment.replies.map((reply) => (
							<div
								key={reply.id}
								className="pl-3 py-1 hover:bg-gray-50 transition-colors duration-200"
							>
								<div className="flex items-center mb-1">
									<div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
										<UserOutlined className="text-gray-500 text-xs" />
									</div>
									<Text strong className="text-xs ml-2">
										{reply.author}
									</Text>
									<Text
										type="secondary"
										className="text-xs ml-2 flex items-center"
									>
										<ClockCircleOutlined className="mr-1 text-xs" />
										{formatDate(reply.date)}
									</Text>
								</div>
								<div className="ml-7 text-xs text-gray-700">
									{reply.content}
								</div>
							</div>
						))}
					</div>
				)}

				{!isResolved && (
					<div className="mt-3 pt-2 border-t border-gray-100">
						<CommentActions
							comment={comment}
							onCommentUpdate={onCommentUpdate}
						/>
					</div>
				)}
			</Card>
		);

		return (
			<div className="comments-container">
				{resolvedComments.length > 0 && (
					<div className="resolved-comments-section">
						<div className="sticky-header">
							<Collapse
								className="mb-4"
								expandIcon={({ isActive }) => (
									<CaretRightOutlined rotate={isActive ? 90 : 0} />
								)}
							>
								<Panel
									header={
										<span className="text-green-600 font-medium">
											Resolved Comments ({resolvedComments.length})
										</span>
									}
									key="resolved"
								>
									<div className="resolved-comments-scroll">
										<List
											className="space-y-4"
											itemLayout="vertical"
											dataSource={resolvedComments}
											renderItem={(comment) => (
												<div className="transition-all duration-200 mb-4">
													{renderCommentCard(comment, true)}
												</div>
											)}
										/>
									</div>
								</Panel>
							</Collapse>
						</div>
					</div>
				)}

				<List
					className="space-y-4"
					itemLayout="vertical"
					dataSource={comments}
					renderItem={(comment) => (
						<div className="transition-all duration-200 mb-4">
							{renderCommentCard(comment, false)}
						</div>
					)}
				/>
			</div>
		);
	}
);

export default CommentListView;
