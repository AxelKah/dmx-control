import React, { useState } from "react";
import SetupLights from "./SetupLights";

const LightModal = ({
  showModal,
  setShowModal,
  addLight,
  errorMessage,
  setErrorMessage,
  modalContent,
  handleFinishSetup,
  lights,
}) => {
  const [newLightId, setNewLightId] = useState("");
  const [newLightChannels, setNewLightChannels] = useState("");
  const [newStartAddress, setNewStartAddress] = useState("");

  const isStartAddressTaken = (startAddress, lights) => {
    const existingLight = lights.find(
      (light) =>
        startAddress >= light.startAddress &&
        startAddress < light.startAddress + light.channel
    );

    if (existingLight) {
      const channelRange = `${existingLight.startAddress}-${
        existingLight.startAddress + existingLight.channel - 1
      }`;
      return {
        taken: true,
        message: (
          <>
            {`Start Address `}
            <strong>{startAddress}</strong>
            {` is already occupied by a light with `}
            <strong>{existingLight.channel}</strong>
            {` channels.`}
            <br />
            {`Occupied Start Address/Channel range: `}
            <strong>{channelRange}</strong>
            {`.`}
          </>
        ),
      };
    }

    return { taken: false, message: "" };
  };
  const handleStartAddressChange = (e) => {
    const startAddress = parseInt(e.target.value);
    setNewStartAddress(e.target.value);
    if (!isNaN(startAddress)) {
      const { taken, message } = isStartAddressTaken(startAddress, lights);
      if (taken) {
        setErrorMessage(message);
      } else {
        setErrorMessage("");
      }
    } else {
      setErrorMessage("");
    }
  };

  const handleModalSubmit = () => {
    console.log("submitting");
    const id = parseInt(newLightId);
    const channel = parseInt(newLightChannels);
    const startAddress = parseInt(newStartAddress);
    if (!isNaN(channel) && !isNaN(startAddress)) {
      const existingLight = lights.find(
        (light) =>
          startAddress >= light.startAddress &&
          startAddress < light.startAddress + light.channel
      );
      if (existingLight) {
        setErrorMessage(
          `A light with startAddress ${startAddress} already exists.`
        );
      } else {
        addLight(channel, startAddress);
        setShowModal(false);
        setNewLightId("");
        setNewLightChannels("");
        setNewStartAddress("");
        setErrorMessage("");
      }
    } else {
      setErrorMessage(
        "Please enter valid values for id, channel, and start address."
      );
    }
  };

  return (
    showModal && (
      <div className="modal">
        <div className="modal-content">
          {modalContent === "addLight" && (
            <>
              <h2>Add New Light</h2>
              <br />
              <label>
                Number of Channels:
                <input
                  type="number"
                  value={newLightChannels}
                  onChange={(e) => setNewLightChannels(e.target.value)}
                  min="1"
                />
              </label>
              <br />
              <label>
                Start Address:
                <input
                  type="number"
                  value={newStartAddress}
                  onChange={handleStartAddressChange}
                  min="1"
                />
              </label>
              <br />
              {errorMessage && <p className="error">{errorMessage}</p>}
              <button onClick={handleModalSubmit} disabled={!!errorMessage}>
                Submit
              </button>
            </>
          )}
          {modalContent === "setupLights" && (
            <>
              <SetupLights
                onClose={() => setShowModal(false)}
                onFinish={handleFinishSetup}
              />
            </>
          )}
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      </div>
    )
  );
};

export default LightModal;
