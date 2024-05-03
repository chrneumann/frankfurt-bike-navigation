import React, { useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LngLatLike } from "maplibre-gl";

import { useRoutingMap } from "./routing-map.js";

import styles from "./RoutingMap.module.css";

type Props = {
  // URL of the MapLibre style.
  styleURL: string;
  // Initial center point.
  center: LngLatLike;
  // URL to the Valhalla instance.
  valhallaURL: string;
};

export function RoutingMap({
  styleURL,
  center,
  valhallaURL,
}: Props): React.JSX.Element {
  const mapContainer = useRef(null);
  useRoutingMap(mapContainer.current, styleURL, center, valhallaURL);
  return (
    <div className={styles.root}>
      <div className={styles.map} ref={mapContainer} />
    </div>
  );
}
