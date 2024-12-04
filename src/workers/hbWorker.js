// web worker for notifying backend that app is still active,
// so that the lights can be turned off in the backend when the frontend is closed
const createHeartbeatWorker = (url = "http://localhost:5000/heartbeat", interval = 10000) => {
  // uses blob as a workaround to use web worker
  // without having to npm eject and mess with webpack config in CRA project
  const workerBlob = new Blob(
    [
      `
      const heartbeatInterval = ${interval};

      const sendHeartbeat = async () => {
        try {
          await fetch("${url}", { method: "POST" });
        } catch (error) {
          console.error("Error sending heartbeat:", error);
        }
      };

      const startHeartbeat = () => {
        const heartbeat = async () => {
          await sendHeartbeat();
          setTimeout(heartbeat, heartbeatInterval);
        };

        heartbeat();
      };

      startHeartbeat();
    `,
    ],
    { type: "application/javascript" }
  );

  return new Worker(URL.createObjectURL(workerBlob));
};

export default createHeartbeatWorker;
