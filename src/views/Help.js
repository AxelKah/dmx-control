import React from "react";
import { FaInfoCircle } from "react-icons/fa";

function HelpPage() {
  // TODO: write help guide that explains how to use the app etc.

  return (
    <>
      <section class="flex items-center justify-center">
        <article class="bg-white rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-md m-4 max-w-3xl">
          <header>
            <span class="inline-flex items-center justify-center p-2 bg-slate-700 rounded-md shadow-lg">
              <FaInfoCircle className="text-white" />
            </span>
            <h3 class="text-slate-900 mt-5 text-base font-medium tracking-tight">
              How to use
            </h3>
          </header>
          <p class="text-slate-500 mt-2 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </article>
      </section>
    </>
  );
}

export default HelpPage;
