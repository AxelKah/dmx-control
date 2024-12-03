import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./views/Main";
import HelpPage from "./views/Help";
import Nav from "./components/Nav";
import DebugPage from "./views/DebugPage";
import LightsProvider from "./contexts/lightsContext";
import { sendHeartbeat } from "./api/dmxApi";

const App = () => {
  useEffect(() => {
    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);

  return (
    <LightsProvider>
      <Router>
        <Nav />
        <main className="pt-0 pb-4 2xl:pb-0 md:pt-16">
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
