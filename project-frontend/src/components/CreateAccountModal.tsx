import { useState } from "react";
import { useNavigate } from "react-router";

type CreateAccountCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type CreateAccountModalProps = {
  onSubmit: (credentials: CreateAccountCredentials) => Promise<void>;
};

function CreateAccountModal({ onSubmit }: CreateAccountModalProps) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await onSubmit({ firstName, lastName, email, password });
      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Account creation failed. Please try again."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-secondary p-8 rounded-lg shadow-lg w-96">
        {/* Create Account Title */}
        <h2 className="text-2xl font-semibold text-center mb-4 text-dark-text">
          Create Account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div className="flex justify-between gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-dark-text">
                First Name
              </label>
              <input
                type="text"
                className="mt-1 p-2 w-full border rounded-md text-dark-text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-dark-text">
                Last Name
              </label>
              <input
                type="text"
                className="mt-1 p-2 w-full border rounded-md text-dark-text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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
                  className="mr-2 text-dark-text"
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

          {/* Login Redirect Section */}
          <div className="text-center mt-4 text-dark-text">
            <p>
              Already have an account?
              <button
                type="button"
                className="underline ml-1"
                onClick={handleLoginRedirect}
              >
                Login
              </button>
            </p>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full bg-background-dark text-light-text p-2 rounded-md disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountModal;
