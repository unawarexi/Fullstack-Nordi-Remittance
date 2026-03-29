import React, { useState } from "react";
import SubNavItem from "@components/navbar_components/SubNavBar";
import NavbarItems from "@components/navbar_components/NavbarItems";
import Images from '@constants/images';
import InternetBankingSideBar from "@components/navbar_components/InternetBankingSideBar";
import { BsSearch } from "react-icons/bs";
import { CiLock } from "react-icons/ci";
// import { boolean } from "yup";

const RemitNavBar = () => {
  const [HoverActive, setHoverActive] = useState(false);

  const toggleHover = (isHovered : boolean) => {
    setHoverActive(isHovered);
  };

  return (
    <>
      <section className="fixed z-[90] w-full">
        {/* --------------------- FIRST NAVBAR --------------- */}
        <div className="w-full bg-slate-200 dark:bg-neutral-900">
          <SubNavItem />
        </div>

        {/* ---------------- Main NavBar ---------------- */}
        <header className="body-font text-gray-600 dark:text-neutral-300 bg-slate-50 dark:bg-neutral-800">
          <div className="container mx-auto flex flex-col flex-wrap items-center p-5 md:flex-row">
            {/* ---------------- Remit Logo ---------------- */}
            <a className="title-font text-gray-900 dark:text-white mb-4 flex items-center font-medium md:mb-0">
              <img
                src={Images.headerLogo}
                alt="Nordea"
                className=" w-40 px-2"
              />
              {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              className="h-10 w-10 rounded-full bg-indigo-500 p-2 text-white"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl font-bold text-blue-500">Nordea</span> */}
            </a>

            
            <div className=" flex w-full max-w-6xl ">
              {/* ---------------- Navigation Items ---------------- */}
            <div className="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
              <NavbarItems />
            </div>

            {/* ---------------- Search Section ---------------- */}
            <div className="relative mt-4 w-full max-w-sm md:mt-0">
              <div className="bg-gray-300 dark:bg-neutral-600 absolute left-3 top-1/2 -translate-y-1/2 transform rounded-full p-2">
                <BsSearch className="text-gray-600 dark:text-neutral-300" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search..."
                className="border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-400 focus:border-transparent w-full rounded-full border py-2 pl-12 pr-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            </div>
           

            {/* ---------------- CTA Button ---------------- */}
            <button
              onMouseEnter={() => toggleHover(true)}
              className="border-gray-300 focus:ring-gray-300 fixed right-5 mt-4 flex items-center  space-x-2 rounded-lg border bg-blue-700 px-4 py-2 text-base text-slate-50 transition-all duration-300 hover:bg-zinc-200 focus:outline-none focus:ring-2 md:mt-0"
            >
              <CiLock className="text-lg" />
              <span>Internet Banking</span>
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                className="ml-2 h-4 w-4"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </header>
      </section>

      <div onMouseLeave={() => toggleHover(false)}>
        {/* Conditionally render the sidebar based on hover state */}
        {HoverActive && <InternetBankingSideBar />}
      </div>
    </>
  );
};

export default RemitNavBar;
