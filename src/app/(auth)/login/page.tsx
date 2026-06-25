// src/app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Email atau password salah");
    else router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy">
      <form onSubmit={handleSubmit} className="w-80 rounded-xl bg-white p-8 shadow-xl">
        <h1 className="mb-1 text-lg font-bold text-navy">MDA Sales Monitoring</h1>
        <p className="mb-6 text-sm text-slate-500">Masuk ke akun Anda</p>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2 text-sm"
        />
        <button type="submit" className="w-full rounded-lg bg-gold py-2 font-semibold text-navy">
          Masuk
        </button>
      </form>
    </main>
  );
}
