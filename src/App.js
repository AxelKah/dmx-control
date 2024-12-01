import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./views/Main";
import HelpPage from "./views/Help";
import Nav from "./components/Nav";
import DebugPage from "./views/DebugPage";
import LightsProvider from "./contexts/lightsContext";
import { stopCycle, clearLights } from "./api/dmxApi";

const App = () => {
  // to stop stuff on tab/window close but not on refresh
  const isPageRefresh = () => {
    const [navigationEntry] = performance.getEntriesByType("navigation");
    return navigationEntry && navigationEntry.type === "reload";
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      if (!isPageRefresh()) {
        // with true to use beacon
        stopCycle(true);
        clearLights(true);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return (
    <LightsProvider>
      <Router>
        <Nav />
        <main className="md:py-16 py-0">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/debugpage" element={<DebugPage />} />
          </Routes>
        </main>
      </Router>
    </LightsProvider>
  );
};

export default App;
