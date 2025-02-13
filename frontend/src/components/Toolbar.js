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
        <div>
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
                <div className="dropdown-option" onClick={() => selectPlayer("Gandalf")}>
                    Gandalf
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Beorn")}>
                    Beorn
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("TheGreatBear")}>
                    The Great Bear
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Freahild")}>
                    Freahild
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("CalaminthTook")}>
                    Calaminth Took
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Arwen")}>
                    Arwen
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Boromir")}>
                    Boromir
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Bilbo")}>
                    Bilbo
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Beravor")}>
                    Beravor
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Renerien")}>
                    Renerien
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Eleanor")}>
                    Eleanor
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Elena")}>
                    Elena
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Aragorn")}>
                    Aragorn
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Legolas")}>
                    Legolas
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Gimli")}>
                    Gimli
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Dwalin")}>
                    Dwalin
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Dis")}>
                    Dis
                </div>
                <div className="dropdown-option" onClick={() => selectPlayer("Balin")}>
                    Balin
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
