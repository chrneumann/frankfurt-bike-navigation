# Frankfurt Bike Navigation

Bike navigation for Frankfurt. Used as example at
https://codingmobility.net/routing

The project consists of the `RoutingMap` React component to display and change
the route.

This is a proof of concept and reference/learning material. It's not intended
for use in production.

## Example usage

### Valhalla

The routing map uses a [Valhalla](https://valhalla.github.io/valhalla/) instance
to calculate the routes. Setup of such an instance is out of scope of this
README.

### React component to show map with routing function

Build the component library:

> npm install
> npm run build:js

If using TypeScript:

> npm run build:types

Use it as component:

```tsx
import { RoutingMap } from "frankfurt-bike-navigation";
import "frankfurt-tram-lines/styles.css";
export default function Page() {
    return <RoutingMap center={[8.683737, 50.115161]} valhallaURL="/valhalla" styleURL="/maps/styles.json" />;
}
```
