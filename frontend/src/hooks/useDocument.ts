"use client";

import { useState, useCallback } from "react";
import { Comment, UseDocumentReturn } from "@/types";

export const useDocument = (): UseDocumentReturn => {
	const [documentContent, setDocumentContent] = useState<string>("");
	const [selectedText, setSelectedText] = useState<string>("");
	const [comments, setComments] = useState<Comment[]>([]);
	const [initialResolvedComments, setInitialResolvedComments] = useState<
		Comment[]
	>([]);

	// Handle comment updates
	const handleCommentUpdate = useCallback((updatedComment: Comment): void => {
		setComments((prevComments) =>
			prevComments.map((comment) =>
				comment.id === updatedComment.id ? updatedComment : comment
			)
		);
	}, []);

	// Simulate document content loading
	const loadDocumentContent = useCallback((content: string): void => {
		setDocumentContent(content);
	}, []);

	// Simulate text selection
	const selectText = useCallback((text: string): void => {
		setSelectedText(text);
	}, []);

	// Add a new comment
	const addComment = useCallback((comment: Comment): void => {
		setComments((prev) => [...prev, comment]);
	}, []);

	// Remove a comment
	const removeComment = useCallback((commentId: string): void => {
		setComments((prev) => prev.filter((comment) => comment.id !== commentId));
	}, []);

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
