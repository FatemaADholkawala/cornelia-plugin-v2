export const parseAPIResponse = (result: any): any => {
	if (!result) {
		throw new Error("Empty result received");
	}

	// If already an object, return as is
	if (typeof result === "object") return result;

	if (typeof result === "string") {
		try {
			// Strategy 1: Direct JSON parse
			try {
				const parsed = JSON.parse(result);
				console.debug("Direct JSON parse successful");
				return parsed;
			} catch (e) {
				console.debug("Direct JSON parse failed:", (e as Error).message);
			}

			// Strategy 2: Clean and parse markdown code block
			if (result.startsWith("```json")) {
				// Remove ```json from start
				let cleanJson = result.replace(/^```json\n/, "");

				// Find the last complete closing brace
				const lastCompleteBrace = cleanJson.lastIndexOf("}");
				if (lastCompleteBrace !== -1) {
					// Take only up to the last complete JSON object
					cleanJson = cleanJson.substring(0, lastCompleteBrace + 1);

					try {
						const parsed = JSON.parse(cleanJson);
						console.debug("Cleaned markdown JSON parse successful");
						return parsed;
					} catch (e) {
						console.debug(
							"Cleaned markdown JSON parse failed:",
							(e as Error).message
						);
					}
				}
			}

			// Strategy 3: Find first { and last complete }
			const firstBrace = result.indexOf("{");
			if (firstBrace !== -1) {
				const jsonSubstring = result.substring(firstBrace);
				const lastCompleteBrace = jsonSubstring.lastIndexOf("}");
				if (lastCompleteBrace !== -1) {
					const jsonString = jsonSubstring.substring(0, lastCompleteBrace + 1);
					try {
						const parsed = JSON.parse(jsonString);
						console.debug("Braces JSON parse successful");
						return parsed;
					} catch (e) {
						console.debug("Braces JSON parse failed:", (e as Error).message);
					}
				}
			}

			throw new Error("Could not parse response in any known format");
		} catch (error) {
			console.error("All parsing strategies failed:", {
				errorMessage: (error as Error).message,
				resultPreview: result.substring(0, 200),
				resultLength: result.length,
				// Log the cleaned version for debugging
				cleanedPreview: result.replace(/^```json\n/, "").substring(0, 200),
			});
			throw error;
		}
	}

	throw new Error(`Unexpected response type: ${typeof result}`);
};

