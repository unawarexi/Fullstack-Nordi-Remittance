import Images from '@utils/constants/Image_strings';
import React from 'react';

const teamMembers = [
  {
    name: 'Holden Caulfield',
    role: 'Digital Banking Lead',
    image: Images.Team1,
  },
  {
    name: 'Henry Letham',
    role: 'Chief Technology Officer',
    image: Images.Team2,
  },
  {
    name: 'Oskar Blinde',
    role: 'Founder & CEO',
    image: Images.Team3,
  },
  {
    name: 'John Doe',
    role: 'Head of Banking Operations',
    image: Images.Team4,
  },
  {
    name: 'Martin Eden',
    role: 'Lead Software Engineer',
    image: Images.Team5,
  },
  {
    name: 'Boris Kitua',
    role: 'Financial Data Analyst',
    image: Images.Team2,
  },
  {
    name: 'Atticus Finch',
    role: 'Risk Management Specialist',
    image: Images.Team3,
  },
  {
    name: 'Alper Kamu',
    role: 'IT Infrastructure Manager',
    image: Images.Team1,
  },
  {
    name: 'Rodrigo Monchi',
    role: 'Product Manager',
    image: Images.Team4,
  },
];

const Team = () => {
  return (
    <section className="text-gray-600 body-font bg-[#f8f9fa] py-24">
      <div className="container px-5 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-4xl text-3xl font-bold title-font mb-4 text-[#4B4376]">
            Meet the Visionaries Behind Our Success
          </h1>
          <p className="lg:w-1/2 mx-auto leading-relaxed text-lg text-gray-700">
            Our team combines decades of experience in finance and technology to
            shape the future of banking. We're passionate about creating seamless,
            customer-focused solutions that empower businesses and individuals alike.
          </p>
        </div>
        <div className="flex flex-wrap -m-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="p-4 lg:w-1/3 md:w-1/2 w-full">
              <div className="h-full flex items-center bg-white shadow-lg p-6 rounded-lg transition-transform transform hover:scale-105">
                <img
                  alt="team"
                  className="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4"
                  src={member.image}
                />
                <div className="flex-grow">
                  <h2 className="text-gray-900 title-font font-medium text-lg">
                    {member.name}
                  </h2>
                  <p className="text-gray-500">{member.role}</p>
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
