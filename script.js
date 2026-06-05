// ========================================
// SAFE STUDY DATABASE CHECK
// ========================================
if (typeof studyDB === "undefined") {
    console.error("studyDB not found");
}

// ========================================
// NORMALIZE TEXT
// ========================================
function normalizeText(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}

// ========================================
// SMART TOPIC FINDER
// ========================================
function findTopic(userTopic) {

    let normalized = normalizeText(userTopic);

    // Exact Match
    if (studyDB[normalized]) {
        return normalized;
    }

    // Partial Match
    for (let key in studyDB) {

        if (
            key.includes(normalized) ||
            normalized.includes(key)
        ) {
            return key;
        }

    }

    return null;
}

// ========================================
// GENERATE SMART CONTENT
// ========================================
function generateSmart() {

    const topicInput = document.getElementById("topic");
    const typeInput = document.getElementById("type");
    const resultBox = document.getElementById("result");

    if (!topicInput || !typeInput || !resultBox) {
        console.error("Required HTML elements missing");
        return;
    }

    let topic = topicInput.value.trim();

    let type = typeInput.value.trim().toLowerCase();

    if (!topic) {

        alert("Please enter topic");
        return;

    }

    resultBox.innerText = "⏳ Generating educational content...";

    setTimeout(() => {

        try {

            let output = "";

            let matchedTopic = findTopic(topic);

            // ========================================
            // DATABASE CONTENT
            // ========================================
            if (
    matchedTopic &&
    studyDB[matchedTopic] &&
    studyDB[matchedTopic][type]
) {

    output = studyDB[matchedTopic][type];

    // Convert questions array to text
    if (Array.isArray(output)) {

        output = output
            .map((q, index) => `${index + 1}. ${q}`)
            .join("\n\n");

    }

}

            // ========================================
            // GENERIC AI CONTENT
            // ========================================
            else {

                output = generateGenericContent(topic, type);

            }

          // Fallback safety
if (
    !output ||
    (typeof output === "string" &&
     output.trim() === "")
) {

    output = `
No study material available for "${topic}".
Try another topic.
`;

}

// Remove broken formula placeholders
output = output.replace(/\d+/g, "[Formula Here]");

resultBox.innerText = output;

// Save Notes
saveNote(topic, type, output);

// Update Streak
updateStreak();

        } catch (error) {

            console.error(error);

            resultBox.innerText =
                "❌ Error generating content.";

        }

    }, 800);
}

// ========================================
// GENERIC CONTENT GENERATOR
// ========================================
function generateGenericContent(topic, type) {

    topic = topic.toUpperCase();

    switch (type) {

        case "notes":

            return `
📘 ${topic} — STUDY NOTES

1. INTRODUCTION
${topic} is an important academic topic.

--------------------------------

2. CORE CONCEPTS

✔ Definition
✔ Meaning
✔ Applications
✔ Features

--------------------------------

3. IMPORTANT AREAS

• Principles
• Types
• Examples
• Uses

--------------------------------

4. EXAM TIPS

✔ Learn definitions
✔ Revise concepts
✔ Practice questions

--------------------------------

5. CONCLUSION

${topic} is important for academic understanding.
`;

        case "summary":

            return `
📄 ${topic} — SUMMARY

✔ Important academic concept
✔ Frequently asked in exams
✔ Includes theory + applications

KEY AREAS:
• Meaning
• Features
• Applications
`;

        case "revision":

            return `
⚡ QUICK REVISION — ${topic}

✔ Definition
✔ Important concepts
✔ Key principles
✔ Important examples
`;

        case "questions":

            return `
❓ IMPORTANT QUESTIONS — ${topic}

1. Define ${topic}.

2. Explain features of ${topic}.

3. Write short note on ${topic}.

4. Explain applications of ${topic}.

5. Why is ${topic} important?
`;

        default:

            return `
Study material not available.
`;
    }
}

