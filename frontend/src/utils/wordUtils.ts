/**
 * Utility function to perform a sequential chunk search for text longer than 255 characters
 * This handles cases where the exact text exists in the document but is too long for a single search
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {string} searchText - The text to search for
 * @returns {Promise<{success: boolean, range: Word.Range|null}>} - Result object with success flag and range if found
 */
const performSequentialChunkSearch = async (
	context: Word.RequestContext,
	searchText: string
) => {
	try {
		console.log("Attempting sequential chunk search for text > 255 characters");

		// Split the text into chunks of ~200 characters (with some overlap for safety)
		const chunkSize = 200;
		const overlap = 50;
		const chunks: string[] = [];

		for (let i = 0; i < searchText.length; i += chunkSize - overlap) {
			const end = Math.min(i + chunkSize, searchText.length);
			chunks.push(searchText.substring(i, end));
			if (end === searchText.length) break;
		}

		console.log(
			`Split text into ${chunks.length} chunks for sequential search`
		);

		// Search for the first chunk
		const firstChunkResults = context.document.body.search(chunks[0]);
		context.load(firstChunkResults);
		await context.sync();

		if (firstChunkResults.items.length === 0) {
			console.log("First chunk not found in document");
			return { success: false, range: null };
		}

		// For each potential match of the first chunk, check if subsequent chunks follow
		for (let i = 0; i < firstChunkResults.items.length; i++) {
			const firstChunkRange = firstChunkResults.items[i].getRange();
			firstChunkRange.load("text");
			await context.sync();

			// Try to find the complete text starting from this first chunk
			const result = await validateAndExtendRange(
				context,
				firstChunkRange,
				chunks,
				searchText
			);
			if (result.success) {
				return result;
			}
		}

		// If we couldn't find a match with the first chunk, try with distinctive chunks
		// This helps when the document text has slight variations from our search text
		if (chunks.length >= 3) {
			// Try with the middle chunk which might be more distinctive
			const middleChunkIndex = Math.floor(chunks.length / 2);
			const middleChunkResults = context.document.body.search(
				chunks[middleChunkIndex]
			);
			context.load(middleChunkResults);
			await context.sync();

			if (middleChunkResults.items.length > 0) {
				for (let i = 0; i < middleChunkResults.items.length; i++) {
					const middleChunkRange = middleChunkResults.items[i].getRange();

					// Expand this range in both directions to try to capture the full text
					const expandedRange = middleChunkRange.expandBy(searchText.length);
					expandedRange.load("text");
					await context.sync();

					// Check if the expanded text contains our search text
					const expandedText = expandedRange.text;

					// Use string similarity to find the best match within the expanded text
					const bestMatchRange = await findBestMatchInRange(
						context,
						expandedRange,
						searchText
					);
					if (bestMatchRange) {
						console.log(
							"Found text using middle chunk and similarity matching"
						);
						return { success: true, range: bestMatchRange };
					}
				}
			}
		}

		console.log("Sequential chunk search did not find a complete match");
		return { success: false, range: null };
	} catch (error) {
		console.warn("Sequential chunk search failed:", error);
		return { success: false, range: null };
	}
};

/**
 * Helper function to validate and extend a range to include the complete text
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {Word.Range} initialRange - The initial range found for the first chunk
 * @param {string[]} chunks - Array of text chunks to search for
 * @param {string} fullSearchText - The complete text we're searching for
 * @returns {Promise<{success: boolean, range: Word.Range|null}>} - Result with success flag and range
 */
