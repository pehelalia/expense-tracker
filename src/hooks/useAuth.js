import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * useAuth — Manages authentication state with Supabase
 *
 * Returns:
 *   loading      — Boolean indicating if auth state is being fetched
 *   session      — User session object or null
 *   user         — User object with id, email, user_metadata (includes username, initials)
 *   signUp       — Async function to create account: (email, password, username) => Promise
 *   signIn       — Async function to login: (email, password) => Promise
 *   signOut      — Async function to logout: () => Promise
 *   error        — Error message if auth operation failed, null otherwise
 */
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // ── Initialize auth state on mount ───────────────────────────────────
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        if (data.session?.user) {
          setUser(formatUser(data.session.user));
        }
      } catch (err) {
        console.error("Failed to get session:", err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // ── Listen for auth changes ──────────────────────────────────────
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        setSession(sess);
        if (sess?.user) {
          setUser(formatUser(sess.user));
        } else {
          setUser(null);
        }
        setError(null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ── Format user object with initials ─────────────────────────────────
  const formatUser = (authUser) => {
    const username = authUser.user_metadata?.username || authUser.email?.split("@")[0] || "User";
    const email = authUser.email || "";
    
    // Calculate initials from username or email
    const initials = (username || email)
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");

    return {
      id: authUser.id,
      email,
      username,
      initials: initials || "U",
    };
  };

  // ── Sign up ──────────────────────────────────────────────────────────
  const signUp = useCallback(async (email, password, username) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split("@")[0],
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err.message || "Sign up failed";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ── Sign in ──────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err.message || "Sign in failed";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ── Sign out ─────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
    } catch (err) {
      const errorMessage = err.message || "Sign out failed";
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    loading,
    session,
    user,
    signUp,
    signIn,
    signOut,
    error,
  };
}
