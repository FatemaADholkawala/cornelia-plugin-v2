"use client";

import { useState, useCallback, useEffect } from "react";
import { Party } from "@/types";
import { analysisApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useDocument } from "./useDocument";
import { HARDCODED_PARTIES } from "@/data/hardcodedData";
import { parseAPIResponse } from "@/utils/apiUtils";

// Toggle between API and hardcoded values
const USE_HARDCODED = false; // Set to true to use hardcoded values for testing

export const useParties = () => {
	const { documentContent } = useDocument();
	const { isAuthenticated } = useAuth();
	const [parties, setParties] = useState<any[]>([]);
	const [isLoadingParties, setIsLoadingParties] = useState<boolean>(false);
	const [selectedParty, setSelectedParty] = useState<any | null>(null);

	// Function to determine the tag color based on role
	const getTagColor = useCallback((role: any): string => {
		if (!role || typeof role !== "string") return "default";
		const roleLower = role.toLowerCase();
		const roleColors: Record<string, string> = {
			"first party": "blue",
			"second party/successful resolution applicant (sra)": "purple",
			"escrow bank": "green",
			"spv (special purpose vehicle)": "orange",
			"company/corporate debtor": "red",
		};

		return roleColors[roleLower] || "default";
	}, []);

	// Extract parties from document content when it updates
	useEffect(() => {
		const extractParties = async () => {
			if (!documentContent || !isAuthenticated) {
				setParties([]);
				setIsLoadingParties(false);
				return;
			}

			setIsLoadingParties(true);
			try {
				let parsedResult: any;

				if (USE_HARDCODED) {
					// Use hardcoded values for testing
					parsedResult = HARDCODED_PARTIES;
				} else {
					// Use API for production
					const result = await analysisApi.analyzeParties(documentContent);
					parsedResult = parseAPIResponse(result);
				}

				// Ensure parsedResult is properly handled
				if (!parsedResult) {
					console.warn("No parsed result received");
					//setParties([]);
					return;
				}

				const partiesArray = Array.isArray(parsedResult)
					? parsedResult
					: Array.isArray(parsedResult?.parties)
					? parsedResult.parties
					: [];

				const validParties = partiesArray
					.filter(
						(party: any) =>
							party && party.name && typeof party.name === "string"
					)
					.map((party: any) => ({
						name: String(party.name),
						role: party.role ? String(party.role) : "Unknown Role",
					}));

				setParties(validParties);
			} catch (error) {
				console.error("Error extracting parties:", error);
				setParties([]);
			} finally {
				setIsLoadingParties(false);
			}
		};

		extractParties();
	}, [documentContent, isAuthenticated]);

	// Manual function to load parties (for compatibility)
	// const loadParties = useCallback(
	// 	async (content: string) => {
	// 		if (!content || !isAuthenticated) {
	// 			//setParties([]);
	// 			setIsLoadingParties(false);
	// 			return;
	// 		}

	// 		setIsLoadingParties(true);
	// 		try {
	// 			const result = await analysisApi.analyzeParties(content);

	// 			// Parse the API response
	// 			let parsedResult: any;
	// 			if (typeof result === "string") {
	// 				try {
	// 					parsedResult = JSON.parse(result);
	// 				} catch {
	// 					parsedResult = { parties: [] };
	// 				}
	// 			} else {
	// 				parsedResult = result;
	// 			}

	// 			// Ensure parsedResult is properly handled
	// 			if (!parsedResult) {
	// 				console.warn("No parsed result received in loadParties");
	// 				//setParties([]);
	// 				return;
	// 			}

	// 			const partiesArray = Array.isArray(parsedResult)
	// 				? parsedResult
	// 				: Array.isArray(parsedResult?.parties)
	// 				? parsedResult.parties
	// 				: [];

	// 			const validParties = partiesArray
	// 				.filter(
	// 					(party: any) =>
	// 						party && party.name && typeof party.name === "string"
	// 				)
	// 				.map((party: any) => ({
	// 					name: String(party.name),
	// 					role: party.role ? String(party.role) : "Unknown Role",
	// 				}));

	// 			setParties(validParties);
	// 		} catch (error) {
	// 			console.error("Error extracting parties:", error);
	// 			setParties([]);
	// 		} finally {
	// 			setIsLoadingParties(false);
	// 		}
	// 	},
	// 	[isAuthenticated]
	// );

	return {
		parties,
		setParties,
		isLoadingParties,
		setIsLoadingParties,
		selectedParty,
		setSelectedParty,
		getTagColor,
	};
};
