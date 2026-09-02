import { useProfiles } from "@/contexts/ProfilesContext";
import { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import React from "react";

interface DropdownProps {
  disabled?: boolean;
  onChange?: (profile: BirthChartProfile) => void;
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
}

export default function PresavedChartsDropdown(props: DropdownProps) {
  const { disabled, onChange, value, placeholder, ariaLabel } = props;
  const { profiles } = useProfiles();
  const isControlled = value !== undefined;

  return (
    <select
      disabled={disabled ?? false}
      aria-label={ariaLabel}
      value={isControlled ? value : undefined}
      defaultValue={!isControlled && placeholder ? "" : undefined}
      className="w-full disabled:opacity-50"
      onChange={(e) => {
        const key = e.target.value;
        const profile = profiles.find((p) => p.id === key || p.name === key);
        if (profile) onChange?.(profile);
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {profiles.map((profile, index) => {
        const key = profile.id ?? profile.name ?? String(index);
        return (
          <option key={key} value={profile.id ?? profile.name ?? ""}>
            {profile.name ?? `Mapa ${index + 1}`}
          </option>
        );
      })}
    </select>
  );
}
