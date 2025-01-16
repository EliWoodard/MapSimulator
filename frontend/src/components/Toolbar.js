import React from "react";

const Toolbar = ({ addTile, addCircle }) => {
    return (
        <div style={{ marginBottom: "10px" }}>
            <button onClick={addTile}>Add Tile</button>
            <button onClick={addCircle}>Add Circle</button>
        </div>
    );
};

export default Toolbar;
