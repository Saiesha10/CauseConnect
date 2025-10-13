// functions/on_cause_created/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  try {
    const { creatorUid, title } = await req.json();
    if (!creatorUid || !title) {
      return new Response(JSON.stringify({ error: "Missing creatorUid or title" }), { status: 400 });
    }

    const mutation = `
      mutation($userId: String!, $causeId: uuid!, $message: String!) {
        insert_notifications_one(
          object: { user_id: $userId, cause_id: $causeId, message: $message }
        ) {
          id
        }
      }
    `;

    const res = await fetch("https://lasting-bream-91.hasura.app/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "x-hasura-admin-secret": Deno.env.get("HASURA_ADMIN_SECRET") || ""
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          userId: creatorUid,
          causeId: crypto.randomUUID(), // Or pass the actual causeId if available
          message: `New cause created: ${title}`
        }
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

