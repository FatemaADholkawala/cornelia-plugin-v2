"use client";

import { useState, useRef, useLayoutEffect } from "react";
import {
	ActiveView,
	ClauseAnalysis,
	AnalysisCounts,
	Clause,
	RedraftContent,
	Explanation,
	CommentDraft,
	UseAppStateReturn,
} from "@/types";

export const useAppState = (): UseAppStateReturn => {
	const [activeView, setActiveView] = useState<ActiveView | null>(null);
	const [clauseAnalysis, setClauseAnalysis] = useState<ClauseAnalysis | null>(
		null
	);
	const [clauseAnalysisLoading, setClauseAnalysisLoading] =
		useState<boolean>(false);
	const [clauseAnalysisCounts, setClauseAnalysisCounts] =
		useState<AnalysisCounts>({
			acceptable: 0,
			risky: 0,
			missing: 0,
		});

	const redraftTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

	// Redraft related states
	const [isRedraftModalVisible, setIsRedraftModalVisible] =
		useState<boolean>(false);
	const [redraftContent, setRedraftContent] = useState<string>("");
	const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
	const [generatedRedraft, setGeneratedRedraft] =
		useState<RedraftContent | null>(null);
	const [generatingRedrafts, setGeneratingRedrafts] = useState<
		Map<string, boolean>
	>(new Map());
	const [redraftedClauses, setRedraftedClauses] = useState<Set<string>>(
		new Set()
	);
	const [redraftedTexts, setRedraftedTexts] = useState<Map<string, string>>(
		new Map()
	);
	const [redraftReviewStates, setRedraftReviewStates] = useState<
		Map<string, any>
	>(new Map());

	// Explanation states
	const [isExplaining, setIsExplaining] = useState<boolean>(false);
	const [explanation, setExplanation] = useState<Explanation | null>(null);

	// Comment states
	const [commentDraft, setCommentDraft] = useState<CommentDraft | null>(null);
	const [isAddingComment, setIsAddingComment] = useState<boolean>(false);

	useLayoutEffect(() => {
		if (isRedraftModalVisible && redraftTextAreaRef.current) {
			redraftTextAreaRef.current.focus();
		}
	}, [isRedraftModalVisible]);

	return {
		// View state
		activeView,
		setActiveView,

		// Clause analysis states
		clauseAnalysis,
		setClauseAnalysis,
		clauseAnalysisLoading,
		setClauseAnalysisLoading,
		clauseAnalysisCounts,
		setClauseAnalysisCounts,

		// Redraft states
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

		// Explanation states
		isExplaining,
		setIsExplaining,
		explanation,
		setExplanation,

		// Comment states
		commentDraft,
		setCommentDraft,
		isAddingComment,
		setIsAddingComment,
		redraftTextAreaRef,
	};
};