const validateAndExtendRange = async (
	context: Word.RequestContext,
	initialRange: Word.Range,
	chunks: string[],
	fullSearchText: string
) => {
	try {
		let currentRange = initialRange;
		let completeRange = initialRange;

		// Check each subsequent chunk
		for (let j = 1; j < chunks.length; j++) {
			// Expand the range to include more text
			// Use a larger expansion for later chunks to account for potential formatting differences
			const expansionSize = Math.min(300, chunks[j].length * 2);
			const expandedRange = currentRange.expandBy(expansionSize);
			expandedRange.load("text");
			await context.sync();

			// Check if this expanded range contains our next chunk
			const expandedText = expandedRange.text;
			const chunkIndex = expandedText.indexOf(chunks[j]);

			if (chunkIndex >= 0) {
				// Found the next chunk in sequence
				// Create a range that includes up to this chunk
				const nextChunkRange = expandedRange.getRange();
				nextChunkRange.moveStart(chunkIndex);
				nextChunkRange.moveEnd(
					chunkIndex + chunks[j].length - expandedText.length
				);

				// Expand our complete range to include this chunk
				completeRange.expandTo(nextChunkRange);
				currentRange = nextChunkRange;
			} else {
				// This chunk wasn't found in the expected location
				// Try a broader search around the current position
				const broaderRange = currentRange.expandBy(fullSearchText.length / 2);
				broaderRange.load("text");
				await context.sync();

				const broaderText = broaderRange.text;
				const broaderChunkIndex = broaderText.indexOf(chunks[j]);

				if (broaderChunkIndex >= 0) {
					// Found the chunk in the broader context
					const nextChunkRange = broaderRange.getRange();
					nextChunkRange.moveStart(broaderChunkIndex);
					nextChunkRange.moveEnd(
						broaderChunkIndex + chunks[j].length - broaderText.length
					);

					completeRange.expandTo(nextChunkRange);
					currentRange = nextChunkRange;
				} else {
					// Still couldn't find this chunk, the sequence doesn't match
					return { success: false, range: null };
				}
			}
		}

		// We found all chunks in sequence - validate the complete text
		completeRange.load("text");
		await context.sync();

		// Verify the found text is close enough to our original
		const foundText = completeRange.text;
		const cleanFoundText = foundText.replace(/\s+/g, " ").trim();

		// Calculate similarity (simple length comparison for now)
		const lengthRatio = cleanFoundText.length / fullSearchText.length;

		if (lengthRatio > 0.9 && lengthRatio < 1.1) {
			console.log("Sequential chunk search successful");
			return { success: true, range: completeRange };
		}

		// If length comparison fails, try a more detailed validation
		// Compare the first and last few words to ensure we have the right text
		const cleanSearchText = fullSearchText.replace(/\s+/g, " ").trim();
		const searchWords = cleanSearchText.split(" ");
		const foundWords = cleanFoundText.split(" ");

		const firstWordsMatch =
			searchWords.slice(0, 3).join(" ") === foundWords.slice(0, 3).join(" ");
		const lastWordsMatch =
			searchWords.slice(-3).join(" ") === foundWords.slice(-3).join(" ");

		if (firstWordsMatch && lastWordsMatch) {
			console.log("Sequential chunk search validated by word comparison");
			return { success: true, range: completeRange };
		}

		return { success: false, range: null };
	} catch (error) {
		console.warn("Error in validateAndExtendRange:", error);
		return { success: false, range: null };
	}
};

/**
 * Helper function to find the best match for a search text within a range
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {Word.Range} range - The range to search within
 * @param {string} searchText - The text to search for
 * @returns {Promise<Word.Range|null>} - The best matching range or null
 */
const findBestMatchInRange = async (
	context: Word.RequestContext,
	range: Word.Range,
	searchText: string
) => {
	try {
		const rangeText = range.text;
		const cleanSearchText = searchText.replace(/\s+/g, " ").trim();
		const cleanRangeText = rangeText.replace(/\s+/g, " ").trim();

		// Try to find the start of our search text
		const searchWords = cleanSearchText.split(" ");
		const firstFewWords = searchWords
			.slice(0, Math.min(5, searchWords.length))
			.join(" ");
		const lastFewWords = searchWords
			.slice(-Math.min(5, searchWords.length))
			.join(" ");

		const startIndex = cleanRangeText.indexOf(firstFewWords);
		const endIndex =
			cleanRangeText.lastIndexOf(lastFewWords) + lastFewWords.length;

		if (startIndex >= 0 && endIndex > startIndex) {
			// Create a range for this potential match
			const matchRange = range.getRange();
			matchRange.moveStart(startIndex);
			matchRange.moveEnd(endIndex - cleanRangeText.length);
			matchRange.load("text");
			await context.sync();

			return matchRange;
		}

		return null;
	} catch (error) {
		console.warn("Error in findBestMatchInRange:", error);
		return null;
	}
};

