import { Link } from "react-router";
import { UserData } from "../types/types";
import UserInformationModal from "../components/UserInformationModal";
import { sendPostRequest } from "../utils/sendPostRequest";

type ProfileProps = {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  authToken: any;
};

type EditCredentials = {
  firstName: string;
  lastName: string;
  email: string;
};

function Profile({ userData, setUserData, authToken }: ProfileProps) {
  const safeUserData = userData as UserData;
  const safeToken = authToken as string;

  async function handleEdit({ email, firstName, lastName }: EditCredentials) {
    const id = safeUserData.id;

    try {
      console.log("Editing user data:", email);
      const response = await sendPostRequest(
        "/api/user/edit",
        {
          id,
          email,
          firstName,
          lastName,
        },
        safeToken
      );

      if (response.type === "success") {
        if (response.data) {
          setUserData(response.data.data);
        }
        return;
      } else {
        throw new Error(response.message || "Edit failed. Please try again.");
      }
    } catch (error) {
      console.error("Editing error:", error);
      throw error;
    }
  }

  return (
    <div className="bg-primary min-h-screen">
      <div className="flex flex-col items-center px-4">
        <h1 className="mt-8 mb-6 text-4xl text-dark-text font-semibold">
          Profile
        </h1>

        <UserInformationModal userData={safeUserData} onSubmit={handleEdit} />

        {/* Stats */}
        <div className="bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-dark-text">
            Your Impact
          </h2>
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-dark-text">
                {safeUserData.totalHours}
              </p>
              <p className="text-sm text-gray-text">Total Hours</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-dark-text">
                {safeUserData.totalEvents}
              </p>
              <p className="text-sm text-gray-text">Events Attended</p>
            </div>
          </div>
        </div>

        {/* Past Events Button */}
        <Link
          to="/past-events"
          className="bg-background-dark text-light-text px-6 py-3 rounded-md mb-16"
        >
          View Past Events
        </Link>
      </div>
    </div>
  );
}

export default Profile;
