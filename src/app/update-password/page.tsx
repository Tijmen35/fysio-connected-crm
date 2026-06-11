"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // When a user clicks an invite link, Supabase redirects them to /update-password (if configured so, or #access_token)
    // The supabase client automatically extracts the session from the URL hash.
    // If there is no session, they shouldn't be here.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Ongeldige of verlopen link. Vraag een nieuwe uitnodiging aan.");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens lang zijn.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Password updated successfully. Now redirect to MFA setup!
    router.push("/mfa");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 text-2xl">
            <i className="fa-solid fa-key"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Kies een wachtwoord</h1>
          <p className="text-slate-500 mt-2">Je account is bijna klaar. Stel een veilig wachtwoord in.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nieuw wachtwoord</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-primary focus:border-primary"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !!error.includes("Ongeldige")}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Opslaan & Doorgaan"}
          </button>
        </form>
      </div>
    </div>
  );
}
