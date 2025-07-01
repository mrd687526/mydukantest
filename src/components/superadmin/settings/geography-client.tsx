"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Country, State, Region } from "@/lib/types";
import { CountriesTab } from "./countries-tab";
import { StatesTab } from "./states-tab";
import { RegionsTab } from "./regions-tab";

interface GeographyClientProps {
  initialCountries: Country[];
}

export function GeographyClient({ initialCountries }: GeographyClientProps) {
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);

  const handleCountryCreated = (newCountry: Country) => {
    setCountries(prev => [...prev, newCountry].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleCountryUpdated = (updatedCountry: Country) => {
    setCountries(prev => prev.map(c => c.id === updatedCountry.id ? updatedCountry : c));
  };

  return (
    <Tabs defaultValue="countries" className="w-full">
      <TabsList>
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="states" disabled={!selectedCountry}>States</TabsTrigger>
        <TabsTrigger value="regions" disabled={!selectedState}>Regions</TabsTrigger>
      </TabsList>
      <TabsContent value="countries">
        <CountriesTab
          countries={countries}
          onCountryCreated={handleCountryCreated}
          onCountryUpdated={handleCountryUpdated}
          onCountrySelected={setSelectedCountry}
        />
      </TabsContent>
      <TabsContent value="states">
        {selectedCountry && (
          <StatesTab
            country={selectedCountry}
            onStateSelected={setSelectedState}
          />
        )}
      </TabsContent>
      <TabsContent value="regions">
        {selectedState && (
          <RegionsTab
            state={selectedState}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}