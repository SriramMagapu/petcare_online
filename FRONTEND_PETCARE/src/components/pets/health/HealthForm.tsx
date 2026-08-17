import { useState } from "react";

export default function HealthForm({ onSubmit }: { onSubmit: (r: any) => void }) {
  const [form, setForm] = useState({
    date: "",
    weight: "",
    temperature: "",
    notes: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const dateTime = form.date
      ? `${form.date}T00:00:00`
      : new Date().toISOString();

    onSubmit({
      recordedAt: dateTime,
      weight: Number(form.weight),
      temperature: Number(form.temperature),
      notes: form.notes,
    });

    setForm({ date: "", weight: "", temperature: "", notes: "" });
  }

  return (
    <form className="health-form" onSubmit={submit}>
      {/* DATE */}
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="form-input"
          required
        />
      </div>

      {/* WEIGHT + TEMP */}
      <div className="form-row">
        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 25.5"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 38.5"
            value={form.temperature}
            onChange={(e) =>
              setForm({ ...form, temperature: e.target.value })
            }
            className="form-input"
            required
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="form-group">
        <label>Notes (Optional)</label>
        <textarea
          placeholder="Any observations or concerns..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="form-textarea"
          rows={3}
        />
      </div>

      {/* SUBMIT */}
      <button type="submit" className="form-submit">
        ✓ Add Health Record
      </button>
    </form>
  );
}
