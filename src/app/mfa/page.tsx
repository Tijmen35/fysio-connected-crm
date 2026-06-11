"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { setTrustedDeviceCookie } from "@/app/actions/auth";

export default function MFAPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  
  const hasChecked = useRef(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkMFAStatus();
    }
  }, []);

  const checkMFAStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const factors = data?.all || [];
    const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');
    const unverifiedFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'unverified');

    if (totpFactor) {
      // User is already enrolled, just needs to verify
      setFactorId(totpFactor.id);
      setIsEnrolling(false);
      setLoading(false);
    } else {
      // User needs to enroll
      setIsEnrolling(true);
      
      // Clean up any stale unverified factors first so we can generate a fresh QR code
      if (unverifiedFactor) {
        await supabase.auth.mfa.unenroll({ factorId: unverifiedFactor.id });
      }

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (enrollError) {
        setError("Kon MFA niet opzetten: " + enrollError.message);
        setLoading(false);
        return;
      }

      setFactorId(enrollData.id);
      setQrCode(enrollData.totp.qr_code);
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const verify = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: totpCode
      });

      if (verify.error) {
        throw verify.error;
      }

      // Verification successful!
      if (rememberDevice) {
        await setTrustedDeviceCookie();
      }

      router.push("/");
      router.refresh();

    } catch (err: any) {
      console.error("MFA Verify Error:", err);
      setError(err.message || "Ongeldige code. Probeer het opnieuw.");
      setLoading(false);
    }
  };

  if (loading && !qrCode && !factorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEnrolling ? "Beveilig je account" : "Tweestapsverificatie"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isEnrolling 
              ? "Scan de QR-code met een Authenticator App (zoals Google Authenticator of Authy) en vul de code in."
              : "Vul de 6-cijferige code in uit je Authenticator App om in te loggen."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm font-bold border border-red-200">
            {error}
          </div>
        )}

        {isEnrolling && qrCode && (
          <div className="bg-white p-4 border border-slate-200 rounded-xl flex justify-center mb-6">
            {qrCode.startsWith('data:image') ? (
              <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-center tracking-widest">VERIFICATIECODE</label>
            <input 
              type="text" 
              required
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border border-slate-200 rounded-xl p-4 text-center text-2xl tracking-[0.5em] focus:ring-primary focus:border-primary font-mono"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div className="flex items-center gap-2 justify-center py-2">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
              Vertrouw dit apparaat voor 30 dagen
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || totpCode.length !== 6}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Verifiëren"}
          </button>
        </form>
      </div>
    </div>
  );
}
