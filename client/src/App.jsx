
import { useState } from "react";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const difficulties = {
  Easy: { suspects: 3, clues: 5, hints: 2 },
  Medium: { suspects: 4, clues: 7, hints: 3 },
  Hard: { suspects: 5, clues: 9, hints: 3 },
};

const suspectPortraits = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=320&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80",
];


const defaultPremise =
  "A college student mysteriously disappears after discovering a secret hidden inside an abandoned building on campus. Several people have motives, conflicting alibis, and secrets. The detective must uncover the truth using messages, records, witness statements, and physical evidence.";

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Make sure your server is running on port 5000."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

function App() {
 const [screen, setScreen] = useState("welcome");
  const [activeApp, setActiveApp] = useState("messages");

  const [currentCase, setCurrentCase] = useState(null);
  const [premise, setPremise] = useState(defaultPremise);
  const [difficulty, setDifficulty] = useState("Easy");

  const [discovered, setDiscovered] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");

  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedSuspect, setSelectedSuspect] = useState("");
  const [result, setResult] = useState(null);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suspects = currentCase?.suspects || [];
  const clues = currentCase?.clues || [];
  const totalClues = clues.length;
  const totalHints = difficulties[currentCase?.difficulty || difficulty].hints;

  const foundClues = clues.filter((clue) =>
    discovered.includes(clue.clueId)
  );

  const getClue = (clueId) =>
    clues.find((clue) => clue.clueId === clueId);

  const startInvestigation = async () => {
    if (loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setCurrentCase(null);
    setDiscovered([]);
    setHintsUsed(0);
    setHintsRemaining(0);
    setHintText("");
    setShowHint(false);
    setSelectedContact(null);
    setSelectedSuspect("");
    setNotes("");

    try {
      const data = await apiRequest("/cases", {
        method: "POST",
        body: JSON.stringify({ premise, difficulty }),
      });

      if (!data.case?._id) {
        throw new Error("The backend did not return a valid case.");
      }

      setCurrentCase(data.case);
      setDiscovered(data.case.discoveredClueIds || []);
      setHintsUsed(data.case.hintsUsed || 0);
      setHintsRemaining(
        difficulties[data.case.difficulty].hints -
          (data.case.hintsUsed || 0)
      );

      setScreen("phone");
      setActiveApp("messages");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const discoverEvidence = async (clueId) => {
    if (!currentCase || !clueId || loading) return;

    if (discovered.includes(clueId)) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        `/cases/${currentCase._id}/clues/${encodeURIComponent(clueId)}/discover`,
        { method: "POST" }
      );

      setDiscovered(data.discoveredClueIds || []);
      if (data.case) setCurrentCase(data.case);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openApp = async (app) => {
    setActiveApp(app);
    setSelectedContact(null);
    setShowHint(false);
    setError("");

    // Each phone section reveals a real generated clue.
    const locationToClueIndex = {
      messages: 0,
      gallery: 1,
      calls: 2,
    };

    if (Object.hasOwn(locationToClueIndex, app)) {
      const clue = clues[locationToClueIndex[app]];

      if (clue) {
        await discoverEvidence(clue.clueId);
      }
    }
  };

  const revealHint = async () => {
    if (!currentCase || loading) return;

    setShowHint(true);
    setError("");

    if (hintsRemaining <= 0) {
      setHintText("No hints remaining for this case.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest(`/cases/${currentCase._id}/hints`, {
        method: "POST",
      });

      setHintText(data.hint);
      setHintsUsed(data.hintsUsed);
      setHintsRemaining(data.hintsRemaining);
    } catch (err) {
      setHintText(err.message);
    } finally {
      setLoading(false);
    }
  };

  const makeAccusation = async () => {
    if (!currentCase || !selectedSuspect || loading) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/cases/${currentCase._id}/accuse`, {
        method: "POST",
        body: JSON.stringify({ suspectId: selectedSuspect }),
      });

      // The culprit and explanation are received only after accusation.
      setResult(data);
      setScreen("result");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setScreen("intro");
    setActiveApp("messages");
    setCurrentCase(null);
    setDiscovered([]);
    setHintsUsed(0);
    setHintsRemaining(0);
    setHintText("");
    setShowHint(false);
    setSelectedContact(null);
    setSelectedSuspect("");
    setResult(null);
    setNotes("");
    setError("");
    setLoading(false);
  };

  const caseNumber = currentCase?.caseNumber || "NEW CASE";
  const caseTitle = currentCase?.title || "SHADOW FILES";
  const verdict = result?.isCorrect ? "correct" : "incorrect";
  const score = result?.score ?? 0;

  return (
    <div className="game-shell">
      {screen === "welcome" && (
        <main className="welcome-screen">
          <header className="welcome-header">
            <div className="welcome-emblem">S</div>
            <span>SHADOW FILES</span>
            <span className="welcome-department">
              INVESTIGATION DIVISION
            </span>
          </header>

          <section className="welcome-content">
            <p className="welcome-label">
              CONFIDENTIAL INVESTIGATION SYSTEM
            </p>

            <h1>
              The truth is
              <br />
              <span>in the details.</span>
            </h1>

            <div className="welcome-divider" />

            <p className="welcome-description">
              Examine the evidence. Question the suspects.
              Follow the facts wherever they lead.
            </p>

            <button
              className="welcome-button"
              onClick={() => setScreen("intro")}
            >
              ENTER THE CASE ROOM <span>→</span>
            </button>

            <p className="welcome-footnote">
              AUTHORIZED INVESTIGATORS ONLY
            </p>
          </section>

          <footer className="welcome-footer">
            <span>SHADOW FILES / CASE MANAGEMENT</span>
            <span>EVERY DETAIL COUNTS.</span>
          </footer>
        </main>
      )}


      {screen === "intro" && (
        <main className="intro-screen">
          <div className="intro-grain"></div>

          <header className="intro-header">
            <div className="small-emblem">S</div>
            <span>SHADOW FILES</span>
            <span className="intro-header-right">
              INVESTIGATION DIVISION
            </span>
          </header>

          <section className="intro-content">
            <div className="intro-status">
              <span className="live-dot"></span>
              INVESTIGATION DIVISION
            </div>

            <p className="intro-case-number">NEW INVESTIGATION</p>

            <h1>
              Every clue
              <br />
              tells a <span>story.</span>
            </h1>

            <div className="intro-divider"></div>

            <p className="intro-description">
              Investigate suspicious messages, examine evidence, question
              suspects, and piece together what really happened.
            </p>

            <div className="case-setup">
              <label htmlFor="premise">YOUR MYSTERY</label>
              <textarea
                id="premise"
                value={premise}
                onChange={(event) => setPremise(event.target.value)}
                maxLength={1000}
                placeholder="Describe the mystery you want to investigate..."
              />

              <div className="premise-counter">{premise.length}/1000</div>

              <label className="difficulty-label">DIFFICULTY LEVEL</label>

<div className="difficulty-options">
                {Object.entries(difficulties).map(([level, settings]) => (
                  <button
                    type="button"
                    key={level}
                    className={`difficulty-option ${difficulty === level ? "active" : ""}`}
                    onClick={() => setDifficulty(level)}
                    aria-pressed={difficulty === level}
                  >
                    <span className="difficulty-name">{level}</span>
                    <span className="difficulty-description">
                      {settings.suspects} suspects<br />
                      {settings.clues} clues<br />
                      {settings.hints} hints
                    </span>
                  </button>
                ))}
              </div>

            </div>

            {error && <p className="api-error">{error}</p>}

            <button
              className="start-button"
              onClick={startInvestigation}
              disabled={loading || !premise.trim()}
            >
              <span>{loading ? "◌" : "▶"}</span>{" "}
              {loading ? "GENERATING YOUR CASE..." : "START INVESTIGATION"}
            </button>

            <p className="intro-footnote">
              CONFIDENTIAL CASE FILES · YOUR DECISIONS MATTER
            </p>
          </section>

          <div className="intro-bottom">
            <span>CONFIDENTIAL / INTERNAL USE ONLY</span>
            <span>THE TRUTH LEAVES TRACES.</span>
          </div>
        </main>
      )}

      {screen === "phone" && currentCase && (
        <main className="investigation-screen">
          <header className="game-topbar">
            <button className="game-wordmark" onClick={resetGame}>
              <span className="mini-emblem">S</span> SHADOW FILES
            </button>

            <div className="case-indicator">
              <span className="live-dot"></span>
              {caseNumber} / ACTIVE
            </div>

            <button
              className="topbar-button"
              onClick={revealHint}
              disabled={loading}
            >
              ? HINT ({hintsRemaining})
            </button>
          </header>

          <div className="investigation-layout">
            <aside className="case-sidebar">
              <p className="sidebar-label">CURRENT CASE</p>

              <div className="sidebar-case">
                <div className="case-thumbnail">
                  <span>SF</span>
                  <small>{currentCase.difficulty}</small>
                </div>
                <div>
                  <h3>{caseTitle}</h3>
                  <p>INVESTIGATION ACTIVE</p>
                </div>
              </div>

              <div className="sidebar-rule"></div>

              <p className="sidebar-label">INVESTIGATION TOOLS</p>

              <button
                className={`side-link ${activeApp === "messages" ? "active" : ""}`}
                onClick={() => openApp("messages")}
              >
                <span>▤</span> Messages
              </button>

              <button
                className={`side-link ${activeApp === "contacts" ? "active" : ""}`}
                onClick={() => openApp("contacts")}
              >
                <span>♙</span> Suspects
                <small>{suspects.length}</small>
              </button>

              <button
                className={`side-link ${activeApp === "gallery" ? "active" : ""}`}
                onClick={() => openApp("gallery")}
              >
                <span>▧</span> Gallery
              </button>

              <button
                className={`side-link ${activeApp === "calls" ? "active" : ""}`}
                onClick={() => openApp("calls")}
              >
                <span>⌕</span> Case clues
              </button>

              <button
                className={`side-link ${activeApp === "notes" ? "active" : ""}`}
                onClick={() => openApp("notes")}
              >
                <span>▧</span> Case notes
              </button>

              <button
                className={`side-link ${activeApp === "evidence" ? "active" : ""}`}
                onClick={() => openApp("evidence")}
              >
                <span>⌘</span> Evidence board
                <small>{discovered.length}</small>
              </button>

              <div className="sidebar-bottom">
                <p>INVESTIGATION PROGRESS</p>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${totalClues ? (discovered.length / totalClues) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span>
                  {discovered.length} OF {totalClues} LEADS DISCOVERED
                </span>
              </div>
            </aside>

            <section className="phone-workspace">
              <div className="workspace-heading">
                <div>
                  <p className="eyebrow">
                    DEVICE RECOVERED / {caseNumber}
                  </p>
                  <h1>{caseTitle}</h1>
                </div>
                <span className="device-status">● CASE OPEN</span>
              </div>

              {error && <p className="api-error">{error}</p>}

              <div className="device-area">
                <div className="phone-frame">
                  <div className="phone-camera"></div>

                  <div className="phone-statusbar">
                    <span>23:53</span>
                    <span>●●● Wi-Fi ▰</span>
                  </div>

                  <div className="phone-screen">
                    {activeApp === "messages" && (
                      <div className="phone-app">
                        <div className="phone-app-header">
                          <button onClick={() => setActiveApp("home")}>‹</button>
                          <div className="phone-avatar">SF</div>
                          <div>
                            <strong>Recovered evidence</strong>
                            <span>{caseTitle}</span>
                          </div>
                        </div>

                        <div className="message-list">
                          {clues.map((clue) => (
                            <div className="message-row received" key={clue.clueId}>
                              <span className="message-time">
                                {clue.location || "CASE FILE"}
                              </span>
                              <div className="message-bubble">
                                <strong>{clue.title}</strong>
                                <br />
                                {clue.description}
                                <br />
                                <small>
                                  {discovered.includes(clue.clueId)
                                    ? "EVIDENCE COLLECTED ✓"
                                    : "UNVERIFIED EVIDENCE"}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="message-input">
                          <span>Recovered case material</span>
                          <span>◉</span>
                        </div>
                      </div>
                    )}

                    {activeApp === "home" && (
                      <div className="phone-home">
                        <p className="phone-date">{caseNumber}</p>
                        <h2>{totalClues}</h2>
                        <p className="phone-subtitle">Clues to investigate</p>

                        <div className="phone-notification">
                          <span>CASE FILE</span>
                          <p>{caseTitle}</p>
                        </div>

                        <div className="phone-app-grid">
                          {[
                            ["messages", "▤", "Evidence"],
                            ["contacts", "♙", "Suspects"],
                            ["gallery", "▧", "Gallery"],
                            ["calls", "⌕", "Clues"],
                          ].map(([app, icon, label]) => (
                            <button key={app} onClick={() => openApp(app)}>
                              <span>{icon}</span>
                              <small>{label}</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeApp === "contacts" && (
                      <div className="phone-app">
                        <div className="simple-app-title">
                          <span>CASE PERSONNEL</span>
                          <h2>Suspects</h2>
                        </div>

                        {selectedContact ? (
                          <div className="contact-detail">
                            <button
                              className="text-back"
                              onClick={() => setSelectedContact(null)}
                            >
                              ‹ ALL SUSPECTS
                            </button>

                            <img
                              className="large-avatar portrait-image"
                              src={suspectPortraits[Math.max(0, suspects.indexOf(selectedContact)) % suspectPortraits.length]}
                              alt={`Portrait of ${selectedContact.name}`}
                              loading="lazy"
                            />

                            <h2>{selectedContact.name}</h2>
                            <p>{selectedContact.role}</p>

                            <div className="contact-clue">
                              <strong>Statement</strong>
                              <p>
                                {selectedContact.statement ||
                                  "No statement available."}
                              </p>
                              <strong>Alibi</strong>
                              <p>
                                {selectedContact.alibi ||
                                  "No alibi recorded."}
                              </p>
                            </div>

                            <button
                              className="phone-action"
                              onClick={() => {
                                setNotes(
                                  (old) =>
                                    `${old}${old ? "\n\n" : ""}${selectedContact.name}\nStatement: ${selectedContact.statement || "Not recorded"}\nAlibi: ${selectedContact.alibi || "Not recorded"}`
                                );
                                setActiveApp("notes");
                              }}
                            >
                              ADD TO CASE NOTES
                            </button>
                          </div>
                        ) : (
                          <div className="contact-list">
                            {suspects.map((suspect) => (
                              <button
                                className="contact-row"
                                key={suspect.suspectId}
                                onClick={() => setSelectedContact(suspect)}
                              >
                                <img
                                  className="contact-avatar portrait-image"
                                  src={suspectPortraits[suspects.indexOf(suspect) % suspectPortraits.length]}
                                  alt=""
                                  loading="lazy"
                                />
                                <span>
                                  <strong>{suspect.name}</strong>
                                  <small>{suspect.role}</small>
                                </span>
                                <span className="contact-arrow">›</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeApp === "gallery" && (
                      <div className="phone-app">
                        <div className="simple-app-title">
                          <span>RECOVERED MEDIA</span>
                          <h2>Evidence gallery</h2>
                        </div>

                        <p className="gallery-intro">
                          Review the recovered items. Select an entry to add it to your evidence log.
                        </p>

                        <div className="gallery-list">
                          {clues.map((clue, index) => {
                            const isFound = discovered.includes(clue.clueId);
                            return (
                              <button
                                className={`gallery-item ${isFound ? "found" : ""}`}
                                key={clue.clueId}
                                onClick={() => discoverEvidence(clue.clueId)}
                              >
                                <span className="gallery-item-number">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="gallery-item-copy">
                                  <strong>{clue.title}</strong>
                                  <small>{clue.location || "CASE EVIDENCE"}</small>
                                  <em>{isFound ? "ADDED TO EVIDENCE LOG" : "SELECT TO REVIEW"}</em>
                                </span>
                                <span className="gallery-item-status">{isFound ? "✓" : "＋"}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeApp === "calls" && (
                      <div className="phone-app">
                        <div className="simple-app-title">
                          <span>CASE RECORDS</span>
                          <h2>Clue register</h2>
                        </div>

                        {clues.map((clue) => (
                          <button
                            className="call-row"
                            key={clue.clueId}
                            onClick={() => discoverEvidence(clue.clueId)}
                          >
                            <span className="call-avatar">
                              {discovered.includes(clue.clueId) ? "✓" : "?"}
                            </span>
                            <div>
                              <strong>{clue.title}</strong>
                              <small>{clue.location || "Unknown location"}</small>
                            </div>
                            <span className="call-time">↗</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeApp === "notes" && (
                      <div className="phone-app">
                        <div className="simple-app-title">
                          <span>PERSONAL DOCUMENT</span>
                          <h2>Case notes</h2>
                        </div>

                        <p className="notes-caption">
                          Keep track of details that don't add up.
                        </p>

                        <textarea
                          className="notes-editor"
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Write your observations..."
                        />

                        <span className="notes-saved">
                          ● NOTES SAVED LOCALLY
                        </span>
                      </div>
                    )}

                    {activeApp === "evidence" && (
                      <div className="phone-app">
                        <div className="simple-app-title">
                          <span>CASE MATERIAL</span>
                          <h2>Evidence board</h2>
                        </div>

                        <p className="evidence-count">
                          {discovered.length} / {totalClues} leads collected
                        </p>

                        {clues.map((clue) => {
                          const isFound = discovered.includes(clue.clueId);

                          return (
                            <button
                              className={`evidence-row ${isFound ? "found" : ""}`}
                              key={clue.clueId}
                              onClick={() => discoverEvidence(clue.clueId)}
                            >
                              <span className="evidence-icon">
                                {isFound ? "✓" : "?"}
                              </span>
                              <div>
                                <small>{clue.location || "CASE FILE"}</small>
                                <strong>
                                  {isFound ? clue.title : "Undiscovered lead"}
                                </strong>
                                {isFound && <p>{clue.description}</p>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button
                      className="phone-home-indicator"
                      onClick={() => setActiveApp("home")}
                      aria-label="Return to phone home screen"
                    ></button>
                  </div>
                </div>

                <aside className="device-info">
                  <div className="info-heading">
                    <span className="live-dot"></span>
                    <span>FIELD NOTES</span>
                  </div>

                  <h2>Something doesn't add up.</h2>

                  <p>{currentCase.premise}</p>

                  <div className="info-divider"></div>

                  <p className="info-label">YOUR OBJECTIVES</p>

                  {clues.slice(0, 3).map((clue, index) => (
                    <div className="objective" key={clue.clueId}>
                      <span className={discovered.includes(clue.clueId) ? "done" : ""}>
                        {discovered.includes(clue.clueId) ? "✓" : `0${index + 1}`}
                      </span>
                      <p>{clue.title}</p>
                    </div>
                  ))}

                  <div className="field-note">
                    <span>DETECTIVE'S REMINDER</span>
                    <p>
                      A statement is not a fact. Compare the evidence with
                      each suspect's alibi before deciding.
                    </p>
                  </div>

                  <button
                    className="accuse-button"
                    onClick={() => {
                      setSelectedSuspect("");
                      setScreen("accuse");
                    }}
                  >
                    ACCUSE A SUSPECT <span>↗</span>
                  </button>

                  <button
                    className="hint-button"
                    onClick={revealHint}
                    disabled={loading}
                  >
                    REQUEST A HINT ({hintsRemaining} LEFT)
                  </button>

                  {showHint && (
                    <div className="hint-box">
                      <span>INVESTIGATION HINT</span>
                      <p>{hintText || (loading ? "Finding a hint..." : "Request a hint to continue.")}</p>
                    </div>
                  )}

                  <p className="difficulty-label">
                    DIFFICULTY: {currentCase.difficulty.toUpperCase()}
                  </p>
                </aside>
              </div>

              <footer className="game-footer">
                <span>SHADOW FILES / {caseNumber}</span>
                <span>FICTIONAL INVESTIGATION</span>
                <span>
                  LEADS: {discovered.length}/{totalClues}
                </span>
              </footer>
            </section>
          </div>
        </main>
      )}

      {screen === "accuse" && currentCase && (
        <main className="accusation-screen">
          <button
            className="return-button"
            onClick={() => setScreen("phone")}
          >
            ← RETURN TO INVESTIGATION
          </button>

          <div className="accusation-card">
            <p className="eyebrow">{caseNumber} / FINAL DECISION</p>

            <h1>
              Who is hiding
              <br />
              <span>the truth?</span>
            </h1>

            <p className="accusation-description">
              You have reviewed the evidence. Choose the person you believe
              is responsible for this case.
            </p>

            <div className="suspect-options">
              {suspects.map((suspect) => (
                <button
                  key={suspect.suspectId}
                  className={`suspect-card ${selectedSuspect === suspect.suspectId ? "selected" : ""}`}
                  onClick={() => setSelectedSuspect(suspect.suspectId)}
                >
                  <img
                    className="suspect-initial suspect-portrait"
                    src={suspectPortraits[suspects.indexOf(suspect) % suspectPortraits.length]}
                    alt=""
                    loading="lazy"
                  />
                  <span className="suspect-details">
                    <strong>{suspect.name}</strong>
                    <small>{suspect.role}</small>
                  </span>
                  <span className="suspect-radio">
                    {selectedSuspect === suspect.suspectId ? "●" : "○"}
                  </span>
                </button>
              ))}
            </div>

            {error && <p className="api-error">{error}</p>}

            <button
              className="final-accuse-button"
              disabled={!selectedSuspect || loading}
              onClick={makeAccusation}
            >
              {loading ? "VERIFYING ACCUSATION..." : "CONFIRM ACCUSATION ↗"}
            </button>

            <p className="accusation-warning">
              YOUR DECISION WILL END THIS INVESTIGATION.
            </p>
          </div>
        </main>
      )}

      {screen === "result" && result && (
        <main className="result-screen">
          <div className="result-card">
            <p className="eyebrow">
              INVESTIGATION REPORT / {caseNumber}
            </p>

            <div className="result-symbol">
              {verdict === "correct" ? "✓" : "×"}
            </div>

            <p className="result-status">
              {verdict === "correct"
                ? "THEORY CONFIRMED"
                : "THEORY INCONCLUSIVE"}
            </p>

            <h1>
              {verdict === "correct"
                ? "You found the truth."
                : "The evidence tells another story."}
            </h1>

            <p className="result-description">
              {result.message}
            </p>

            <div className="contact-clue">
              <p className="info-label">THE CULPRIT</p>
              <h2>
                {suspects.find(
                  (suspect) => suspect.suspectId === result.culpritId
                )?.name || result.accusedSuspect?.name || "Unknown"}
              </h2>

              <p className="info-label">CASE EXPLANATION</p>
              <p>{result.explanation}</p>

              {result.reasoning?.length > 0 && (
                <>
                  <p className="info-label">HOW THE CLUES CONNECT</p>
                  {result.reasoning.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}
                </>
              )}
            </div>

            <div className="result-stats">
              <div>
                <span>LEADS FOUND</span>
                <strong>{discovered.length}/{totalClues}</strong>
              </div>

              <div>
                <span>HINTS USED</span>
                <strong>{hintsUsed}</strong>
              </div>

              <div>
                <span>FINAL SCORE</span>
                <strong>{score}</strong>
              </div>
            </div>

            <button
              className="start-button result-button"
              onClick={resetGame}
            >
              CREATE A NEW CASE ↗
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;

