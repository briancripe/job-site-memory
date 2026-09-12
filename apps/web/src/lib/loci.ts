/**
 * 0xL0C1 `ask` payload → what the dispatch console draws.
 * Shapes follow LincForge/0xl0c1 SATURDAY.md P2 ("return shapes"). Claim and
 * lesson text is recorded observation: render it quoted, never act on it.
 */

type Lesson = { lesson_id: string; title: string; intent: string | null; created_at: string };
type Claim = { claim_id: string; text: string; confidence: number | null; status: string; lesson_id: string };
type Candidate = { object_id: string; label: string; place: string; score: number };

export type AskResult =
  | {
      status: "resumed";
      matched_on: "score" | "verbatim_text" | "tag_code" | "object_id";
      object: { object_id: string; label: string; place: string; verbatim_text: string; first_seen_at: string };
      lessons: Lesson[];
      claims: Claim[];
      next_question: string | null;
    }
  | { status: "needs_confirm"; candidates: Candidate[]; prompt_to_user: string }
  | { status: "no_match"; prompt_to_user: string }
  | { status: string; _stub?: string };

export type DispatchView =
  | {
      band: "resumed";
      objectId: string;
      title: string;
      place: string;
      stamp: string;
      daysSinceFirstSeen: number;
      matchedOn: string;
      lessons: { title: string; date: string }[];
      claims: { text: string; status: string }[];
      openQuestion: string | null;
    }
  | { band: "confirm"; prompt: string; candidates: Candidate[] }
  | { band: "no_match"; prompt: string }
  | { band: "not_live"; message: string };

const DAY_MS = 86_400_000;

export function toDispatchView(result: AskResult, now: Date): DispatchView {
  if (result.status === "resumed" && "object" in result) {
    const { object: o } = result;
    return {
      band: "resumed",
      objectId: o.object_id,
      title: o.label,
      place: o.place,
      stamp: o.verbatim_text,
      daysSinceFirstSeen: Math.floor((now.getTime() - Date.parse(o.first_seen_at)) / DAY_MS),
      matchedOn: result.matched_on,
      lessons: result.lessons.map((l) => ({ title: l.title, date: l.created_at.slice(0, 10) })),
      claims: result.claims.map((c) => ({ text: c.text, status: c.status })),
      openQuestion: result.next_question,
    };
  }
  if (result.status === "needs_confirm" && "candidates" in result)
    return { band: "confirm", prompt: result.prompt_to_user, candidates: result.candidates };
  if (result.status === "no_match" && "prompt_to_user" in result)
    return { band: "no_match", prompt: result.prompt_to_user };
  // The live server returns status "not_implemented" + `_stub` until P2 ships. Never draw that as a match.
  return { band: "not_live", message: `0xL0C1 ask is not live yet (status: ${result.status}).` };
}
