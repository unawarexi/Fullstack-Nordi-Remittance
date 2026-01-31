import React from "react";
import { BsGlobe } from "react-icons/bs"; // You can replace this with any globe icon you like.// Importing the country data
import Countries from "@core/data/Countries";

const SubNavItem: React.FC = () => {
  const navItems = [
    "About Us",
    "Sustainable Banking",
    "Investor Relations",
    "Media",
    "Careers",
    "Branch & ATM Locator",
    "Market Rates",
    "HELP",
  ];

  return (
    <div className=" px-10 mx-auto flex flex-col md:flex-row items-center justify-between p-5 border-b border-gray-200">
      {/* Left - Navigation Items */}
      <div className="flex flex-wrap items-center space-x-6">
        {navItems.map((item, index) => (
          <a
            key={index}
            href={`#${item.replace(/\s+/g, "-").toLowerCase()}`} // Creating links dynamically
            className="text-gray-700 hover:text-green-600 transition-colors duration-300"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right - Country Selector */}
      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        <BsGlobe className="text-xl text-gray-600" />
        <select className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500">
          {Countries.map((country, index) => (
            <option key={index}>
              <span>{country.flag}</span> {country.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SubNavItem;