const searchAndReplaceText = async (
	context: Word.RequestContext,
	searchText: string,
	replacementText: string | null = null
) => {
	// Clean the search text - remove extra whitespace
	const cleanedText = searchText.replace(/\s+/g, " ").trim();

	// If text is shorter than 255 characters, do a simple search
	if (cleanedText.length <= 255) {
		const searchResults = context.document.body.search(cleanedText);
		context.load(searchResults);
		await context.sync();

		if (searchResults.items.length > 0) {
			if (replacementText) {
				searchResults.items[0].insertText(
					replacementText,
					Word.InsertLocation.replace
				);
				await context.sync();
			}
			return searchResults.items[0];
		}
		return null;
	}

	// For longer texts, try the sequential chunk search first
	const sequentialSearchResult = await performSequentialChunkSearch(
		context,
		cleanedText
	);
	if (sequentialSearchResult.success) {
		// Replace the text if needed
		if (replacementText) {
			sequentialSearchResult.range!.insertText(
				replacementText,
				Word.InsertLocation.replace
			);
			await context.sync();
			console.log("Replaced text using sequential chunk search");
		}
		return sequentialSearchResult.range;
	}

	// Fallback to the original chunking method if sequential search fails
	console.log("Falling back to original chunking method");

	// Split search text into chunks of 255 characters
	const fallbackChunks = cleanedText.match(/.{1,255}/g) || [];
	let firstChunkRange: Word.Range | null = null;

	// Find and store the position of the first chunk
	const firstChunkResults = context.document.body.search(fallbackChunks[0]);
	context.load(firstChunkResults);
	await context.sync();

	if (firstChunkResults.items.length > 0) {
		firstChunkRange = firstChunkResults.items[0].getRange();
	} else {
		return null; // Can't find even the first chunk
	}

	// Delete all chunks from last to first (to maintain positions)
	for (let i = fallbackChunks.length - 1; i >= 0; i--) {
		const chunk = fallbackChunks[i];
		const searchResults = context.document.body.search(chunk);
		context.load(searchResults);
		await context.sync();

		for (let j = 0; j < searchResults.items.length; j++) {
			searchResults.items[j].insertText("", Word.InsertLocation.replace); // Delete the chunk
		}
		await context.sync();
	}

	// Insert new text at the position of the first chunk
	if (replacementText) {
		firstChunkRange.insertText(replacementText, Word.InsertLocation.replace);
		await context.sync();
	}

	return firstChunkRange;
};

/**
 * Advanced search function for finding clauses in Word documents
 * Handles multi-line text and formatting issues by using a progressive search strategy
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {string} clauseText - The full text of the clause to find
 * @returns {Promise<Word.Range|null>} - The found range or null if not found
 */
