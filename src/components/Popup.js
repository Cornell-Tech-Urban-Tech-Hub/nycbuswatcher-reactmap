import React from "react";

const Popup = ({ feature }) => {
  const { id, passengers, vehicleref, lineref, trip_id } = feature.properties;

  return (
    <div id={`popup-${id}`}>
      <h3>{passengers} passengers</h3>
          <h3>Route {lineref}</h3>
        <h3>Trip {trip_id}</h3>
          <h3>Bus {vehicleref}</h3>
          n.b. not all buses are equipped with occupancy sensors.
        </div>
  );
};

export default Popup;
