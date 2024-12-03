import React from "react";
import { Link } from "react-router-dom";
import { FaHome, /* FaCog, FaQuestionCircle */ } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="bg-white p-4 shadow-top-md md:shadow-md md:fixed md:top-0 md:w-full md:bottom-auto bottom-0 w-full fixed z-[200]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link to="/">🚥</Link>
        </div>
        <div className="ml-auto flex space-x-8">
          <Link
            to="/"
            className="text-black hover:text-gray-200 transition duration-300 flex items-center"
          >
            <FaHome className="mr-2" /> Home
          </Link>
          {/* <Link
            to="/help"
            className="text-black hover:text-gray-200 transition duration-30 flex items-center"
          >
            <FaQuestionCircle className="mr-2" /> Help
          </Link>
          <Link
            to="/settings"
            className="text-black hover:text-gray-200 transition duration-300 flex items-center"
          >
            <FaCog className="mr-2" /> Settings
          </Link> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
