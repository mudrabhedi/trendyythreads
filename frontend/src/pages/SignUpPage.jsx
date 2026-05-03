import { useState } from "react";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  let data = {};
  const text = await res.text();

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Unknown response" };
  }

  if (!res.ok) {
    setError(data.message || "Signup failed");
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
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <p className="text-sm tracking-[0.25em] uppercase text-[#8A5A5D]">
            TrendyThreads
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[#111]">
            Create your account
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Join us and start shopping smarter.
          </p>
        </div>

        {/* CARD */}
        <div className="border border-[#E5E5E5] bg-white p-8">

          {error && (
            <div className="mb-5 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-[#111] mb-2">
                Full name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-[#D9D9D9] pl-10 pr-3 py-3 text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#111]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-[#111] mb-2">
                Email address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-[#D9D9D9] pl-10 pr-3 py-3 text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#111]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-[#111] mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full border border-[#D9D9D9] pl-10 pr-3 py-3 text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#111]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-[#111] mb-2">
                Confirm password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-[#D9D9D9] pl-10 pr-3 py-3 text-[#111] placeholder-gray-400 focus:outline-none focus:border-[#111]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* BUTTON */}
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
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign up
                </span>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-[#8A5A5D] hover:text-[#70464A]"
            >
              Login here <ArrowRight className="inline h-4 w-4" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;