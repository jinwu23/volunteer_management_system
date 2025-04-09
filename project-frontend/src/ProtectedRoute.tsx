import PropTypes from "prop-types";
import { Navigate } from "react-router";
import { UserData } from "./types/types";

export function ProtectedRoute(props: {
  authToken: any;
  userData: UserData | null;
  requireAdmin: boolean;
  children: any;
}) {
  // Login protection
  if (!props.authToken) {
    return <Navigate to="/login" replace />;
  }
  // Admin protection
  if (props.userData && props.userData.type !== "admin" && props.requireAdmin) {
    return <Navigate to="/login" replace />;
  }

  return props.children;
}
