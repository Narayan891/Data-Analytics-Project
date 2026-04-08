import { useState } from "react";

function DataForm() {
  const [form, setForm] = useState({
    zoo: "",
    species: "",
    count: ""
  });

  const handleSubmit = () => {
    console.log("Submitted:", form);
    alert("Data Submitted (connect to backend later)");
  };

  return (
    <div className="card">
      <h3>➕ Add Zoo Data</h3>

      <input
        placeholder="Zoo Name"
        onChange={(e) => setForm({ ...form, zoo: e.target.value })}
      />

      <input
        placeholder="Species"
        onChange={(e) => setForm({ ...form, species: e.target.value })}
      />

      <input
        placeholder="Count"
        type="number"
        onChange={(e) => setForm({ ...form, count: e.target.value })}
      />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default DataForm;