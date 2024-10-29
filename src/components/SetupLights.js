import React, { useState } from "react";

const SetupLights = ({ onClose, onFinish }) => {

    const [step, setStep] = useState(0);
    const [lightCount, setlightCount] = useState("");
    const [selectedSides, setSelectedSides] = useState({
        left: false,
        right: false,
        front: false,
        back: false,
    });
    const [sides, setSides] = useState({
        left: "",
        right: "",
        front: "",
        back: "",
    });

    const stepContent = [
        {
            title: "Welcome to Light Setup",
            content: "In this setup, we’ll guide you through the configuration of your lights. Click 'Next' to start.",
        },
        {
            title: "Step 1: How many lights?",
            content: "Please input the number of lights you have in total.",
            input: (
                <div>
                    <label htmlFor="lightCount">Number of lights:</label>
                    <input
                        type="text"
                        id="lightCount"
                        name="lightCount"
                        value={lightCount}
                        onChange={(e) => setlightCount(e.target.value)}
                    />
                </div>
            ),
        },
        {
            title: "Step 2: Select Sides",
            content: "Select which sides you want to configure lights for.",
            input: (
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedSides.left}
                            onChange={(e) =>
                                setSelectedSides({ ...selectedSides, left: e.target.checked })
                            }
                        />
                        Left
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedSides.right}
                            onChange={(e) =>
                                setSelectedSides({ ...selectedSides, right: e.target.checked })
                            }
                        />
                        Right
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedSides.front}
                            onChange={(e) =>
                                setSelectedSides({ ...selectedSides, front: e.target.checked })
                            }
                        />
                        Front
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedSides.back}
                            onChange={(e) =>
                                setSelectedSides({ ...selectedSides, back: e.target.checked })
                            }
                        />
                        Back
                    </label>
                </div>
            ),
        },
        {
            title: "Step 3: How many of the lights are on which side?",
            content: "Please input the number of lights on each side.",
            input: (
                <div>
                    {selectedSides.left && (
                        <div>
                            <label htmlFor="left">Left:</label>
                            <input
                                type="text"
                                id="left"
                                name="left"
                                value={sides.left}
                                onChange={(e) => setSides({ ...sides, left: e.target.value })}
                            />
                        </div>
                    )}
                    {selectedSides.right && (
                        <div>
                            <label htmlFor="right">Right:</label>
                            <input
                                type="text"
                                id="right"
                                name="right"
                                value={sides.right}
                                onChange={(e) => setSides({ ...sides, right: e.target.value })}
                            />
                        </div>
                    )}
                    {selectedSides.front && (
                        <div>
                            <label htmlFor="front">Front:</label>
                            <input
                                type="text"
                                id="front"
                                name="front"
                                value={sides.front}
                                onChange={(e) => setSides({ ...sides, front: e.target.value })}
                            />
                        </div>
                    )}
                    {selectedSides.back && (
                        <div>
                            <label htmlFor="back">Back:</label>
                            <input
                                type="text"
                                id="back"
                                name="back"
                                value={sides.back}
                                onChange={(e) => setSides({ ...sides, back: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Finish",
            content: "You're all set! Click 'Finish' to complete the setup.",
            summary: (
                <div>
                    <h3>Summary</h3>
                    <p><strong>Number of lights in total:</strong> {lightCount}</p>
                    <p><strong>Lights on Sides:</strong></p>
                    {selectedSides.left && <p>Left: {sides.left}</p>}
                    {selectedSides.right && <p>Right: {sides.right}</p>}
                    {selectedSides.front && <p>Front: {sides.front}</p>}
                    {selectedSides.back && <p>Back: {sides.back}</p>}
                </div>
            ),
        },
    ];

    // Go to the next step
    const handleNext = () => {
        setStep((prevStep) => (prevStep + 1 < stepContent.length ? prevStep + 1 : prevStep));
    };

    // Go to the previous step if needed
    const handleBack = () => {
        setStep((prevStep) => (prevStep > 0 ? prevStep - 1 : prevStep));
    };

    const handleFinish = () => {
        const collectedValues = {
            lightCount,
            sides,
        };
        //console.log("Finished! Collected values:", collectedValues);
        onFinish(collectedValues);
        onClose();

    };

    return (
        <div>
            <h2>{stepContent[step].title}</h2>
            <p>{stepContent[step].content}</p>
            {stepContent[step].input}
            {stepContent[step].summary}
            <div>
                {step > 0 && <button onClick={handleBack}>Back</button>}
                {step < stepContent.length - 1 && <button onClick={handleNext}>Next</button>}
                {step === stepContent.length - 1 && <button onClick={handleFinish}>Finish</button>}
            </div>
        </div>
    );
};

export default SetupLights;