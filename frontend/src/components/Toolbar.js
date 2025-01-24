import React, { useState } from "react";

const Toolbar = ({ addTile, addCircle }) => {
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
        <div style={{ paddingBottom:"10px" }}>
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
        </div>
    );
};

export default Toolbar;
