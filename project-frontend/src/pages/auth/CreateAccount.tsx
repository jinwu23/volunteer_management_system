import CreateAccountModal from "../../components/CreateAccountModal";
import { sendPostRequest } from "../../utils/sendPostRequest";

function CreateAccount() {
  const handleCreateAccount = async (credentials: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    console.log("Creating account:", credentials);
    const response = await sendPostRequest("/api/auth/register", credentials);

    if (response.type === "success") {
      console.log("Account created successfully!");
    } else {
      throw new Error(
        response.message || "Account creation failed. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-12 bg-primary">
      <CreateAccountModal onSubmit={handleCreateAccount} />
    </div>
  );
}

export default CreateAccount;