const findClauseInDocument = async (
	context: Word.RequestContext,
	clauseText: string
) => {
	// Clean the clause text - remove extra whitespace
	const cleanedText = clauseText.replace(/\s+/g, " ").trim();

	// First try: Search for the entire text if it's not too long
	// Word has a limit of 255 characters for search
	if (cleanedText.length <= 255) {
		try {
			const fullTextResults = context.document.body.search(cleanedText);
			context.load(fullTextResults);
			await context.sync();

			if (fullTextResults.items.length > 0) {
				console.log("Found clause using full text search");
				return fullTextResults.items[0];
			}
		} catch (error) {
			// If full text search fails, continue with chunking strategies
			console.warn(
				"Full text search failed, falling back to chunking strategies:",
				error
			);
		}
	} else {
		// For text > 255 characters, try sequential chunk search first
		const sequentialSearchResult = await performSequentialChunkSearch(
			context,
			cleanedText
		);
		if (sequentialSearchResult.success) {
			return sequentialSearchResult.range;
		}
	}

	// Break into words for more reliable searching
	const words = cleanedText.split(" ");

	// Try different search strategies in order of preference

	// Strategy 1: Try first 6-8 words (usually most distinctive)
	if (words.length >= 6) {
		const firstChunkSize = Math.min(8, words.length);
		const firstChunk = words.slice(0, firstChunkSize).join(" ");

		const results1 = context.document.body.search(firstChunk);
		context.load(results1);
		await context.sync();

		if (results1.items.length > 0) {
			console.log("Found clause using first chunk strategy");
			return results1.items[0];
		}
	}

	// Strategy 2: Try with a distinctive middle chunk
	if (words.length >= 10) {
		const midPoint = Math.floor(words.length / 2);
		const midChunk = words.slice(midPoint - 3, midPoint + 3).join(" ");

		const results2 = context.document.body.search(midChunk);
		context.load(results2);
		await context.sync();

		if (results2.items.length > 0) {
			console.log("Found clause using middle chunk strategy");
			return results2.items[0];
		}
	}

	// Strategy 3: Try with the first sentence if it's reasonably long
	const firstSentenceMatch = cleanedText.match(/^[^.!?]+[.!?]/);
	if (
		firstSentenceMatch &&
		firstSentenceMatch[0].length > 20 &&
		firstSentenceMatch[0].length < 200
	) {
		const firstSentence = firstSentenceMatch[0];

		const results3 = context.document.body.search(firstSentence);
		context.load(results3);
		await context.sync();

		if (results3.items.length > 0) {
			console.log("Found clause using first sentence strategy");
			return results3.items[0];
		}
	}

	// Strategy 4: Last resort - try with just the first 4 words
	if (words.length >= 4) {
		const fallbackChunk = words.slice(0, 4).join(" ");

		const results4 = context.document.body.search(fallbackChunk);
		context.load(results4);
		await context.sync();

		if (results4.items.length > 0) {
			console.log("Found clause using fallback strategy (first 4 words)");
			return results4.items[0];
		}
	}

	// If all strategies fail, return null
	console.warn("All search strategies failed for clause text");
	return null;
};

