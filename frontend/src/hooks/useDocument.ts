"use client";

import { useState, useCallback, useEffect } from "react";
import { Comment, UseDocumentReturn } from "@/types";
import { DEMO_DOCUMENT_CONTENT } from "@/data/hardcodedData";

export const useDocument = (): UseDocumentReturn => {
	const [documentContent, setDocumentContent] = useState<string>("");
	const [selectedText, setSelectedText] = useState<string>("");
	const [comments, setComments] = useState<Comment[]>([]);
	const [initialResolvedComments, setInitialResolvedComments] = useState<
		Comment[]
	>([]);

	// Document load handler
	const initialDocumentLoad = useCallback(async () => {
		try {
			// Check if we're in Office environment
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
					await context.sync();
					setDocumentContent(body.text);
				});
			} else {
				// In browser environment, use demo content
				console.log("Not in Office environment - using demo content");
				setDocumentContent(DEMO_DOCUMENT_CONTENT);
			}
		} catch (error) {
			console.error("Error in initial document load:", error);
		}
	}, []);

	// Text selection handler
	const handleTextSelection = useCallback(async () => {
		try {
			// Check if we're in Office environment
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
					setSelectedText(selection.text.trim());
				});
			}
		} catch (error) {
			console.error("Error getting selected text:", error);
			setSelectedText("");
		}
	}, []);

	// Document polling for comments
	const pollDocumentUpdates = useCallback(async () => {
		try {
			// Check if we're in Office environment
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

					docComments.items.forEach((comment) => {
						comment.load([
							"id",
							"authorName",
							"content",
							"creationDate",
							"replies",
							"resolved",
						]);
						const range = comment.getRange();
						range.load("text");
					});
					await context.sync();

					const processedComments = await Promise.all(
						docComments.items.map(async (comment) => {
							const range = comment.getRange();
							await context.sync();

							return {
								id: comment.id,
								content: comment.content || "",
								documentText: range.content,
								author: comment.authorName || "Unknown Author",
								authorEmail: comment.authorEmail || "",
								resolved: comment.resolved || false,
								date: comment.creationDate
									? new Intl.DateTimeFormat("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
											timeZoneName: "short",
									  }).format(new Date(comment.creationDate))
									: new Date().toLocaleString(),
								replies:
									comment.replies?.items.map((reply) => ({
										id: reply.id,
										content: reply.content || "",
										author: reply.authorName || "Unknown Author",
										date: reply.creationDate
											? new Intl.DateTimeFormat("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
													second: "2-digit",
													timeZoneName: "short",
											  }).format(new Date(reply.creationDate))
											: new Date().toLocaleString(),
									})) || [],
							};
						})
					);

					const unresolvedComments = processedComments.filter(
						(comment) => !comment.resolved
					);
					const resolvedComments = processedComments.filter(
						(comment) => comment.resolved
					);

					// Only update state if there is a change to avoid unnecessary re-renders
					setComments((prev) => {
						if (JSON.stringify(prev) !== JSON.stringify(unresolvedComments)) {
							return unresolvedComments;
						}
						return prev;
					});

					setInitialResolvedComments((prev) => {
						if (JSON.stringify(prev) !== JSON.stringify(resolvedComments)) {
							return resolvedComments;
						}
						return prev;
					});
				});
			}
		} catch (error) {
			console.error("Error polling document updates:", error);
		}
	}, []);

	// Handle comment updates
	const handleCommentUpdate = useCallback((updatedComment: Comment): void => {
		setComments((prevComments) =>
			prevComments.map((comment) =>
				comment.id === updatedComment.id ? updatedComment : comment
			)
		);
	}, []);

	useEffect(() => {
		// Initial document load
		initialDocumentLoad();

		// Set up text selection listener
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
			} catch (error) {
				console.log("Error adding Office event handler:", error);
			}
		}

		// Set up document polling
		const pollInterval = setInterval(pollDocumentUpdates, 3000);

		return () => {
			clearInterval(pollInterval);
			// Remove event handler when component unmounts
			if (
				typeof window !== "undefined" &&
				typeof Office !== "undefined" &&
				Office.context &&
				Office.context.document &&
				typeof Word !== "undefined"
			) {
				try {
					Office.context.document.removeHandlerAsync(
						Office.EventType.DocumentSelectionChanged,
						handleSelectionChange
					);
				} catch (error) {
					console.log("Error removing Office event handler:", error);
				}
			}
		};
	}, [initialDocumentLoad, handleTextSelection, pollDocumentUpdates]);

	return {
		documentContent,
		selectedText,
		comments,
		initialResolvedComments,
		setComments,
		setSelectedText,
		handleCommentUpdate,
	};
};
