import AppFrame from "@assets/app_frame.png";
import ShieldCheck from "@assets/icons/check.png";
import Coins from "@assets/icons/coins.png";
import Frames from "@assets/frames.png";
import HeroImage from "@assets/hero.png";
import Phone from "@assets/phone.png";
import StoreLinks, { BtnTypes } from "@components/common/StoreLinks";
import Section_divider from "@components/custom_shapes/Section_divider";
import Images from '@constants/images';

function Features() {
  return (
    <>
      <div className="relative">
        {/* ---------- Background image ----------- */}
        <img
          src={Images.Banner1}
          alt="Banner"
          className="absolute left-0 top-0 z-0 h-full w-full object-cover"
        />

        <section className="container relative z-10 mt-4 flex h-auto flex-col items-center gap-6 px-6 sm:gap-8 md:flex-row md:gap-4 lg:px-10 xl:m-auto xl:gap-0 xl:overflow-hidden">
          {/* Text and glassmorphism effect */}
          <div className="bg-white rounded-lg bg-opacity-30 p-6 text-center shadow-lg shadow-blue-600 backdrop-blur-lg sm:w-full md:w-1/2 md:text-left">
            <h1 className="text-3xl font-semibold text-blue-500 sm:text-4xl md:text-5xl">
              <span className="text-amber-500">Receive payments</span> the smart
              way
            </h1>
            <p className="mt-4 text-slate-300 md:max-w-md">
              Manage your finances anywhere with Nordea Remittance, designed for
              cross-border transactions.
            </p>
            <div className="mt-6">
              <StoreLinks type={BtnTypes.Standard} />
            </div>
          </div>

          {/* Phone images */}
          <div className="relative flex justify-center md:w-1/2">
            <img
              className="max-w-xs sm:max-w-md xl:max-w-lg"
              src={Phone}
              alt="App interface"
            />
            {/* <img
        className="hidden xl:block absolute top-1/2 left-6 transform -translate-y-1/2 w-72 rounded-2xl"
        src={HeroImage}
        alt="App user"
      /> */}
          </div>
        </section>
      </div>

      <div className="relative">
        {/* Divider positioned behind content */}
        <div className="absolute left-0 top-0 z-0  w-full">
          <Section_divider />
        </div>

        {/* Main section with content */}
        <section
          id="features"
          className="container relative z-10 flex flex-col gap-8 px-6 pt-8 lg:px-10 xl:m-auto xl:pt-16"
        >
          <article className="text-gray-400 m-auto w-[25ch] text-center md:m-0 md:w-full">
            <h2 className="text-gray-700 mb-3 text-3xl font-semibold">
              Make every penny count
            </h2>
            <p className="text-sm">
              Spend smarter, lower your bills, get cashback on everything you
              buy,
              <br />
              and unlock credit to grow your business.
            </p>
          </article>

          <article className="flex w-full flex-col gap-6 overflow-hidden xl:h-96 xl:flex-row">
            <div className="flex flex-col rounded-2xl bg-slate-100 px-4 sm:px-0 md:flex-row md:gap-6 xl:w-2/3">
              <div className="mt-8 flex flex-col justify-center gap-4 text-center sm:mx-8 md:mx-0 md:ml-8 md:w-1/2 md:text-left">
                <h2 className="text-gray-700 m-auto text-center text-2xl font-semibold sm:w-[16ch] md:m-0 md:text-left">
                  Receive Pay with{" "}
                  <span className="text-lime-500">Nordea Remittance,</span>{" "}
                  quick, simple and easy
                </h2>
                <p className="text-gray-500 m-auto text-center sm:w-[30ch] md:m-0 md:text-left">
                  International payments have never been easier, whether it's a
                  Partnership, Brand collab, or Asset purchase. Just submit your
                  payment details, and we'll get you covered.
                </p>
              </div>

              <div className="m-auto mt-8 max-w-72 md:mx-8 md:w-1/2 lg:mx-0">
                <img src={AppFrame} alt="Kobodrop app frame" />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 rounded-2xl bg-slate-200 p-8 xl:w-1/3">
              <div className="w-fit rounded-full bg-slate-300 p-4">
                <img src={ShieldCheck} alt="Shield Check" />
              </div>
              <h2 className="text-gray-700 text-2xl font-semibold">
                Bank-level security
              </h2>
              <p className="text-gray-500 text-sm">
                Your money is 100% safe and secure with our swift remittance. No
                hassles, no glitches, get access to your money anytime.
              </p>
            </div>
          </article>

          <article className="flex w-full flex-col gap-6 xl:h-96 xl:flex-row">
            <div className="flex flex-col justify-center gap-4 rounded-2xl  bg-slate-200 p-8 xl:w-1/3">
              <div className="w-fit rounded-full bg-slate-300 p-4">
                <img src={Coins} alt="Coins" />
              </div>
              <h2 className="text-gray-700 text-2xl font-semibold">
                Cost reduction
              </h2>
              <p className="text-gray-500 text-sm">
                Nordea reduces payment maintenance and processing fees. No time
                wasted!
              </p>
            </div>

            <div className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-slate-100 px-4 sm:px-0 md:flex-row md:gap-6 xl:w-2/3">
              <div className="mt-8 flex flex-col justify-center gap-4 text-center sm:mx-8 md:mx-0 md:ml-8 md:mt-0 md:w-1/2 md:text-left">
                <h2 className="text-gray-700 m-auto text-center text-2xl font-semibold sm:w-[16ch] md:m-0 md:text-left">
                  Send, <span className="text-blue-500">receive,</span> and
                  exchange money
                </h2>
                <p className="text-gray-500 m-auto text-center sm:w-[30ch] md:m-0 md:text-left">
                  Transfers and payments all work on Nordea business remittance.
                  Verify your Payment Account and get your alert message
                  immediately after a completed transaction.
                </p>
              </div>

              <div className="m-auto max-w-96 md:mt-32 md:w-1/2">
                <img
                  src={Frames}
                  alt="Frame displaying logos of various payment solutions"
                />
              </div>
            </div>
          </article>
        </section>
      </div>
    </>
  );
}

export default Features;
