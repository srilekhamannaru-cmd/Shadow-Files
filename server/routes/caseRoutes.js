const express = require("express");
const mongoose = require("mongoose");
const Case = require("../models/Case");
const { generateMystery } = require("../services/mysteryGenerator");

const router = express.Router();

function publicCase(caseDocument) {
const data = caseDocument.toObject();
delete data.solution;
return data;
} 
// CREATE a new AI-generated mystery
router.post("/", async (req, res) => {
try {
const { premise, difficulty } = req.body;


if (!premise || typeof premise !== "string" || !premise.trim()) {
  return res.status(400).json({
    message: "Please provide a mystery premise.",
  });
}

if (premise.trim().length > 1000) {
  return res.status(400).json({
    message: "The premise must be 1000 characters or fewer.",
  });
}

if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
  return res.status(400).json({
    message: "Difficulty must be Easy, Medium, or Hard.",
  });
}

console.log("Generating a new", difficulty, "mystery...");

const mystery = await generateMystery(premise.trim(), difficulty);

const newCase = await Case.create({
  title: mystery.title,
  caseNumber: `SF-${Date.now()}`,
  premise: mystery.premise,
  difficulty,
  suspects: mystery.suspects,
  clues: mystery.clues,
  hints: mystery.hints,
  solution: mystery.solution,
  discoveredClueIds: [],
  hintsUsed: 0,
  score: 0,
  status: "investigating",
});

console.log("Mystery saved successfully:", newCase.caseNumber);

res.status(201).json({
  message: "Mystery created successfully!",
  case: publicCase(newCase),
});


} catch (error) {
console.error("Mystery generation failed:", error);


res.status(500).json({
  message: "Failed to generate the mystery. Please try again.",
  error:
    process.env.NODE_ENV === "development"
      ? error.message
      : undefined,
});


}
});


// GET all cases
router.get("/", async (req, res) => {
try {
const cases = await Case.find()
.select("-solution")
.sort({ createdAt: -1 });


res.json(cases);


} catch (error) {
console.error("Error loading cases:", error);
res.status(500).json({
message: "Failed to load cases.",
error: error.message,
});
}
});

// GET one case
router.get("/:id", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({ message: "Invalid case ID." });
}


const caseDocument = await Case.findById(req.params.id).select("-solution");

if (!caseDocument) {
  return res.status(404).json({ message: "Case not found." });
}

res.json(caseDocument);


} catch (error) {
console.error("Error loading case:", error);
res.status(500).json({ message: "Failed to load the case." });
}
});

// Discover a clue
router.post("/:id/clues/:clueId/discover", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({ message: "Invalid case ID." });
}


const caseDocument = await Case.findById(req.params.id);

if (!caseDocument) {
  return res.status(404).json({ message: "Case not found." });
}

if (caseDocument.status === "completed") {
  return res.status(400).json({ message: "This case is already completed." });
}

const clueExists = caseDocument.clues.some(
  (clue) => clue.clueId === req.params.clueId
);

if (!clueExists) {
  return res.status(404).json({ message: "Clue not found." });
}

if (!caseDocument.discoveredClueIds.includes(req.params.clueId)) {
  caseDocument.discoveredClueIds.push(req.params.clueId);
  await caseDocument.save();
}

res.json({
  message: "Clue discovered!",
  discoveredClueIds: caseDocument.discoveredClueIds,
  case: publicCase(caseDocument),
});


} catch (error) {
console.error("Error discovering clue:", error);
res.status(500).json({ message: "Failed to discover clue." });
}
});

// Request a hint
router.post("/:id/hints", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({ message: "Invalid case ID." });
}


const caseDocument = await Case.findById(req.params.id);

if (!caseDocument) {
  return res.status(404).json({ message: "Case not found." });
}

if (caseDocument.status === "completed") {
  return res.status(400).json({ message: "This case is already completed." });
}

const difficultyLimits = { Easy: 2, Medium: 3, Hard: 3 };
const hintLimit = difficultyLimits[caseDocument.difficulty] || 0;

if (caseDocument.hintsUsed >= hintLimit) {
  return res.status(400).json({ message: "No hints remaining." });
}

const hint = caseDocument.hints[caseDocument.hintsUsed];

if (!hint) {
  return res.status(400).json({ message: "No more hints are available." });
}

caseDocument.hintsUsed += 1;
await caseDocument.save();

res.json({
  hint,
  hintsUsed: caseDocument.hintsUsed,
  hintsRemaining: hintLimit - caseDocument.hintsUsed,
});


} catch (error) {
console.error("Error requesting hint:", error);
res.status(500).json({ message: "Failed to get a hint." });
}
});

// Accuse a suspect
router.post("/:id/accuse", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({ message: "Invalid case ID." });
}


const { suspectId } = req.body;

if (!suspectId || typeof suspectId !== "string") {
  return res.status(400).json({ message: "Please provide a suspect ID." });
}

const caseDocument = await Case.findById(req.params.id);

if (!caseDocument) {
  return res.status(404).json({ message: "Case not found." });
}

if (caseDocument.status === "completed") {
  return res.status(400).json({ message: "This case is already completed." });
}

const accusedSuspect = caseDocument.suspects.find(
  (suspect) => suspect.suspectId === suspectId
);

if (!accusedSuspect) {
  return res.status(400).json({ message: "That suspect is not part of this case." });
}

const isCorrect = suspectId === caseDocument.solution.culpritId;
const baseScores = { Easy: 100, Medium: 150, Hard: 200 };
const baseScore = isCorrect ? (baseScores[caseDocument.difficulty] || 0) : 0;
const cluePoints = caseDocument.discoveredClueIds.length * 5;
const hintPenalty = caseDocument.hintsUsed * 10;

caseDocument.accusation = { suspectId, isCorrect };
caseDocument.score = Math.max(0, baseScore + cluePoints - hintPenalty);
caseDocument.status = "completed";

await caseDocument.save();

res.json({
  message: isCorrect ? "Correct accusation!" : "Incorrect accusation.",
  isCorrect,
  accusedSuspect,
  culpritId: caseDocument.solution.culpritId,
  explanation: caseDocument.solution.explanation,
  reasoning: caseDocument.solution.reasoning,
  score: caseDocument.score,
  discoveredClueIds: caseDocument.discoveredClueIds,
  hintsUsed: caseDocument.hintsUsed,
});


} catch (error) {
console.error("Error submitting accusation:", error);
res.status(500).json({ message: "Failed to submit accusation." });
}
});

// Get result after accusation
router.get("/:id/result", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({ message: "Invalid case ID." });
}


const caseDocument = await Case.findById(req.params.id);

if (!caseDocument) {
  return res.status(404).json({ message: "Case not found." });
}

if (caseDocument.status !== "completed") {
  return res.status(403).json({
    message: "Complete your accusation before viewing the result.",
  });
}

res.json({
  title: caseDocument.title,
  accusation: caseDocument.accusation,
  culpritId: caseDocument.solution.culpritId,
  explanation: caseDocument.solution.explanation,
  reasoning: caseDocument.solution.reasoning,
  score: caseDocument.score,
  discoveredClueIds: caseDocument.discoveredClueIds,
  hintsUsed: caseDocument.hintsUsed,
});


} catch (error) {
console.error("Error loading result:", error);
res.status(500).json({ message: "Failed to load the result." });
}
});

module.exports = router;
