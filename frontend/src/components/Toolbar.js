import React, { useState } from "react";

const Toolbar = ({ addTile, addCircle, selectPlayer, toggleDropdown, selectEnemy, toggleDropdownEnemy }) => {
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
            {/* <button class="addToken" onClick={addCircle}>Add Circle</button> */}

            <button
                className="addToken"
                id="dropdownButton"
                onClick={toggleDropdown}
            >
                Select Player
            </button>

            <button
                className="addToken"
                id="dropdownButtonEnemy"
                onClick={toggleDropdownEnemy}
            >
                Select Enemy
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

            <div id="dropdownMenuEnemy" className="dropdown-menu hidden">
                {/* Wrap calls in arrow functions */}
                <div className="dropdown-option" onClick={() => selectEnemy("Oliphant")}>
                    Oliphant
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Warg-Rider")}>
                    Warg-Rider
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Warg")}>
                    Warg
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Balrog")}>
                    Balrog
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Fell-Beast")}>
                    Fell-Beast
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Orc-Hunters")}>
                    Orc-Hunters
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Goblin-Scout")}>
                    Goblin-Scout
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Giant-Spider")}>
                    Giant-Spider
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Orc-Marauder")}>
                    Orc-Marauder
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Orc-Taskmaster")}>
                    Orc-Taskmaster
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Pit-Goblin")}>
                    Pit-Goblin
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Ruffian")}>
                    Ruffian
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Nameless")}>
                    Nameless
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Wight")}>
                    Wight
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Shade")}>
                    Shade
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Soldier")}>
                    Soldier
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Siege-Tower")}>
                    Siege-Tower
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Gulgotar")}>
                    Gulgotar
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Atarin")}>
                    Atarin
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Witch-King")}>
                    Witch-King
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Coal-Fang")}>
                    Coal-Fang
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Spawn-of-Ungoliant")}>
                    Spawn of Ungoliant
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Ursa")}>
                    Ursa
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Supplicant-of-Morgoth")}>
                    Supplicant of Morgoth
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Ollie")}>
                    Ollie
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Hill-Troll")}>
                    Hill-Troll
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Cave-Troll")}>
                    Cave-Troll
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Eadris")}>
                    Eadris
                </div>
                <div className="dropdown-option" onClick={() => selectEnemy("Angon")}>
                    Angon
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
