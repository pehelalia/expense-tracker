import { supabase } from "../lib/supabase";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

// inside useExpenses or a new useProfile hook:
const { user, isAuthenticated } = useAuth0();

useEffect(() => {
  if (isAuthenticated && user) {
    syncUserToSupabase(user);
  }
}, [isAuthenticated, user]);

async function syncUserToSupabase(auth0User) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", auth0User.sub)
    .single();

  // If user doesn't exist yet, insert them
  if (!data) {
    await supabase.from("profiles").insert({
      id: auth0User.sub,           // Auth0's unique user ID
      username: auth0User.nickname ?? auth0User.name,
      avatar_url: auth0User.picture,
      onboarding_done: false,
    });
  }
}