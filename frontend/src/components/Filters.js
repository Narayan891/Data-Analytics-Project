import { useState } from "react";

function Filters({ onFilter }) {
  const [state, setState] = useState("");
  const [zoo, setZoo] = useState("");

  return (
    <div className="card">
      <h4>Filters</h4>

      <input
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />

      <input
        placeholder="Zoo"
        value={zoo}
        onChange={(e) => setZoo(e.target.value)}
      />

      <button onClick={() => onFilter({ state, zoo })}>
        Apply Filters
      </button>
    </div>
  );
}

export default Filters;