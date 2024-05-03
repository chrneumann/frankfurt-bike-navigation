import { useState, useEffect, useRef } from "react";
import { Map as LibreMap, LngLat, Marker, type LngLatLike } from "maplibre-gl";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import { Protocol } from "pmtiles";
import type { Position } from "geojson";

import { useRoute, type Route } from "./routing.js";

/**
 * Implements a wrapper for MapLibre.
 */
class RoutingMap {
  // The MapLibre instance.
  private map: LibreMap;
  // Visible stop marker.
  private stopMarker: Marker[];

  /**
   * Initializes the map.
   *
   * @param styleURL - URL to the MapLibre style.
   * @param center - Initial center coordinates.
   * @param container - The HTML element to attach to.
   * @param onLoad - Callback which is called when the map is loaded.
   * @param onPosition - Callback which is called when the user clicks on the
   * map.
   */
  constructor(
    styleURL: string,
    center: LngLatLike,
    container: HTMLElement,
    onLoad: (map: RoutingMap) => void,
    onPosition: (point: LngLat) => void,
  ) {
    const protocol = new Protocol();
    this.stopMarker = [];
    this.map = new LibreMap({
      container,
      style: styleURL,
      center,
      zoom: 13,
      cooperativeGestures: true,
      attributionControl: {
        customAttribution:
          '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap Mitwirkende</a> <a href = "https://www.maptiler.com/copyright/" target="_blank" >&copy; MapTiler</a>',
      },
    });
    maplibregl.addProtocol("pmtiles", protocol.tile);
    this.map.on("click", (e) => {
      onPosition(e.lngLat);
    });
    this.map.on("load", () => {
      this.map.addControl(new maplibregl.NavigationControl());
      this.map.addSource("transport", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      this.map.addLayer({
        id: "transport",
        type: "line",
        source: "transport",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#DBB3E6",
          "line-width": 5,
        },
      });
      onLoad(this);
    });
  }

  /**
   * Displays the given route.
   *
   * @param route - The route to display.
   * @param onPositionChange - Callback which is called when a position is
   * changed by the user. Index is the position of the index, lngLat the new position.
   */
  displayRoute(
    route: Route,
    onPositionChange: (index: number, lngLat: LngLat) => void,
  ): void {
    const source = this.map.getSource("transport");
    if (source instanceof GeoJSONSource) {
      source.setData(
        route.feature || {
          type: "FeatureCollection",
          features: [],
        },
      );
    }

    this.stopMarker.forEach((m) => m.remove());
    this.stopMarker = [];

    const start = route.stops[0];
    if (start) {
      this.stopMarker.push(
        new Marker({
          color: "#FFCCE6",
          draggable: true,
          scale: 0.7,
        }).setLngLat([start[1], start[0]]),
      );
    }

    if (route.stops.length > 1) {
      const stop = route.stops.at(-1);
      if (stop) {
        this.stopMarker.push(
          new Marker({
            color: "#AB212A",
            draggable: true,
          }).setLngLat([stop[1], stop[0]]),
        );
      }
    }

    this.stopMarker.forEach((m, i) => {
      m.on("dragend", () => {
        onPositionChange(i, m.getLngLat());
      });
      m.addTo(this.map);
    });
  }

  /**
   * Cleans up the map.
   *
   * Removes the PMTiles protocol from MapLibre GL.
   */
  destruct() {
    maplibregl.removeProtocol("pmtiles");
  }
}

/**
 * React hook to initialize and update the transport map.
 *
 * @param container - The map container.
 * @param styleURL - URL to the MapLibre style.
 * @param center - Initial center coordinates.
 * @param onPosition - Callback which is called when the user clicks on the
 * @param valhallaURL - Base URL to Valhalla instance.
 */
export function useRoutingMap(
  container: HTMLElement | null,
  styleURL: string,
  center: LngLatLike,
  valhallaURL: string,
) {
  const [stops, setStops] = useState<Position[]>([
    [50.121490025027555, 8.676956375613827],
    [50.109766909663165, 8.690689285769878],
  ]);
  const [map, setMap] = useState<null | RoutingMap>(null);
  const route = useRoute(valhallaURL, stops);
  const lastChanged = useRef(1);

  // Initialize the map.
  useEffect(() => {
    if (container) {
      const theMap = new RoutingMap(
        styleURL,
        center,
        container,
        setMap,
        (position) => {
          if (lastChanged.current === 0) {
            setStops((prevStops) => [
              prevStops[0].slice(),
              [position.lat, position.lng],
            ]);
            lastChanged.current = 1;
          } else {
            setStops([[position.lat, position.lng]]);
            lastChanged.current = 0;
          }
        },
      );
      return () => {
        theMap.destruct();
      };
    }
  }, [container]);

  const onPositionChange = (index: number, lngLat: LngLat) => {
    setStops([
      ...stops.slice(0, index),
      [lngLat.lat, lngLat.lng],
      ...stops.slice(index + 1),
    ]);
  };

  // Display route when available.
  useEffect(() => {
    if (map && route) {
      map.displayRoute(route, onPositionChange);
    }
  }, [route, map]);
}
