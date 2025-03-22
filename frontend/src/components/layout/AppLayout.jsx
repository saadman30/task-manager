import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { TaskAPI } from "../../services/api";
import { handleError, AppError, ErrorSeverity } from '../../utils/errorHandler';
import Button from "../ui/Button";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = async () => {
    try {
      await TaskAPI.logout();
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      handleError(new AppError('Failed to logout', ErrorSeverity.ERROR), 'logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/tasks" className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <span className="text-xl font-bold text-gray-900">
                  Task Manager
                </span>
              </Link>

              <div className="hidden sm:flex space-x-4">
                <Link
                  to="/tasks"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                {/* Add more navigation items here */}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.[0] || user?.email?.[0] || "?"}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.role || "User"}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
