import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./views/Main";
import HelpPage from "./views/Help";
import Nav from "./components/Nav";

function App() {
  return (
    <Router>
      <Nav />
      <main className="md:py-16 py-0">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
