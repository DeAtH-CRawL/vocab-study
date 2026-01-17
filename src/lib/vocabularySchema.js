/**
 * Vocabulary Schema Validation
 * 
 * Provides comprehensive validation for vocabulary data structure.
 * Enforces: 12 words + 3 idioms per day, unique IDs, no duplicate terms.
 * 
 * Development: Fails loudly with detailed errors
 * Production: Logs warnings, returns partial valid data
 */

const SCHEMA_VERSION = 1;
const REQUIRED_WORDS_PER_DAY = 12;
const REQUIRED_IDIOMS_PER_DAY = 3;
const REQUIRED_ITEMS_PER_DAY = REQUIRED_WORDS_PER_DAY + REQUIRED_IDIOMS_PER_DAY;

/**
 * Validate a single vocabulary item
 * @param {Object} item - The item to validate
 * @param {string} dayContext - Context for error messages
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateItem(item, dayContext) {
    const errors = [];

    if (!item) {
        errors.push(`${dayContext}: Item is null or undefined`);
        return { valid: false, errors };
    }

    if (!item.id || typeof item.id !== 'string') {
        errors.push(`${dayContext}: Missing or invalid id`);
    }

    if (!item.term || typeof item.term !== 'string' || item.term.trim() === '') {
        errors.push(`${dayContext}: Missing or empty term`);
    }

    if (!item.definition || typeof item.definition !== 'string' || item.definition.trim() === '') {
        errors.push(`${dayContext}: Missing or empty definition for "${item.term || 'unknown'}"`);
    }

    if (!item.type || !['Word', 'Idiom'].includes(item.type)) {
        errors.push(`${dayContext}: Invalid type "${item.type}" for "${item.term || 'unknown'}". Must be "Word" or "Idiom"`);
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validate a single day
 * @param {Object} day - The day object to validate
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
function validateDay(day) {
    const errors = [];
    const warnings = [];
    const dayContext = `Day ${day?.dayNumber || 'unknown'}`;

    if (!day) {
        errors.push('Day object is null or undefined');
        return { valid: false, errors, warnings };
    }

    if (typeof day.dayNumber !== 'number' || day.dayNumber < 1) {
        errors.push(`${dayContext}: dayNumber must be a positive integer`);
    }

    if (!day.createdAt || typeof day.createdAt !== 'string') {
        warnings.push(`${dayContext}: Missing createdAt date`);
    }

    if (!Array.isArray(day.items)) {
        errors.push(`${dayContext}: items must be an array`);
        return { valid: false, errors, warnings };
    }

    // Validate each item
    for (const item of day.items) {
        const itemResult = validateItem(item, dayContext);
        errors.push(...itemResult.errors);
    }

    // Count words and idioms
    const words = day.items.filter(i => i?.type === 'Word');
    const idioms = day.items.filter(i => i?.type === 'Idiom');

    if (words.length !== REQUIRED_WORDS_PER_DAY) {
        const msg = `${dayContext}: Expected ${REQUIRED_WORDS_PER_DAY} words, got ${words.length}`;
        if (process.env.NODE_ENV === 'development') {
            errors.push(msg);
        } else {
            warnings.push(msg);
        }
    }

    if (idioms.length !== REQUIRED_IDIOMS_PER_DAY) {
        const msg = `${dayContext}: Expected ${REQUIRED_IDIOMS_PER_DAY} idioms, got ${idioms.length}`;
        if (process.env.NODE_ENV === 'development') {
            errors.push(msg);
        } else {
            warnings.push(msg);
        }
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate entire vocabulary data structure
 * @param {Object} data - The vocabulary data object
 * @returns {{ valid: boolean, errors: string[], warnings: string[], stats: Object }}
 */
