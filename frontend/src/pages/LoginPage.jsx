import { useState } from "react";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const emailNormalized = email.trim().toLowerCase();

    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: emailNormalized, password }),
  });

  let data = {};
  const text = await res.text();

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Unknown server response" };
  }

  if (!res.ok) {
    setError(data.message || `Login failed (${res.status})`);
    return;
  }

  window.location.assign("/");
} catch {
  setError("Unable to connect to server. Please try again.");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm tracking-[0.25em] uppercase text-[#8A5A5D]">
            TrendyThreads
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[#111]">
            Login to your account
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Welcome back. Please enter your details.
          </p>
        </div>

        <div className="border border-[#E5E5E5] bg-white p-8">
          {error && (
            <div className="mb-5 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#111] mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#D9D9D9] pl-10 pr-3 py-3 text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#111]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#111] mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#D9D9D9] pl-10 pr-3 py-3 text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#111]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8A5A5D] text-white py-4 font-semibold tracking-wide hover:bg-[#70464A] transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Not a member?{" "}
            <a
              href="/signup"
              className="font-medium text-[#8A5A5D] hover:text-[#70464A]"
            >
              Sign up now <ArrowRight className="inline h-4 w-4" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;