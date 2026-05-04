import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
