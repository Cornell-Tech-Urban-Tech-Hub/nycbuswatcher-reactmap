import ReactDOM from "react-dom";
import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import fetchBusData from "./api/fetchBusData";
import Popup from "./components/Popup";
import "./App.css";

const api_url = 'http://nyc.buswatcher.org/api/v1/nyc/livemap'

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


    map.on('load', function () {
        var request = new XMLHttpRequest();
        window.setInterval(function () {
            // make a GET request to parse the GeoJSON at the url
            request.open('GET', api_url, true);
            request.onload = function () {
                if (this.status >= 200 && this.status < 400) {
                    // retrieve the JSON from the response
                    var json = JSON.parse(this.response);

                    // update the location on the map
                    map.getSource('buses').setData(json);

                 }
            };
            request.send();
        }, 10000); // update frequency in milliseconds

        map.addSource('buses', { type: 'geojson', data: api_url });

        map.addLayer({
            'id': 'buses',
            'type': 'circle',
            'source': 'buses',

            'paint': {

                'circle-color': {
                    property: 'passengers',
                    stops: [
                    [0, '#6F6F6F'],
                    [1, '#23bf06'],
                    [40, '#e55e5e']
                    ]
                },

                'circle-radius': {
                    property: 'passengers',
                    stops: [
                    [{zoom: 8, value: 0}, 1],
                    [{zoom: 8, value: 40}, 4],
                    [{zoom: 11, value: 0}, 3],
                    [{zoom: 11, value: 40}, 15],
                    [{zoom: 16, value: 0}, 10],
                    [{zoom: 16, value: 40}, 50]
                    ]
                }

            }
        });






    });




    // ------------ NYCBUSWATCHER ADAPTED TO HERE ------------

    // // change cursor to pointer when user hovers over a clickable feature
    // map.on("mouseenter", "buses", e => {
    //   if (e.features.length) {
    //     map.getCanvas().style.cursor = "pointer";
    //   }
    // });

    // // reset cursor to default when user is no longer hovering over a clickable feature
    // map.on("mouseleave", "buses", () => {
    //   map.getCanvas().style.cursor = "";
    // });

    // // add popup when user clicks a point
    // map.on("click", "buses", e => {
    //   if (e.features.length) {
    //     const feature = e.features[0];
    //     // create popup node
    //     const popupNode = document.createElement("div");
    //     ReactDOM.render(<Popup feature={feature} />, popupNode);
    //     // set popup on map
    //     popUpRef.current
    //       .setLngLat(feature.geometry.coordinates)
    //       .setDOMContent(popupNode)
    //       .addTo(map);
    //   }
    // });

    // clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="map-container" ref={mapContainerRef} />;
};

export default App;
