"use client";

import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input, type InputProps } from "@/components/ui/input";

export interface AddressInputProps extends Omit<InputProps, "onChange" | "value"> {
  countryCode: string | null;
  onAddressSelected: (address: {
    line1: string;
    city: string;
    postalCode: string;
    lat: number;
    lng: number;
  }) => void;
  defaultValue?: string;
}

export function AddressInput({ countryCode, onAddressSelected, defaultValue = "", ...props }: AddressInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address", "address_components"],
    };

    const ac = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(ac);

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      let streetName = "";
      let streetNumber = "";
      let city = "";
      let postalCode = "";

      for (const component of place.address_components || []) {
        const types = component.types;
        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        } else if (types.includes("route")) {
          streetName = component.long_name;
        } else if (types.includes("locality") || types.includes("postal_town") || types.includes("administrative_area_level_2")) {
          if (!city) city = component.long_name;
        } else if (types.includes("postal_code") || types.includes("postal_code_prefix")) {
          postalCode = component.long_name;
        }
      }

      const line1 = `${streetName} ${streetNumber}`.trim();
      const finalLine1 = line1 || place.name || "";
      setInputValue(finalLine1);

      onAddressSelected({
        line1: finalLine1,
        city,
        postalCode,
        lat,
        lng,
      });
    });

    // Cleanup listener on unmount
    return () => {
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [places, onAddressSelected]);

  useEffect(() => {
    if (autocomplete && countryCode) {
      autocomplete.setComponentRestrictions({ country: countryCode.toLowerCase() });
    } else if (autocomplete && !countryCode) {
      autocomplete.setComponentRestrictions({ country: [] });
    }
  }, [autocomplete, countryCode]);

  // Update internal value if the user types (e.g. to clear it)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  // To prevent Next.js hydration issues or stale closures on defaultValue, 
  // we just manage internal state for the visual input.

  return (
    <Input
      {...props}
      ref={inputRef}
      value={inputValue}
      onChange={handleChange}
    />
  );
}
