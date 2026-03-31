import Images from "@constants/images";
import React from "react";

const teamMembers = [
  {
    name: "Holden Caulfield",
    role: "Digital Banking Lead",
    image: Images.Team1,
  },
  {
    name: "Henry Letham",
    role: "Chief Technology Officer",
    image: Images.Team2,
  },
  {
    name: "Oskar Blinde",
    role: "Founder & CEO",
    image: Images.Team3,
  },
  {
    name: "John Doe",
    role: "Head of Banking Operations",
    image: Images.Team4,
  },
  {
    name: "Martin Eden",
    role: "Lead Software Engineer",
    image: Images.Team5,
  },
  {
    name: "Boris Kitua",
    role: "Financial Data Analyst",
    image: Images.Team2,
  },
  {
    name: "Atticus Finch",
    role: "Risk Management Specialist",
    image: Images.Team3,
  },
  {
    name: "Alper Kamu",
    role: "IT Infrastructure Manager",
    image: Images.Team1,
  },
  {
    name: "Rodrigo Monchi",
    role: "Product Manager",
    image: Images.Team4,
  },
];

const Team = () => {
  return (
    <section className="body-font bg-[#f8f9fa] py-24 text-gray-600 dark:text-neutral-300">
      <div className="container mx-auto px-5">
        <div className="mb-20 flex w-full flex-col text-center">
          <h1 className="title-font mb-4 text-3xl font-bold text-[#4B4376] sm:text-4xl">
            Meet the Visionaries Behind Our Success
          </h1>
          <p className="mx-auto text-lg leading-relaxed text-gray-700 dark:text-neutral-200 lg:w-1/2">
            Our team combines decades of experience in finance and technology to shape the future of banking. We're
            passionate about creating seamless, customer-focused solutions that empower businesses and individuals
            alike.
          </p>
        </div>
        <div className="-m-4 flex flex-wrap">
          {teamMembers.map((member, index) => (
            <div key={index} className="w-full p-4 md:w-1/2 lg:w-1/3">
              <div className="flex h-full transform items-center rounded-lg border-[1px] border-neutral-200 bg-white p-6 transition-transform hover:scale-105 dark:border-neutral-700 dark:bg-neutral-800">
                <img
                  alt="team"
                  className="mr-4 h-16 w-16 flex-shrink-0 rounded-full bg-gray-100 object-cover object-center dark:bg-neutral-700"
                  src={member.image}
                />
                <div className="flex-grow">
                  <h2 className="title-font text-lg font-medium text-gray-900 dark:text-white">{member.name}</h2>
                  <p className="text-gray-500 dark:text-neutral-400">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
