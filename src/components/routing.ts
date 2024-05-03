import { useEffect, useState } from "react";
import { Valhalla } from "@routingjs/valhalla";
import type { Feature, Position } from "geojson";

/**
 * A calculated route.
 */
export type Route = {
  // Stops of the route; First is the start, last is the finish.
  stops: Position[];
  // Calculated segments.
  feature: Feature | null;
};

/**
 * React hook to calculate the route.
 *
 * @param valhallaURL - Base URL to Valhalla instance.
 * @param stops - Stops of the route; First is the start, last is the finish.
 */
export function useRoute(valhallaURL: string, stops: Position[]): Route | null {
  const [route, setRoute] = useState<null | Route>(null);
  useEffect(() => {
    (async () => {
      const v = new Valhalla({
        baseUrl: valhallaURL,
      });
      const directions =
        stops.length > 1
          ? await v.directions(
              stops.map((stop) => [stop[0], stop[1]]),
              "bicycle",
            )
          : null;
      setRoute({
        stops,
        feature: directions
          ? (directions.directions[0].feature as Feature)
          : null,
      });
    })();
  }, [stops]);
  return route;
}