/**
 * Advanced function to find and replace an entire clause in a Word document
 * This handles cases where we can only find a portion of the text due to formatting
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {string} clauseText - The full text of the clause to find
 * @param {string} replacementText - The text to replace the clause with
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
const findAndReplaceClause = async (
	context: Word.RequestContext,
	clauseText: string,
	replacementText: string
) => {
	try {
		// Clean the clause text for comparison
		const cleanClauseText = clauseText.replace(/\s+/g, " ").trim();

		// First try: Search for the entire text if it's not too long
		// Word has a limit of 255 characters for search
		if (cleanClauseText.length <= 255) {
			try {
				const fullTextResults = context.document.body.search(cleanClauseText);
				context.load(fullTextResults);
				await context.sync();

				if (fullTextResults.items.length > 0) {
					// Found the exact text, replace it directly
					fullTextResults.items[0].insertText(
						replacementText,
						Word.InsertLocation.replace
					);
					await context.sync();
					console.log("Replaced clause using full text search");
					return true;
				}
			} catch (error) {
				// If full text search fails, continue with other strategies
				console.warn(
					"Full text replacement failed, trying alternative strategies:",
					error
				);
			}
		} else {
			// For text > 255 characters, use our enhanced sequential chunk search
			console.log(
				"Text exceeds 255 characters, using enhanced sequential chunk search"
			);

			// Try to find the text using our sequential chunk search
			const sequentialSearchResult = await performSequentialChunkSearch(
				context,
				cleanClauseText
			);
			if (sequentialSearchResult.success) {
				// Replace the text
				sequentialSearchResult.range!.insertText(
					replacementText,
					Word.InsertLocation.replace
				);
				await context.sync();
				console.log("Replaced clause using sequential chunk search");
				return true;
			}

			// If sequential search fails, try with distinctive parts of the text
			console.log("Sequential search failed, trying with distinctive parts");

			// Try with the beginning of the text (first 200 chars)
			const beginningText = cleanClauseText.substring(
				0,
				Math.min(200, cleanClauseText.length)
			);
			const beginningResults = context.document.body.search(beginningText);
			context.load(beginningResults);
			await context.sync();

			if (beginningResults.items.length > 0) {
				// Found the beginning, now try to extend to find the full text
				for (let i = 0; i < Math.min(3, beginningResults.items.length); i++) {
					const beginRange = beginningResults.items[i].getRange();

					// Try to extend this range to include the full text
					const extendedResult = await extendRangeToFullText(
						context,
						beginRange,
						cleanClauseText
					);
					if (extendedResult.success) {
						// Replace the text
						extendedResult.range!.insertText(
							replacementText,
							Word.InsertLocation.replace
						);
						await context.sync();
						console.log("Replaced clause using beginning text + extension");
						return true;
					}
				}
			}

			// Try with the end of the text (last 200 chars)
			const endText = cleanClauseText.substring(
				Math.max(0, cleanClauseText.length - 200),
				cleanClauseText.length
			);
			const endResults = context.document.body.search(endText);
			context.load(endResults);
			await context.sync();

			if (endResults.items.length > 0) {
				// Found the end, now try to extend backward to find the full text
				for (let i = 0; i < Math.min(3, endResults.items.length); i++) {
					const endRange = endResults.items[i].getRange();

					// Try to extend this range backward to include the full text
					const extendedResult = await extendRangeBackwardToFullText(
						context,
						endRange,
						cleanClauseText
					);
					if (extendedResult.success) {
						// Replace the text
						extendedResult.range!.insertText(
							replacementText,
							Word.InsertLocation.replace
						);
						await context.sync();
						console.log("Replaced clause using end text + backward extension");
						return true;
					}
				}
			}
		}

		// If the above strategies fail, fall back to our existing approach
		const foundRange = await findClauseInDocument(context, clauseText);

		if (!foundRange) {
			console.warn("Could not find clause text for replacement");
			return false;
		}

		// Get the paragraph containing our found text
		const paragraph = foundRange.paragraphs.getFirst();
		paragraph.load("text");
		await context.sync();

		// If the paragraph text is very short compared to the clause,
		// we need to expand our selection to include nearby paragraphs
		if (paragraph.text.length < cleanClauseText.length * 0.7) {
			console.log(
				"Found text is much shorter than clause, expanding selection"
			);

			// Get the parent content control or section
			const parentRange = paragraph.parentContentControl
				? paragraph.parentContentControl.getRange()
				: paragraph.parentBody.getRange();

			// Load the paragraphs in this range
			const paragraphs = parentRange.paragraphs;
			paragraphs.load("items");
			await context.sync();

			// Find the index of our paragraph
			let paragraphIndex = -1;
			for (let i = 0; i < paragraphs.items.length; i++) {
				if (paragraphs.items[i].text === paragraph.text) {
					paragraphIndex = i;
					break;
				}
			}

			if (paragraphIndex >= 0) {
				// Look at paragraphs before and after to find the full clause
				const maxParagraphsToCheck = 5; // Limit how far we look
				let startIndex = Math.max(0, paragraphIndex - maxParagraphsToCheck);
				let endIndex = Math.min(
					paragraphs.items.length - 1,
					paragraphIndex + maxParagraphsToCheck
				);

				// Create a range that spans these paragraphs
				const expandedRange = paragraphs.items[startIndex].getRange();
				expandedRange.expandTo(paragraphs.items[endIndex].getRange());
				expandedRange.load("text");
				await context.sync();

				// Now we have a larger context to work with
				const expandedText = expandedRange.text;

				// Try to find the best match for our clause within this expanded text
				const cleanExpandedText = expandedText.replace(/\s+/g, " ").trim();

				// Find the position of our found text within the expanded text
				let bestMatchStart = expandedText.indexOf(paragraph.text);
				let bestMatchEnd = bestMatchStart + paragraph.text.length;

				if (bestMatchStart >= 0) {
					// Expand backward to include more of the clause
					for (let i = bestMatchStart; i > 0; i--) {
						const currentSubstring = expandedText.substring(i, bestMatchEnd);
						const cleanCurrentSubstring = currentSubstring
							.replace(/\s+/g, " ")
							.trim();

						if (cleanClauseText.includes(cleanCurrentSubstring)) {
							bestMatchStart = i;
						} else {
							// Stop if adding more text doesn't improve the match
							break;
						}
					}

					// Expand forward to include more of the clause
					for (let i = bestMatchEnd; i < expandedText.length; i++) {
						const currentSubstring = expandedText.substring(bestMatchStart, i);
						const cleanCurrentSubstring = currentSubstring
							.replace(/\s+/g, " ")
							.trim();

						if (cleanClauseText.includes(cleanCurrentSubstring)) {
							bestMatchEnd = i;
						} else {
							// Stop if adding more text doesn't improve the match
							break;
						}
					}

					// Create a range for our best match
					const bestMatchRange = expandedRange.getRange();
					bestMatchRange.moveStart(bestMatchStart);
					bestMatchRange.moveEnd(bestMatchEnd - expandedText.length);
					bestMatchRange.load("text");
					await context.sync();

					console.log("Expanded selection for replacement:", {
						originalLength: paragraph.text.length,
						expandedLength: bestMatchRange.text.length,
						clauseLength: cleanClauseText.length,
					});

					// Replace the text
					bestMatchRange.insertText(
						replacementText,
						Word.InsertLocation.replace
					);
					await context.sync();
					return true;
				}
			}
		}

		// If we couldn't expand the selection or didn't need to, just replace the found text
		console.log("Using direct replacement for clause");
		foundRange.insertText(replacementText, Word.InsertLocation.replace);
		await context.sync();
		return true;
	} catch (error) {
		console.error("Error in findAndReplaceClause:", error);
		return false;
	}
};

/**
 * Helper function to extend a range forward to include the full text
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {Word.Range} initialRange - The initial range found
 * @param {string} fullText - The complete text we're searching for
 * @returns {Promise<{success: boolean, range: Word.Range|null}>} - Result with success flag and range
 */
