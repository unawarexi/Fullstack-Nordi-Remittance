import React, { useState } from "react";
import MegaNavbar from "./MegaNavbar";

// Define the navbar items
const navbarItems = [
  { label: "Home", href: "/" },
  { label: "Personal", href: "/personal" },
  { label: "Business", href: "/business" },
  { label: "Corporate", href: "/corporate" },
  { label: "Private", href: "/private" },
  { label: "Ways to Bank", href: "/ways-to-bank" },
  { label: "Contact Us", href: "/contact" },
  { label: "I am...", href: "/iam" },
];

const NavbarItems = () => {
  const [activeItem, setActiveItem] = useState(null); // For tracking active nav item

  return (
    <div className="relative">
      <nav className="flex flex-wrap items-center justify-center text-base">
        {navbarItems.map((item, index) => (
          <div key={index} className="relative group">
            <a
              href={item.href}
              className={`mr-5 hover:text-gray-900 group-hover:underline transition-all duration-200 ${
                activeItem === index ? "text-amber-500 underline" : ""
              }`}
              onMouseEnter={() => setActiveItem(index)} // Set active on hover
              // Reset when mouse leaves
            >
              {item.label}
            </a>

            {/* MegaNavbar will appear on hover */}
            {activeItem === index && (
              <div className="absolute left-0 w-full top-full">
                <MegaNavbar activeItem={item.label}   />
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default NavbarItems;
