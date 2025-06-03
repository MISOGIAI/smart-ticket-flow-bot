import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center p-8 max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
            <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