const extendRangeToFullText = async (
	context: Word.RequestContext,
	initialRange: Word.Range,
	fullText: string
) => {
	try {
		// Get the text of the initial range
		initialRange.load("text");
		await context.sync();
		const initialText = initialRange.text;

		// Find where in the full text this initial text appears
		const cleanInitialText = initialText.replace(/\s+/g, " ").trim();
		const cleanFullText = fullText.replace(/\s+/g, " ").trim();

		const initialTextIndex = cleanFullText.indexOf(cleanInitialText);
		if (initialTextIndex < 0) {
			return { success: false, range: null };
		}

		// Calculate how much more text we need to include
		const remainingTextLength =
			cleanFullText.length - initialTextIndex - cleanInitialText.length;
		if (remainingTextLength <= 0) {
			// The initial text is already the full text
			return { success: true, range: initialRange };
		}

		// Expand the range to include more text
		const expandedRange = initialRange.expandBy(remainingTextLength * 1.5); // Add some buffer
		expandedRange.load("text");
		await context.sync();

		// Get the expanded text
		const expandedText = expandedRange.text;
		const cleanExpandedText = expandedText.replace(/\s+/g, " ").trim();

		// Find where the initial text appears in the expanded text
		const initialInExpandedIndex = cleanExpandedText.indexOf(cleanInitialText);
		if (initialInExpandedIndex < 0) {
			return { success: false, range: null };
		}

		// Try to find the end of the full text
		const fullTextAfterInitial = cleanFullText.substring(
			initialTextIndex + cleanInitialText.length
		);
		if (fullTextAfterInitial.length === 0) {
			return { success: true, range: initialRange };
		}

		// Look for the last few words of the full text
		const lastWords = fullTextAfterInitial.split(" ").slice(-5).join(" ");
		const lastWordsIndex = cleanExpandedText.indexOf(
			lastWords,
			initialInExpandedIndex + cleanInitialText.length
		);

		if (lastWordsIndex >= 0) {
			// Create a range that includes from the initial text to the end of the full text
			const fullTextRange = expandedRange.getRange();
			fullTextRange.moveStart(initialInExpandedIndex);
			fullTextRange.moveEnd(
				lastWordsIndex + lastWords.length - cleanExpandedText.length
			);
			fullTextRange.load("text");
			await context.sync();

			// Verify this range is close to our full text
			const rangeText = fullTextRange.text;
			const cleanRangeText = rangeText.replace(/\s+/g, " ").trim();

			// Simple length comparison
			const lengthRatio = cleanRangeText.length / cleanFullText.length;
			if (lengthRatio > 0.9 && lengthRatio < 1.1) {
				return { success: true, range: fullTextRange };
			}
		}

		return { success: false, range: null };
	} catch (error) {
		console.warn("Error in extendRangeToFullText:", error);
		return { success: false, range: null };
	}
};

