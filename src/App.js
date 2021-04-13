import ReactDOM from "react-dom";
import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import fetchBusData from "./api/fetchBusData";
import Popup from "./components/Popup";
import "./App.css";

// mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const App = () => {
  const mapContainerRef = useRef(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  // initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // See style options here: https://docs.mapbox.com/api/maps/#styles
      style: {
          "version": 8,
          "sources": {
              "simple-tiles": {
                  "type": "raster",
                  "tiles": [
                      "http://tile.stamen.com/toner/{z}/{x}/{y}.png"
                  ],
                  "tileSize": 256
              }
          },
          "layers": [{
              "id": "simple-tiles",
              "type": "raster",
              "source": "simple-tiles",
              "minzoom": 0,
              "maxzoom": 22
          }]
      },
      center: [-73.93, 40.73], // centroid of NYC
      zoom: 11 // starting zoom
    });

    // add navigation control (zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");


    map.on("load", () => {
      // add the data source for new a feature collection with no features
      map.addSource("buses", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      })
    });

    // ------------ NYCBUSWATCHER ADAPTED TO HERE ------------


    map.on("moveend", async () => {
      // get new center coordinates
      const { lng, lat } = map.getCenter();
      // fetch new data
      const results = await fetchBusData({ longitude: lng, latitude: lat });
      // update "random-points-data" source with new data
      // all layers that consume the "random-points-data" data source will be updated automatically
      map.getSource("buses").setData(results);
    });

    // change cursor to pointer when user hovers over a clickable feature
    map.on("mouseenter", "buses", e => {
      if (e.features.length) {
        map.getCanvas().style.cursor = "pointer";
      }
    });

    // reset cursor to default when user is no longer hovering over a clickable feature
    map.on("mouseleave", "buses", () => {
      map.getCanvas().style.cursor = "";
    });

    // add popup when user clicks a point
    map.on("click", "buses", e => {
      if (e.features.length) {
        const feature = e.features[0];
        // create popup node
        const popupNode = document.createElement("div");
        ReactDOM.render(<Popup feature={feature} />, popupNode);
        // set popup on map
        popUpRef.current
          .setLngLat(feature.geometry.coordinates)
          .setDOMContent(popupNode)
          .addTo(map);
      }
    });

    // clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="map-container" ref={mapContainerRef} />;
};

export default App;
