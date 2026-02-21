
import { parseDateSafe, sleep } from "../utils/common";

// String similarity helper (Levenshtein-based)
const stringSimilarity = (s1, s2) => {
    if (!s1 || !s2) return 0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;

    const editDistance = (s1, s2) => {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };

    return (longer.length - editDistance(longer, shorter)) / longer.length;
};

// Normalize a name string before comparison — removes punctuation, extra spaces, lowercases
const normalizeName = (s) => (s || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// INTELLIGENT RISK SCORING ENGINE
export const calculateRiskScore = (userInput, extractedData, fraudChecks = {}) => {
    let score = 0;
    const breakdown = {};
    const flags = [];

    // 1. Name Mismatch Check (weight: 20)
    // Compare normalized names — strips OCR noise punctuation before scoring
    const nameA = normalizeName(userInput.name);
    const nameB = normalizeName(extractedData.name);
    // Also check if entered name is a substring of extracted (handles middle name on doc)
    const nameSubstringMatch = nameA.length > 3 && (nameB.includes(nameA) || nameA.includes(nameB));
    const nameSimilarity = nameSubstringMatch ? 1.0 : stringSimilarity(nameA, nameB);
    if (nameSimilarity < 0.70) {  // 70% threshold — tolerates minor OCR artifacts
        const points = Math.round((1 - nameSimilarity) * 20);
        breakdown.name_mismatch = points;
        score += points;
        flags.push(`Name mismatch detected (${Math.round(nameSimilarity * 100)}% match)`);
    } else {
        breakdown.name_mismatch = 0;
    }

    // 2. DOB Mismatch Check (weight: 25)
    const userDate = parseDateSafe(userInput.dob);
    const docDate = parseDateSafe(extractedData.dob);

    if (userDate && docDate && !isNaN(userDate.getTime()) && !isNaN(docDate.getTime())) {
        const daysDiff = Math.abs(userDate - docDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1) { // Allow 1 day tolerance
            const points = Math.min(25, Math.round(daysDiff / 30 * 25));
            breakdown.dob_mismatch = points;
            score += points;
            flags.push(`DOB mismatch (${Math.round(daysDiff)} days difference)`);
        } else {
            breakdown.dob_mismatch = 0;
        }
    } else {
        // If one is missing or invalid, add some risk but don't break
        breakdown.dob_mismatch = 5;
        score += 5;
    }

    // 3. Duplicate ID Check (weight: 20)
    if (fraudChecks.duplicateId) {
        breakdown.duplicate_id = 20;
        score += 20;
        flags.push("Duplicate ID number detected in system");
    } else {
        // If suspicious pattern, add risk
        breakdown.duplicate_id = fraudChecks.suspiciousPattern ? 15 : 5;
        score += breakdown.duplicate_id;
        if (fraudChecks.suspiciousPattern) flags.push("Suspicious ID pattern detected");
    }

    // 4. Face Match Simulation (weight: 25)
    // In a real app, this would come from the biometric API
    const faceMatch = fraudChecks.faceMatchScore || (85 + Math.random() * 10);
    const facePoints = Math.round((100 - faceMatch) / 4);
    breakdown.face_match = facePoints;
    score += facePoints;
    if (faceMatch < 90) flags.push(`Low face match confidence (${Math.round(faceMatch)}%)`);

    // 5. Device/Location Check (weight: 10)
    if (fraudChecks.locationMismatch) {
        breakdown.location_anomaly = 10;
        score += 10;
        flags.push("Location/device mismatch detected");
    } else {
        breakdown.location_anomaly = 0;
    }

    // Calculate final
    const finalScore = Math.min(100, score);
    const level = finalScore <= 30 ? "LOW" : finalScore <= 60 ? "MEDIUM" : "HIGH";

    return { score: finalScore, level, breakdown, flags };
};

// Fraud detection checks
export const runFraudChecks = async (docNumber, email) => {
    await sleep(800); // Simulate API call
    // Mock logic - in production call external fraud API
    return {
        duplicateId: Math.random() < 0.05, // 5% chance
        suspiciousPattern: /(\d)\1{4,}/.test(docNumber), // e.g., 11111, 22222
        locationMismatch: Math.random() < 0.1, // 10% chance
        faceMatchScore: 85 + Math.random() * 12
    };
};
