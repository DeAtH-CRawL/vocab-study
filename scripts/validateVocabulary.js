#!/usr/bin/env node

/**
 * Vocabulary Data Validation Script
 * 
 * Run with: node scripts/validateVocabulary.js
 * Or: npm run validate:vocab
 * 
 * Validates public/data/vocabulary.json against the schema.
 * Fails with exit code 1 if validation errors are found.
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 1;
const REQUIRED_WORDS_PER_DAY = 12;
const REQUIRED_IDIOMS_PER_DAY = 3;

function validateVocabularyFile() {
    const filePath = path.join(__dirname, '..', 'public', 'data', 'vocabulary.json');

    console.log('🔍 Validating vocabulary data...\n');
    console.log(`📁 File: ${filePath}\n`);

    // Check file exists
    if (!fs.existsSync(filePath)) {
        console.error('❌ Error: vocabulary.json not found');
        process.exit(1);
    }

    // Read and parse JSON
    let data;
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error: Failed to parse JSON - ${error.message}`);
        process.exit(1);
    }

    const errors = [];
    const warnings = [];
    const allTerms = new Map(); // term -> day for duplicate tracking
    const allIds = new Set();
    const seenDayNumbers = new Set();

    // Schema version check
    if (data.version !== SCHEMA_VERSION) {
        errors.push(`Invalid schema version: ${data.version}. Expected: ${SCHEMA_VERSION}`);
    }

    if (!data.lastUpdated) {
        warnings.push('Missing lastUpdated field');
    }

    if (!Array.isArray(data.days)) {
        errors.push('Days must be an array');
        printResults(errors, warnings, null);
        process.exit(1);
    }

    if (data.days.length === 0) {
        errors.push('Days array is empty');
        printResults(errors, warnings, null);
        process.exit(1);
    }

    let totalWords = 0;
    let totalIdioms = 0;

    // Validate each day
    for (const day of data.days) {
        const dayNum = day?.dayNumber;
        const dayContext = `Day ${dayNum || 'unknown'}`;

        // Check for duplicate day numbers
        if (seenDayNumbers.has(dayNum)) {
            errors.push(`Duplicate dayNumber: ${dayNum}`);
        }
        seenDayNumbers.add(dayNum);

        if (typeof dayNum !== 'number' || dayNum < 1) {
            errors.push(`${dayContext}: dayNumber must be a positive integer`);
        }

        if (!day.createdAt) {
            warnings.push(`${dayContext}: Missing createdAt date`);
        }

        if (!Array.isArray(day.items)) {
            errors.push(`${dayContext}: items must be an array`);
            continue;
        }

        const words = [];
        const idioms = [];

        for (const item of day.items) {
            // Validate item structure
            if (!item.id) {
                errors.push(`${dayContext}: Missing id for item "${item.term || 'unknown'}"`);
            } else if (allIds.has(item.id)) {
                errors.push(`Duplicate ID: "${item.id}"`);
            } else {
                allIds.add(item.id);
            }

            if (!item.term || item.term.trim() === '') {
                errors.push(`${dayContext}: Item has empty term`);
            }

            if (!item.definition || item.definition.trim() === '') {
                errors.push(`${dayContext}: Missing definition for "${item.term || 'unknown'}"`);
            }

            if (!['Word', 'Idiom'].includes(item.type)) {
                errors.push(`${dayContext}: Invalid type "${item.type}" for "${item.term}". Must be "Word" or "Idiom"`);
            }

            // Check for duplicate terms globally
            const normalizedTerm = item.term?.toLowerCase().trim();
            if (normalizedTerm && allTerms.has(normalizedTerm)) {
                const existingDay = allTerms.get(normalizedTerm);
                errors.push(`Duplicate term: "${item.term}" appears in Day ${existingDay} and Day ${dayNum}`);
            } else if (normalizedTerm) {
                allTerms.set(normalizedTerm, dayNum);
            }

            // Count by type
            if (item.type === 'Word') {
                words.push(item);
                totalWords++;
            } else if (item.type === 'Idiom') {
                idioms.push(item);
                totalIdioms++;
            }
        }

        // Validate counts
        if (words.length !== REQUIRED_WORDS_PER_DAY) {
            errors.push(`${dayContext}: Expected ${REQUIRED_WORDS_PER_DAY} words, got ${words.length}`);
        }

        if (idioms.length !== REQUIRED_IDIOMS_PER_DAY) {
            errors.push(`${dayContext}: Expected ${REQUIRED_IDIOMS_PER_DAY} idioms, got ${idioms.length}`);
        }
    }

    const stats = {
        totalDays: data.days.length,
        totalWords,
        totalIdioms,
        totalItems: totalWords + totalIdioms,
        lastUpdated: data.lastUpdated
    };

    printResults(errors, warnings, stats);

    if (errors.length > 0) {
        process.exit(1);
    }

    console.log('\n✅ Validation passed! Data is ready for deployment.\n');
    process.exit(0);
}

function printResults(errors, warnings, stats) {
    if (errors.length > 0) {
        console.log('❌ ERRORS:\n');
        errors.forEach(e => console.log(`   ${e}`));
        console.log('');
    }

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        warnings.forEach(w => console.log(`   ${w}`));
        console.log('');
    }

    if (stats) {
        console.log('📊 STATS:');
        console.log(`   Days: ${stats.totalDays}`);
        console.log(`   Words: ${stats.totalWords}`);
        console.log(`   Idioms: ${stats.totalIdioms}`);
        console.log(`   Total Items: ${stats.totalItems}`);
        console.log(`   Last Updated: ${stats.lastUpdated}`);
    }
}

// Run validation
validateVocabularyFile();
