import { useState } from "react";
import { Edit2 } from "lucide-react";
import { UserData } from "../types/types";

type EditingStateType = {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
};

type EditCredentials = {
  firstName: string;
  lastName: string;
  email: string;
};

type UserInformationModalProps = {
  userData: UserData;
  onSubmit: ({ firstName, lastName, email }: EditCredentials) => Promise<void>;
};

function UserInformationModal({
  userData,
  onSubmit,
}: UserInformationModalProps) {
  const [isEditing, setIsEditing] = useState<EditingStateType>({
    firstName: false,
    lastName: false,
    email: false,
  });
  const [formData, setFormData] = useState<EditCredentials>({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
  });
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (field: keyof EditCredentials, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEdit = (field: keyof EditingStateType) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await onSubmit(formData);
      setIsEditing({
        firstName: false,
        lastName: false,
        email: false,
      });
    } catch (err) {
      setError("Failed to update user information. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md mb-8">
      {/* User Information */}
      <h2 className="text-2xl font-semibold text-center mb-6 text-dark-text">
        User Information
      </h2>

      <form onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-text mb-1">
            First Name
          </label>
          <div className="flex items-center">
            {isEditing.firstName ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleEdit("firstName", e.target.value)}
                className="p-2 flex-1 border rounded-md mr-2 text-dark-text"
              />
            ) : (
              <span className="p-2 flex-1 text-dark-text">
                {formData.firstName}
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleEdit("firstName")}
              className="p-2 text-dark-text"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-text mb-1">
            Last Name
          </label>
          <div className="flex items-center">
            {isEditing.lastName ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleEdit("lastName", e.target.value)}
                className="p-2 flex-1 border rounded-md mr-2 text-dark-text"
              />
            ) : (
              <span className="p-2 flex-1 text-dark-text">
                {formData.lastName}
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleEdit("lastName")}
              className="p-2 text-dark-text"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-text mb-1">
            Email
          </label>
          <div className="flex items-center">
            {isEditing.email ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleEdit("email", e.target.value)}
                className="p-2 flex-1 border rounded-md mr-2 text-dark-text"
              />
            ) : (
              <span className="p-2 flex-1 text-dark-text">
                {formData.email}
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleEdit("email")}
              className="p-2 text-dark-text"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Confirm Changes */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-background-dark text-light-text px-6 py-2 rounded-md mt-4"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserInformationModal;