export function validateVocabularyData(data) {
    const errors = [];
    const warnings = [];
    const allTerms = new Set();
    const allIds = new Set();
    const seenDayNumbers = new Set();

    // Schema version check
    if (!data || typeof data !== 'object') {
        errors.push('Vocabulary data must be an object');
        return { valid: false, errors, warnings, stats: null };
    }

    if (data.version !== SCHEMA_VERSION) {
        errors.push(`Invalid schema version: ${data.version}. Expected: ${SCHEMA_VERSION}`);
    }

    if (!data.lastUpdated) {
        warnings.push('Missing lastUpdated field');
    }

    if (!Array.isArray(data.days)) {
        errors.push('Days must be an array');
        return { valid: false, errors, warnings, stats: null };
    }

    if (data.days.length === 0) {
        errors.push('Days array is empty');
        return { valid: false, errors, warnings, stats: null };
    }

    let totalWords = 0;
    let totalIdioms = 0;

    // Validate each day
    for (const day of data.days) {
        // Check for duplicate day numbers
        if (seenDayNumbers.has(day?.dayNumber)) {
            errors.push(`Duplicate dayNumber: ${day.dayNumber}`);
        }
        seenDayNumbers.add(day?.dayNumber);

        const dayResult = validateDay(day);
        errors.push(...dayResult.errors);
        warnings.push(...dayResult.warnings);

        // Check for global duplicates
        if (Array.isArray(day?.items)) {
            for (const item of day.items) {
                if (!item) continue;

                // Check duplicate IDs
                if (item.id && allIds.has(item.id)) {
                    errors.push(`Duplicate ID: "${item.id}" in Day ${day.dayNumber}`);
                }
                allIds.add(item.id);

                // Check duplicate terms (case-insensitive)
                const normalizedTerm = item.term?.toLowerCase().trim();
                if (normalizedTerm && allTerms.has(normalizedTerm)) {
                    const msg = `Duplicate term: "${item.term}" in Day ${day.dayNumber}`;
                    if (process.env.NODE_ENV === 'development') {
                        errors.push(msg);
                    } else {
                        warnings.push(msg);
                    }
                }
                allTerms.add(normalizedTerm);

                // Count types
                if (item.type === 'Word') totalWords++;
                if (item.type === 'Idiom') totalIdioms++;
            }
        }
    }

    const stats = {
        totalDays: data.days.length,
        totalWords,
        totalIdioms,
        totalItems: totalWords + totalIdioms
    };

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        stats
    };
}

/**
 * Transform new schema to legacy format for backward compatibility
 * Converts { days: [...] } to { "Day 1": [...], "Day 2": [...] }
 * @param {Object} data - New schema data
 * @returns {Object} Legacy format vocabulary object
 */
export function transformToLegacyFormat(data) {
    if (!data?.days || !Array.isArray(data.days)) {
        return {};
    }

    const legacy = {};

    // Sort days by dayNumber for consistent ordering
    const sortedDays = [...data.days].sort((a, b) => a.dayNumber - b.dayNumber);

    for (const day of sortedDays) {
        const dayKey = `Day ${day.dayNumber}`;

        // Transform items to legacy format (just remove 'id' field for compatibility)
        legacy[dayKey] = day.items.map(item => ({
            term: item.term,
            definition: item.definition,
            type: item.type,
            // Preserve id for future use
            id: item.id
        }));
    }

    return legacy;
}

/**
 * Log validation results to console with appropriate severity
 * @param {{ valid: boolean, errors: string[], warnings: string[], stats: Object }} result 
 */
export function logValidationResult(result) {
    if (result.errors.length > 0) {
        console.error('Vocabulary validation errors:');
        result.errors.forEach(e => console.error(`  ❌ ${e}`));
    }

    if (result.warnings.length > 0) {
        console.warn('Vocabulary validation warnings:');
        result.warnings.forEach(w => console.warn(`  ⚠️ ${w}`));
    }

    if (result.valid && result.stats) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`Vocabulary loaded: ${result.stats.totalDays} days, ${result.stats.totalItems} items`);
        }
    }
}