// ========================================
// SAVE NOTES
// ========================================
function saveNote(topic, type, content) {

    try {

        let notes =
            JSON.parse(localStorage.getItem("studyNotes")) || [];

        // Prevent duplicate saves
        let alreadyExists = notes.some(note =>
            note.topic === topic &&
            note.type === type &&
            note.content === content
        );

        if (!alreadyExists) {

            notes.push({
                topic,
                type,
                content,
                date: new Date().toLocaleString()
            });

        }

        // Limit storage size
        if (notes.length > 100) {
            notes.shift();
        }

        localStorage.setItem(
            "studyNotes",
            JSON.stringify(notes)
        );

    } catch (error) {

        console.error("Save note error:", error);

    }
}

// ========================================
// DOWNLOAD NOTES
// ========================================
function downloadPDF() {

    const result =
        document.getElementById("result");

    if (!result || !result.innerText.trim()) {

        alert("Generate content first");
        return;

    }

    let text = result.innerText;

    let blob = new Blob(
        [text],
        { type: "text/plain;charset=utf-8" }
    );

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "StudyVerse_Notes.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

// ========================================
// SMART STUDY PLANNER
// ========================================
function generatePlan() {

    let syllabusInput =
        document.getElementById("syllabus");

    let planBox =
        document.getElementById("plan");

    if (!syllabusInput || !planBox) return;

    let syllabus = syllabusInput.value.trim();

    if (!syllabus) {

        alert("Paste syllabus first");
        return;

    }

    let topics = syllabus
        .split(/\n|,/)
        .map(t => t.trim())
        .filter(Boolean);

    if (topics.length === 0) {

        alert("No valid topics found");
        return;

    }

    let output =
`📅 SMART STUDY PLAN

========================

`;

    let currentDay = 1;

    topics.forEach(topic => {

        output += `
DAY ${currentDay}-${currentDay + 1}

📘 ${topic}

✔ Learn concepts
✔ Make notes
✔ Practice questions
✔ Revision

------------------------

`;

        currentDay += 2;

    });

    output += `
FINAL REVISION

✔ Mock Tests
✔ PYQ Practice
✔ Formula Revision
✔ Weak Topics
`;

    planBox.innerText = output;

    localStorage.setItem(
        "savedPlan",
        output
    );
}

// ========================================
// LOAD SAVED PLAN
// ========================================
function loadSavedPlan() {

    let saved =
        localStorage.getItem("savedPlan");

    let plan =
        document.getElementById("plan");

    if (saved && plan) {

        plan.innerText = saved;

    }
}

// ========================================
// STREAK SYSTEM
// ========================================
function updateStreak() {

    let today =
        new Date().toDateString();

    let lastVisit =
        localStorage.getItem("lastVisit");

    let streak =
        Number(localStorage.getItem("studyStreak")) || 0;

    // Prevent refresh abuse
    if (lastVisit !== today) {

        streak++;

        localStorage.setItem(
            "studyStreak",
            streak
        );

        localStorage.setItem(
            "lastVisit",
            today
        );

    }

    let streakBox =
        document.getElementById("streak");

    if (streakBox) {

        streakBox.innerText =
            `🔥 Study Streak: ${streak} days`;

    }
}

// ========================================
// LOAD STREAK ON PAGE LOAD
// ========================================
window.addEventListener("load", () => {

    updateStreak();

    loadSavedPlan();

});

// ========================================
// CLEAR NOTES
// ========================================
function clearNotes() {

    let confirmClear =
        confirm("Delete all saved notes?");

    if (!confirmClear) return;

    localStorage.removeItem("studyNotes");

    alert("Notes cleared");
}

// ========================================
// CLEAR PLAN
// ========================================
function clearPlan() {

    localStorage.removeItem("savedPlan");

    let plan =
        document.getElementById("plan");

    if (plan) {

        plan.innerText = "";

    }
}

// ========================================
// EXPORT NOTES
// ========================================
function exportNotes() {

    let notes =
        localStorage.getItem("studyNotes");

    if (!notes) {

        alert("No notes found");
        return;

    }

    let blob = new Blob(
        [notes],
        { type: "application/json" }
    );

    let link = document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "StudyVerse_Backup.json";

    link.click();
      }
