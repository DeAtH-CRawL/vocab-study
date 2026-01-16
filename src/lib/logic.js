/**
 * Normalize a string for comparison by removing special characters and converting to lowercase.
 * Used for consistent quiz answer validation across the application.
 * 
 * @param {string} str - The string to normalize
 * @returns {string} Normalized string containing only lowercase alphanumeric characters
 */
export const normalize = (str) => {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/[—\-\']/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

/**
 * Calculate Levenshtein distance between two strings.
 * This is a dynamic programming implementation that computes the minimum number of 
 * single-character edits (insertions, deletions, or substitutions) required to 
 * change one string into another.
 * 
 * ALGORITHM CORRECTNESS GUARANTEES:
 * - Matrix dimensions: (b.length + 1) x (a.length + 1)
 * - Base cases: matrix[0][j] = j for all j, matrix[i][0] = i for all i
 * - Recurrence relation: matrix[i][j] = min(
 *      matrix[i-1][j] + 1,      // deletion
 *      matrix[i][j-1] + 1,      // insertion
 *      matrix[i-1][j-1] + cost  // substitution (cost=0 if chars match, 1 otherwise)
 *   )
 * - Result: matrix[b.length][a.length] contains the final distance
 * 
 * TIME COMPLEXITY: O(m * n) where m = a.length, n = b.length
 * SPACE COMPLEXITY: O(m * n)
 * 
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} The Levenshtein distance (minimum edits required)
 */
export const getLevenshteinDistance = (a, b) => {
    if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);

    // Initialize matrix with base cases
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    // Fill matrix using dynamic programming
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Calculate proportional similarity between two strings (0-100%).
 * Uses Levenshtein distance normalized by the length of the longer string.
 * This provides a better grading metric than absolute distance thresholds.
 * 
 * RATIONALE: Absolute distance thresholds (e.g., "dist <= 2") are unfair because:
 * - "cat" vs "car" (dist=1) should be ~66% similar
 * - "extraordinary" vs "extraordiary" (dist=1) should be ~92% similar
 * Proportional similarity handles both cases fairly.
 * 
 * @param {string} str1 - First string (typically expected answer)
 * @param {string} str2 - Second string (typically user's answer)
 * @returns {number} Similarity percentage (0-100)
 */
export const getSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 100;

    const distance = getLevenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    // Similarity = 1 - (distance / maxLength)
    const similarity = ((maxLength - distance) / maxLength) * 100;
    return Math.max(0, Math.min(100, similarity));
};