/**
 * Helper function to extend a range backward to include the full text
 *
 * @param {Word.RequestContext} context - The Word RequestContext
 * @param {Word.Range} endRange - The range containing the end of the text
 * @param {string} fullText - The complete text we're searching for
 * @returns {Promise<{success: boolean, range: Word.Range|null}>} - Result with success flag and range
 */
const extendRangeBackwardToFullText = async (
	context: Word.RequestContext,
	endRange: Word.Range,
	fullText: string
) => {
	try {
		// Get the text of the end range
		endRange.load("text");
		await context.sync();
		const endText = endRange.text;

		// Find where in the full text this end text appears
		const cleanEndText = endText.replace(/\s+/g, " ").trim();
		const cleanFullText = fullText.replace(/\s+/g, " ").trim();

		const endTextIndex = cleanFullText.lastIndexOf(cleanEndText);
		if (endTextIndex < 0) {
			return { success: false, range: null };
		}

		// Calculate how much more text we need to include
		if (endTextIndex === 0) {
			// The end text is already the full text
			return { success: true, range: endRange };
		}

		// Expand the range to include more text before it
		const expandedRange = endRange.expandBy(cleanFullText.length * 1.5); // Add some buffer
		expandedRange.load("text");
		await context.sync();

		// Get the expanded text
		const expandedText = expandedRange.text;
		const cleanExpandedText = expandedText.replace(/\s+/g, " ").trim();

		// Find where the end text appears in the expanded text
		const endInExpandedIndex = cleanExpandedText.lastIndexOf(cleanEndText);
		if (endInExpandedIndex < 0) {
			return { success: false, range: null };
		}

		// Try to find the beginning of the full text
		const fullTextBeforeEnd = cleanFullText.substring(0, endTextIndex);
		if (fullTextBeforeEnd.length === 0) {
			return { success: true, range: endRange };
		}

		// Look for the first few words of the full text
		const firstWords = fullTextBeforeEnd.split(" ").slice(0, 5).join(" ");
		const firstWordsIndex = cleanExpandedText.indexOf(firstWords);

		if (firstWordsIndex >= 0 && firstWordsIndex < endInExpandedIndex) {
			// Create a range that includes from the beginning of the full text to the end text
			const fullTextRange = expandedRange.getRange();
			fullTextRange.moveStart(firstWordsIndex);
			fullTextRange.moveEnd(
				endInExpandedIndex + cleanEndText.length - cleanExpandedText.length
			);
			fullTextRange.load("text");
			await context.sync();

			// Verify this range is close to our full text
			const rangeText = fullTextRange.text;
			const cleanRangeText = rangeText.replace(/\s+/g, " ").trim();

			// Simple length comparison
			const lengthRatio = cleanRangeText.length / cleanFullText.length;
			if (lengthRatio > 0.9 && lengthRatio < 1.1) {
				return { success: true, range: fullTextRange };
			}
		}

		return { success: false, range: null };
	} catch (error) {
		console.warn("Error in extendRangeBackwardToFullText:", error);
		return { success: false, range: null };
	}
};

// Export utility functions
export {
	searchAndReplaceText,
	findAndReplaceClause,
	findClauseInDocument,
	performSequentialChunkSearch,
};
