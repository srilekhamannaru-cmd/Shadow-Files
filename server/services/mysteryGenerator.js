const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

const DIFFICULTY_SETTINGS = {
Easy: { suspects: 3, clues: 5, hints: 2 },
Medium: { suspects: 4, clues: 7, hints: 3 },
Hard: { suspects: 5, clues: 9, hints: 3 },
};

async function generateMystery(premise, difficulty) {
const settings = DIFFICULTY_SETTINGS[difficulty];

if (!settings) {
throw new Error("Difficulty must be Easy, Medium, or Hard.");
}

if (!process.env.GEMINI_API_KEY) {
throw new Error("GEMINI_API_KEY is missing from the server .env file.");
}

const prompt = `
You are a professional mystery writer creating an original detective game
called SHADOW FILES.

Create a fair-play mystery based on this premise:
${premise}

Difficulty: ${difficulty}

Requirements:

* Create exactly ${settings.suspects} suspects.
* Create exactly ${settings.clues} clues.
* Create exactly ${settings.hints} progressive hints.
* Every suspect must have a believable motive, alibi, and statement.
* Exactly one suspect must be the culprit.
* The clues must provide a fair, logical path to identifying the culprit.
* The explanation must agree with the clues and suspect statements.
* Give each suspect a unique suspectId such as S1, S2, S3.
* Give each clue a unique clueId such as C1, C2, C3.
* Make the story original, atmospheric, and suitable for a college mystery game.
* Do not reveal the culprit in the title, premise, clue titles, or hints.
* Return only valid JSON, without Markdown code fences.

Use this exact JSON structure:
{
"title": "Mystery title",
"premise": "A short introduction shown to the player",
"suspects": [
{
"suspectId": "S1",
"name": "Suspect name",
"role": "Role in the story",
"motive": "Possible motive",
"alibi": "Claimed alibi",
"statement": "What the suspect tells the detective"
}
],
"clues": [
{
"clueId": "C1",
"title": "Clue title",
"description": "Evidence the player can investigate",
"location": "Where the clue is found",
"relatedSuspectIds": ["S1"]
}
],
"hints": ["First hint", "Second hint"],
"solution": {
"culpritId": "S1",
"explanation": "Explanation of what happened",
"reasoning": ["Reasoning step 1", "Reasoning step 2"]
}
}

The culpritId must match one of the suspectIds.
Every relatedSuspectIds value must refer to a valid suspectId.
`;


let response;
const maxAttempts = 3;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    console.log(`Gemini generation attempt ${attempt}/${maxAttempts}...`);

    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    // Stop retrying when Gemini responds successfully.
    break;
  } catch (error) {
    const status = error.status || error.code;
    const isTemporaryError = [429, 500, 502, 503, 504].includes(
      Number(status)
    );

    if (!isTemporaryError || attempt === maxAttempts) {
      throw error;
    }

    // Wait 2 seconds, then 4 seconds before retrying.
    const delay = attempt * 2000;

    console.log(
      `Gemini temporarily unavailable (${status}). Retrying in ${
        delay / 1000
      } seconds...`
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}



let mystery;

try {
mystery = JSON.parse(response.text);
} catch {
throw new Error("Gemini returned invalid JSON. Please try again.");
}

validateMystery(mystery, settings);

return mystery;
}

function validateMystery(mystery, settings) {
if (
!mystery ||
typeof mystery.title !== "string" ||
typeof mystery.premise !== "string" ||
!Array.isArray(mystery.suspects) ||
!Array.isArray(mystery.clues) ||
!Array.isArray(mystery.hints) ||
!mystery.solution
) {
throw new Error("The generated mystery is missing required fields.");
}

if (mystery.suspects.length !== settings.suspects) {
throw new Error("The generated mystery has an incorrect suspect count.");
}

if (mystery.clues.length !== settings.clues) {
throw new Error("The generated mystery has an incorrect clue count.");
}

if (mystery.hints.length !== settings.hints) {
throw new Error("The generated mystery has an incorrect hint count.");
}

const suspectIds = mystery.suspects.map((suspect) => suspect.suspectId);

if (
new Set(suspectIds).size !== suspectIds.length ||
!suspectIds.includes(mystery.solution.culpritId)
) {
throw new Error("The generated mystery has invalid suspect IDs or solution.");
}

const clueIds = mystery.clues.map((clue) => clue.clueId);

if (new Set(clueIds).size !== clueIds.length) {
throw new Error("The generated mystery contains duplicate clue IDs.");
}

for (const clue of mystery.clues) {
if (
!Array.isArray(clue.relatedSuspectIds) ||
!clue.relatedSuspectIds.every((id) => suspectIds.includes(id))
) {
throw new Error("A clue refers to an invalid suspect ID.");
}
}

if (
typeof mystery.solution.explanation !== "string" ||
!Array.isArray(mystery.solution.reasoning)
) {
throw new Error("The generated mystery has an invalid solution.");
}
}

module.exports = { generateMystery };
