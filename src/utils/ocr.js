// ─────────────────────────────────────────────────────────────────────────────
// OCR UTILITY – Real Tesseract.js with Simulation Fallback
// ─────────────────────────────────────────────────────────────────────────────

// Fallback simulated OCR
const simulateOCR = async (file) => {
    console.log("[OCR] Using simulation fallback");
    await new Promise(r => setTimeout(r, 1800));
    const candidateName = file?.candidateName || "Sample User";
    return {
        text: `GOVERNMENT OF INDIA\nName: ${candidateName}\nDOB: 01/01/1990\nID: A1234567\n[Simulated OCR Result]`,
        extracted: { dob: "01/01/1990", docNumber: "A1234567", name: candidateName },
        simulated: true,
    };
};

export const performOCR = async (file, hintName = "") => {
    try {
        if (!file || (!file.type && !file.name)) {
            return await simulateOCR({ candidateName: hintName });
        }

        // Skip OCR for PDFs (not well-supported in browser)
        if (file.type === "application/pdf") {
            return await simulateOCR({ candidateName: hintName });
        }

        // Dynamically import Tesseract
        let Tesseract;
        try {
            const mod = await import("tesseract.js");
            Tesseract = mod.default || mod;
        } catch (e) {
            console.warn("[OCR] Tesseract load failed, using fallback:", e);
            return await simulateOCR({ candidateName: hintName });
        }

        console.log("[OCR] Running Tesseract recognition...");
        const result = await Tesseract.recognize(file, "eng", {
            logger: m => { if (m.status === "recognizing text") console.log(`[OCR] ${Math.round(m.progress * 100)}%`); }
        });

        const text = result?.data?.text || "";
        console.log("[OCR] Raw text:", text.slice(0, 200));

        // ── Extract DOB ──────────────────────────────────────────────────────
        const dobRegex = /(?:DOB|Date\s*of\s*Birth|Birth)[:\s/-]*(\d{2}[/-]\d{2}[/-]\d{4})/i;
        const dobMatch = text.match(dobRegex);
        const dob = dobMatch ? dobMatch[1].replace(/\//g, "/") : null;

        // ── Extract Aadhaar Number (12 digits in groups) ─────────────────────
        const aadhaarMatch = text.match(/\b(\d{4}\s\d{4}\s\d{4})\b/);
        const aadhaarNumber = aadhaarMatch ? aadhaarMatch[1] : null;

        // ── Extract PAN (5 letters, 4 digits, 1 letter) ─────────────────────
        const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);

        // ── Extract Passport/DL number ───────────────────────────────────────
        const passportMatch = text.match(/\b([A-Z]{1,2}\d{7})\b/);

        const docNumber = panMatch?.[1] || aadhaarNumber || passportMatch?.[1] || null;

        // ── Extract Name ─────────────────────────────────────────────────────
        let name = "";
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 2);

        // Utility: clean a raw OCR line into a proper name
        const cleanName = (raw) => {
            return raw
                // Remove non-printable / control characters
                .replace(/[^\x20-\x7E]/g, " ")
                // Remove common OCR noise chars  | ! @ # $ % ^ & * _ + = [ ] { } \ / < >
                .replace(/[|!@#$%^&*_+=\[\]{}\\/<>\"'`~]/g, " ")
                // Remove lone digits and tokens under 2 chars
                .split(/\s+/)
                .filter(tok => tok.length >= 2 && /[a-zA-Z]/.test(tok) && !/^\d+$/.test(tok))
                .join(" ")
                .trim();
        };

        // Strategy 1: line above DOB
        if (dobMatch) {
            const dobLineIdx = lines.findIndex(l => dobRegex.test(l));
            const ignoreWords = ["government", "india", "date", "birth", "dob", "male", "female", "address", "father", "year", "republic", "driving", "licence", "election", "voter", "commission"];
            for (let i = Math.max(0, dobLineIdx - 1); i >= 0; i--) {
                const line = lines[i];
                if (ignoreWords.some(w => line.toLowerCase().includes(w))) continue;
                if (/\d{6,}/.test(line)) continue;
                const cleaned = cleanName(line);
                if (cleaned.length >= 3) { name = cleaned; break; }
            }
        }
        // Strategy 2: After "Name:" keyword
        if (!name) {
            const nameMatch = text.match(/Name\s*[:\-]?\s*([A-Za-z][A-Za-z\s]{2,40})/i);
            if (nameMatch) name = cleanName(nameMatch[1]);
        }
        // Strategy 3: Largest capitalised multi-word sequence (common on Aadhaar)
        if (!name) {
            const capMatch = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\b/);
            if (capMatch) name = cleanName(capMatch[1]);
        }

        return {
            text,
            extracted: { dob, docNumber, name },
            simulated: false,
        };

    } catch (err) {
        console.error("[OCR] Error:", err);
        return await simulateOCR({ candidateName: hintName });
    }
};
