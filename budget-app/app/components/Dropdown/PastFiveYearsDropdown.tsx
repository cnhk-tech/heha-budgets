'use client';

import { useState } from "react";

const PastFiveYearsDropdown = ({ updateActiveYear }: { updateActiveYear: (year: number) => void }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Get the current year and generate past 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setIsOpen(false); // Close the dropdown after selecting
    updateActiveYear(year);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <div>
        <button
          onClick={toggleDropdown}
          className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="dropdown-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {selectedYear ? `${selectedYear}` : "Select Year"}
          <svg
            className={`-mr-1 ml-2 h-5 w-5 transform ${
              isOpen ? "rotate-180" : "rotate-0"
            } transition-transform`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.879a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-button"
        >
          <div className="py-1">
            {years.map((year) => (
              <button
                key={year}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                role="menuitem"
                onClick={() => handleSelectYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Close the dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={closeDropdown}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default PastFiveYearsDropdown;
