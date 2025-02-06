import React, { useState } from "react";

const Toolbar = ({ addTile, addCircle, selectPlayer, toggleDropdown }) => {
    const [tileInput, setTileInput] = useState("");

    const handleInputChange = (e) => {
        setTileInput(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && tileInput.trim() !== "") {
            addTile(tileInput);
            setTileInput("");  // Clear input after adding the tile
        }
    };

    return (
        <div style={{ paddingBottom: "10px" }}>
            {/* <button onClick={() => addTile(tileInput)}>Add Tile</button> */}
            <input
                type="text"
                id="tileInput"
                placeholder="Enter tile (e.g. 100A)"
                value={tileInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
            />
            <button class="addToken" onClick={addCircle}>Add Circle</button>

            <button
                className="addToken"
                id="dropdownButton"
                onClick={toggleDropdown}
            >
                Select Player
            </button>

            <div id="dropdownMenu" className="dropdown-menu hidden">
                {/* Wrap calls in arrow functions */}
                <div
                    className="dropdown-option"
                    onClick={() => selectPlayer("Gandalf")}
                >
                    Gandalf
                </div>
                <div
                    className="dropdown-option"
                    onClick={() => selectPlayer("Option 2")}
                >
                    Option 2
                </div>
                <div
                    className="dropdown-option"
                    onClick={() => selectPlayer("Option 3")}
                >
                    Option 3
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
