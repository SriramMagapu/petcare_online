import React from "react";
import OwnerHeader from "./OwnerHeader";
import PetList from "../pets/PetList";

export default function OwnerPets() {
  return (
    <div>
      <OwnerHeader />
        
        <PetList />
      </div>
    
  );
}
