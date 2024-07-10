import React from "react";
import { AddCollectionInfo } from "../../../../components/AddCollectionInfo";
import { useLocalSearchParams } from "expo-router";

function AddToCollection() {
  const { currentCollections, id, location } = useLocalSearchParams();
  return (
    <AddCollectionInfo
      currentCollections={JSON.parse(currentCollections)}
      id={id}
      location={location}
    />
  );
}

export default AddToCollection;
