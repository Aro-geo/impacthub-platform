import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { record } = await req.json()
  const userId = record.id
  const grade = record.grade

  // map grade → difficulty
  const difficulty = grade >= 1 && grade <= 4 ? "beginner" : 
                    grade >= 5 && grade <= 8 ? "intermediate" : 
                    grade >= 9 && grade <= 12 ? "advanced" : "intermediate"

  const { error } = await supabase.from("learner_profiles").insert([
    { user_id: userId, preferred_difficulty: difficulty }
  ])

  if (error) return new Response(error.message, { status: 400 })
  return new Response("Learner profile created!", { status: 200 })
})