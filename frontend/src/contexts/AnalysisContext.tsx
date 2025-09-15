"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { AnalysisContextType, Conflict } from "@/types";

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export const useAnalysis = (): AnalysisContextType => {
	const context = useContext(AnalysisContext);
	if (!context) {
		throw new Error("useAnalysis must be used within an AnalysisProvider");
	}
	return context;
};

interface AnalysisProviderProps {
	children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({
	children,
}) => {
	// Contextual Intelligence State
	const [contextualIntelligence, setContextualIntelligence] = useState({
		isPatternDetected: false,
		isAnalyzing: true,
		hasStarted: false,
	});

	// Non-Compete Detection State
	const [nonCompeteDetection, setNonCompeteDetection] = useState({
		detectionPhase: "scanning" as "scanning" | "analyzing" | "detected",
		detectedConflicts: [] as Conflict[],
		hasStarted: false,
	});

	// Start Contextual Intelligence Analysis - run only once on mount
	useEffect(() => {
		setContextualIntelligence((prev) => ({ ...prev, hasStarted: true }));

		// After 17 seconds (15-20 range), show the pattern detected alert
		const timer = setTimeout(() => {
			setContextualIntelligence((prev) => ({
				...prev,
				isAnalyzing: false,
				isPatternDetected: true,
			}));
		}, 17000); // 17 seconds

		return () => clearTimeout(timer);
	}, []); // Empty dependency array - run only once

	// Start Non-Compete Detection Analysis - run only once on mount
	useEffect(() => {
		setNonCompeteDetection((prev) => ({ ...prev, hasStarted: true }));

		// Phase 1: Scanning (first 8 seconds)
		const phase1Timer = setTimeout(() => {
			setNonCompeteDetection((prev) => ({
				...prev,
				detectionPhase: "analyzing",
			}));
		}, 8000);

		// Phase 2: Analysis complete (after 15 seconds total)
		const phase2Timer = setTimeout(() => {
			setNonCompeteDetection((prev) => ({
				...prev,
				detectionPhase: "detected",
				detectedConflicts: [
					{
						company: "TechVenture Inc.",
						riskLevel: "high",
						conflictType: "Direct Competitor",
						details: "Technology consulting services overlap",
					},
					{
						company: "DataFlow Solutions",
						riskLevel: "medium",
						conflictType: "Client Overlap",
						details: "Shared client base in financial sector",
					},
				],
			}));
		}, 15000);

		return () => {
			clearTimeout(phase1Timer);
			clearTimeout(phase2Timer);
		};
	}, []); // Empty dependency array - run only once

	const value: AnalysisContextType = {
		contextualIntelligence,
		nonCompeteDetection,
		setContextualIntelligence,
		setNonCompeteDetection,
	};

	return (
		<AnalysisContext.Provider value={value}>
			{children}
		</AnalysisContext.Provider>
	);
};
