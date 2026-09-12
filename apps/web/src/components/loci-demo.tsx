"use client";

import { useEffect, useState, type FormEvent } from "react";

type JsonObject = Record<string, unknown>;
type LociState = {
  objects?: JsonObject[];
  lessons?: JsonObject[];
  claims?: JsonObject[];
  places?: JsonObject[];
};

async function request<T>(body?: JsonObject): Promise<T> {
  const response = await fetch("/api/loci", body
    ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    : { cache: "no-store" });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || `Request failed: HTTP ${response.status}`);
  return value;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function LociDemo() {
  const [place, setPlace] = useState("upstairs bathroom");
  const [tag, setTag] = useState("JS-NEW");
  const [label, setLabel] = useState("sink shutoff");
  const [description, setDescription] = useState(
    "Chrome quarter-turn shutoff valve beneath the sink",
  );
  const [visibleText, setVisibleText] = useState("1/2 IN COLD");
  const [objectId, setObjectId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("Isolation direction verified");
  const [claim, setClaim] = useState("Turn clockwise one quarter-turn to isolate the sink supply.");
  const [nextQuestion, setNextQuestion] = useState(
    "Does this branch also supply the exterior hose bib?",
  );
  const [recall, setRecall] = useState<JsonObject>();
  const [state, setState] = useState<LociState>();
  const [viewerUrl, setViewerUrl] = useState("");
  const [activity, setActivity] = useState("Ready to record a new object.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function refresh() {
    const result = await request<{ state: LociState; viewerUrl: string }>();
    setState(result.state);
    setViewerUrl(result.viewerUrl);
  }

  useEffect(() => {
    setTag(`JS-${Date.now().toString(36).slice(-6).toUpperCase()}`);
    refresh().catch((error) => setError(error instanceof Error ? error.message : "Unable to load memory."));
  }, []);

  async function observe(event: FormEvent) {
    event.preventDefault();
    setBusy("observe");
    setError("");
    try {
      const result = await request<JsonObject>({
        operation: "observe",
        place_label: place,
        canonical_class: "shutoff_valve",
        material: "metal_chrome_or_steel",
        mounting: "wall_mounted",
        visible_verbatim_text: visibleText,
        description,
        visible_tag_code: tag,
        user_label: label,
      });
      if (result.status !== "ok" || !text(result.object_id))
        throw new Error(text(result.error) || `Observe returned ${text(result.status) || "an error"}.`);
      setObjectId(text(result.object_id));
      setActivity(`Object ${text(result.object_id)} appended to the Ambiguous event sheet.`);
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to record the object.");
    } finally {
      setBusy("");
    }
  }

  async function commit(event: FormEvent) {
    event.preventDefault();
    setBusy("commit");
    setError("");
    try {
      const result = await request<JsonObject>({
        operation: "commit",
        object_id: objectId,
        title: lessonTitle,
        claim,
        confidence: "high",
        intent: "Leave a reliable handoff for the next technician.",
        next_question: nextQuestion,
      });
      if (result.status !== "ok")
        throw new Error(text(result.error) || `Commit returned ${text(result.status) || "an error"}.`);
      setActivity(`Lesson ${text(result.lesson_id)} appended and confirmed by 0xL0C1.`);
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save the lesson.");
    } finally {
      setBusy("");
    }
  }

  async function ask() {
    setBusy("ask");
    setError("");
    try {
      const result = await request<JsonObject>({
        operation: "ask",
        object_id: "",
        place_label: place,
        visible_tag_code: tag,
        description,
      });
      setRecall(result);
      setActivity(
        result.status === "ok"
          ? "Loaded this object and its handoff from Ambiguous through 0xL0C1."
          : `Recall returned ${text(result.status)}.`,
      );
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to recall the object.");
    } finally {
      setBusy("");
    }
  }

  const matched = recall?.match as JsonObject | undefined;
  const lessons = Array.isArray(recall?.lessons) ? recall.lessons as JsonObject[] : [];
  const claims = Array.isArray(recall?.claims) ? recall.claims as JsonObject[] : [];

  return (
    <section className="loci-console" aria-label="Job-site memory demo">
      <div className="loci-proofbar">
        <div><strong>{state?.objects?.length ?? "–"}</strong><span>objects</span></div>
        <div><strong>{state?.lessons?.length ?? "–"}</strong><span>lessons</span></div>
        <div><strong>{state?.claims?.length ?? "–"}</strong><span>claims</span></div>
        <button className="ck-btn" onClick={() => refresh().catch((error) => setError(String(error)))}>
          Refresh ledger
        </button>
        {viewerUrl ? <a className="ck-btn" href={viewerUrl} target="_blank" rel="noreferrer">Open ledger</a> : null}
      </div>

      {error ? <p className="ck-error">{error}</p> : null}
      <p className="loci-activity">{activity}</p>

      <div className="loci-steps">
        <form className="loci-step" onSubmit={observe}>
          <div className="loci-step-heading"><span>1</span><div><h2>Observe on site</h2><p>Append the physical object to Ambiguous.</p></div></div>
          <label>Room or zone<input value={place} onChange={(event) => setPlace(event.target.value)} required /></label>
          <label>Visible tag<input value={tag} onChange={(event) => setTag(event.target.value)} required /></label>
          <label>Technician label<input value={label} onChange={(event) => setLabel(event.target.value)} required /></label>
          <label>Visible text<input value={visibleText} onChange={(event) => setVisibleText(event.target.value)} /></label>
          <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={2} /></label>
          <button className="ck-btn ck-btn--primary" disabled={!!busy} type="submit">
            {busy === "observe" ? "Recording…" : "Record object"}
          </button>
          {objectId ? <code className="loci-id">object_id: {objectId}</code> : null}
        </form>

        <form className="loci-step" onSubmit={commit}>
          <div className="loci-step-heading"><span>2</span><div><h2>Leave a handoff</h2><p>Attach the lesson to that exact object.</p></div></div>
          <label>Lesson title<input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} required /></label>
          <label>Verified claim<textarea value={claim} onChange={(event) => setClaim(event.target.value)} required rows={2} /></label>
          <label>Open question<textarea value={nextQuestion} onChange={(event) => setNextQuestion(event.target.value)} rows={2} /></label>
          <button className="ck-btn ck-btn--primary" disabled={!objectId || !!busy} type="submit">
            {busy === "commit" ? "Saving…" : "Save handoff"}
          </button>
          {!objectId ? <p className="loci-hint">Record an object first.</p> : null}
        </form>

        <section className="loci-step">
          <div className="loci-step-heading"><span>3</span><div><h2>Return visit</h2><p>Recall by tag—not browser state.</p></div></div>
          <div className="loci-return-tag"><span>Looking at tag</span><strong>{tag}</strong><small>{place}</small></div>
          <button className="ck-btn ck-btn--primary" disabled={!!busy} onClick={ask} type="button">
            {busy === "ask" ? "Reading Ambiguous…" : "Recall from Ambiguous"}
          </button>
          {recall ? (
            <article className="loci-recall" data-status={text(recall.status)}>
              <span className="ck-status" data-status={recall.status === "ok" ? "live" : "error"}>{text(recall.status)}</span>
              {matched ? <h3>{text(matched.label) || text(matched.canonical_class)}</h3> : null}
              {matched ? <p>{text(matched.description)}</p> : null}
              {lessons.map((lesson) => <div key={text(lesson.id)}><strong>{text(lesson.title)}</strong>{text(lesson.next_question) ? <p>Next question: {text(lesson.next_question)}</p> : null}</div>)}
              {claims.map((item) => <blockquote key={text(item.id)}>{text(item.text)} <small>{text(item.confidence)}</small></blockquote>)}
              {recall.status === "no_match" ? <p>No saved object matched this tag and place.</p> : null}
              {recall.status === "needs_confirm" ? <p>More than one object matched; choose the exact object in chat.</p> : null}
            </article>
          ) : null}
        </section>
      </div>
    </section>
  );
}
