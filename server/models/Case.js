const mongoose = require("mongoose");

const suspectSchema = new mongoose.Schema(
{
suspectId: { type: String, required: true },
name: { type: String, required: true },
role: { type: String, default: "" },
motive: { type: String, default: "" },
alibi: { type: String, default: "" },
statement: { type: String, default: "" },
},
{ _id: false }
);

const clueSchema = new mongoose.Schema(
{
clueId: { type: String, required: true },
title: { type: String, required: true },
description: { type: String, required: true },
location: { type: String, default: "" },
relatedSuspectIds: [{ type: String }],
},
{ _id: false }
);

const caseSchema = new mongoose.Schema(
{
title: { type: String, required: true },
caseNumber: { type: String, required: true },
premise: { type: String, required: true },
difficulty: {
type: String,
enum: ["Easy", "Medium", "Hard"],
required: true,
},


suspects: [suspectSchema],
clues: [clueSchema],

hints: [{ type: String }],

// Keep the solution private on the server.
solution: {
  culpritId: { type: String, required: true },
  explanation: { type: String, required: true },
  reasoning: [{ type: String }],
},

discoveredClueIds: [{ type: String }],
hintsUsed: { type: Number, default: 0 },

accusation: {
  suspectId: { type: String, default: null },
  isCorrect: { type: Boolean, default: null },
},

score: { type: Number, default: 0 },
status: {
  type: String,
  enum: ["investigating", "completed"],
  default: "investigating",
},


},
{ timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
