import { useState } from "react";
import { useNavigate } from "react-router";

type LoginCredentials = {
  email: string;
  password: string;
};

type LoginModalProps = {
  onSubmit: ({ email, password }: LoginCredentials) => Promise<void>;
};

function LoginModal({ onSubmit }: LoginModalProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await onSubmit({ email, password });
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-secondary p-8 rounded-lg shadow-lg w-96">
        {/* Login Title */}
        <h2 className="text-2xl font-semibold text-center mb-4 text-dark-text">
          Login
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email Section */}
          <div>
            <label className="block text-sm font-medium text-dark-text">
              Email
            </label>
            <input
              type="email"
              className="mt-1 p-2 w-full border rounded-md text-dark-text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password Section */}
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-dark-text">
                Password
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  className="mr-2"
                  onChange={() => setPasswordVisible(!passwordVisible)}
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-dark-text"
                >
                  Show Password
                </label>
              </div>
            </div>
            <input
              type={passwordVisible ? "text" : "password"}
              className="mt-1 p-2 w-full border rounded-md text-dark-text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {/* Create Account Section */}
          <div className="text-center mt-4 text-dark-text">
            <p>
              Don't have an account?
              <button
                type="button"
                className=" underline ml-1"
                onClick={() => navigate("/create-account")}
              >
                Create Account
              </button>
            </p>
          </div>
          {/* Login */}
          <button
            type="submit"
            className="w-full bg-background-dark text-light-text p-2 rounded-md disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
