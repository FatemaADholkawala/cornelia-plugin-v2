"use client";

import { useState, useCallback } from "react";
import { Party } from "@/types";
import { analysisApi } from "@/services/api";

export const useParties = () => {
	const [parties, setParties] = useState<Party[]>([]);
	const [isLoadingParties, setIsLoadingParties] = useState<boolean>(false);
	const [selectedParty, setSelectedParty] = useState<Party | null>(null);

	const loadParties = useCallback(
		async (documentContent: string): Promise<void> => {
			if (!documentContent) return;

			setIsLoadingParties(true);
			try {
				const partiesData = await analysisApi.analyzeParties(documentContent);
				setParties(partiesData || []);
			} catch (error) {
				console.error("Error loading parties:", error);
				setParties([]);
			} finally {
				setIsLoadingParties(false);
			}
		},
		[]
	);

	const getTagColor = useCallback((role: string): string => {
		const colorMap: Record<string, string> = {
			"Service Provider": "blue",
			Client: "green",
			"Legal Counsel": "purple",
			Vendor: "orange",
			Contractor: "cyan",
			Partner: "magenta",
		};
		return colorMap[role] || "default";
	}, []);

	const selectParty = useCallback((party: Party | null): void => {
		setSelectedParty(party);
	}, []);

	const clearParties = useCallback((): void => {
		setParties([]);
		setSelectedParty(null);
	}, []);

	return {
		parties,
		setParties,
		isLoadingParties,
		setIsLoadingParties,
		selectedParty,
		setSelectedParty,
		loadParties,
		getTagColor,
		selectParty,
		clearParties,
	};
};
