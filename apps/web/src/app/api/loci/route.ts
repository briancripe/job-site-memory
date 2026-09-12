import { z } from "zod";
import { callLoci, LociError, readLociState } from "@/lib/server/loci-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const material = z.enum([
  "metal_chrome_or_steel",
  "metal_brass_or_bronze",
  "metal_matte_black",
  "plastic_molded",
  "wood_finished",
  "wood_unfinished",
  "ceramic_or_porcelain",
  "glass",
  "fabric_or_upholstery",
  "paper_or_fiber",
  "composite_or_other",
]);
const mounting = z.enum([
  "wall_mounted",
  "ceiling_mounted",
  "freestanding_floor",
  "tabletop_or_counter",
  "recessed_or_built_in",
  "handheld_portable",
]);
const command = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("observe"),
    place_label: z.string().trim().min(1),
    canonical_class: z.string().trim().min(1),
    material,
    mounting,
    visible_verbatim_text: z.string(),
    description: z.string().trim().min(1),
    visible_tag_code: z.string(),
    user_label: z.string(),
  }),
  z.object({
    operation: z.literal("commit"),
    object_id: z.string().uuid(),
    title: z.string().trim().min(1),
    claim: z.string().trim().min(1),
    confidence: z.enum(["low", "medium", "high"]),
    intent: z.string(),
    next_question: z.string(),
  }),
  z
    .object({
      operation: z.literal("ask"),
      object_id: z.string(),
      place_label: z.string(),
      visible_tag_code: z.string(),
      description: z.string(),
    })
    .refine(
      (value) =>
        !!(
          value.object_id.trim() ||
          value.place_label.trim() ||
          value.visible_tag_code.trim() ||
          value.description.trim()
        ),
      "Provide an object ID, place, tag, or description.",
    ),
]);

function errorResponse(error: unknown) {
  if (error instanceof z.ZodError)
    return Response.json({ error: "Check the required demo fields." }, { status: 400 });
  const message =
    error instanceof LociError
      ? error.message
      : "Unable to reach 0xL0C1 or its Ambiguous event store.";
  return Response.json({ error: message }, { status: 502 });
}

export async function GET() {
  try {
    return Response.json(await readLociState(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = command.parse(await request.json());
    if (input.operation === "commit") {
      const { operation: _operation, claim, confidence, ...rest } = input;
      return Response.json(
        await callLoci("commit", {
          ...rest,
          claims: [{ text: claim, confidence }],
          save: true,
        }),
      );
    }
    const { operation, ...values } = input;
    return Response.json(await callLoci(operation, values));
  } catch (error) {
    return errorResponse(error);
  }
}
