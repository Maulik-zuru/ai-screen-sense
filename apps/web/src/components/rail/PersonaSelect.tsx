import type { PersonaSummary } from "../../api.js";
import { Select } from "../ui/Select.js";

export function PersonaSelect({
  personas,
  value,
  onChange,
  disabled,
}: {
  personas: PersonaSummary[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const active = personas.find((p) => p.id === value);

  return (
    <div>
      <label className="mb-2 block font-mono text-[11px] font-medium tracking-[0.06em] text-text-muted">
        PERSONA
      </label>
      <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {personas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      {active && active.scope.length > 0 && (
        <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-text-muted">
          {active.scope.join(" · ")}
        </p>
      )}
    </div>
  );
}
