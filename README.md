# Three.js Better Light Helpers

This library provides enhanced light helpers for [Three.js](https://threejs.org/), offering improved visualization and debugging capabilities for `DirectionalLight`, `PointLight`, and `SpotLight`. These helpers extend Three.js's built-in functionalities by adding features like light icons, effective radius visualization, directional arrows, and clear indicators for shadows and light targets.

## Features

-   **Directional Light Helper**: Visualizes `DirectionalLight` with an icon, an effective radius indicator, a directional arrow, and indicators for shadows and target tracking.
-   **Point Light Helper**: Visualizes `PointLight` with an icon and an effective radius indicator, along with a shadow indicator.
-   **Spot Light Helper**: Visualizes `SpotLight` with an icon, a directional cone representing the spot angle and distance, a directional arrow, and indicators for shadows and target tracking.
-   **Customizable**: Each helper can be customized with various parameters such as icon scale, enabling/disabling effective radius, light color representation, and more.
-   **Performance**: Utilizes shaders for efficient rendering of effective radius and light cones.

## Installation

This project uses `npm` or `pnpm` for package management.

```bash
pnpm i threejs-better-light-helpers
```

## Usage

Here's how you can integrate and use the light helpers in your Three.js project:

First, import the desired helper classes:

```typescript
import { DirectionalLightHelper, PointLightHelper, SpotLightHelper } from 'threejs-better-light-helpers';
```

Then, instantiate and add them to your scene:

### DirectionalLightHelper

```typescript
import * as THREE from 'three';
import { DirectionalLightHelper } from 'threejs-better-light-helpers';

const scene = new THREE.Scene();
const dirLight = new THREE.DirectionalLight(0xff0fff, 1);
dirLight.position.set(-3.0, 1, 0);
dirLight.castShadow = true;
scene.add(dirLight, dirLight.target);

const dirLightHelper = new DirectionalLightHelper(dirLight, {
    trackTarget: true // Enable tracking of the light's target
});
scene.add(dirLightHelper);

// In your animation loop:
// dirLightHelper.update();
```

### PointLightHelper

```typescript
import * as THREE from 'three';
import { PointLightHelper } from 'threejs-better-light-helpers';

const scene = new THREE.Scene();
const pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.position.set(3.0, 1, 0);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLightHelper = new PointLightHelper(pointLight);
scene.add(pointLightHelper);

// In your animation loop:
// pointLightHelper.update();
```

### SpotLightHelper

```typescript
import * as THREE from 'three';
import { SpotLightHelper } from 'threejs-better-light-helpers';

const scene = new THREE.Scene();
const spotLight = new THREE.SpotLight(0xffffff, 5, 0, Math.PI * 0.2, 1);
spotLight.position.set(0, 1, 0);
spotLight.castShadow = true;
// spotLight.map = texture; // Optional: Assign a texture map
scene.add(spotLight, spotLight.target);

const spotLightHelper = new SpotLightHelper(spotLight, {
    trackTarget: true // Enable tracking of the light's target
});
scene.add(spotLightHelper);

// In your animation loop:
// spotLightHelper.update();
```

**Important**: Remember to call `update()` on each helper in your animation loop to ensure they correctly reflect changes in the light's position, rotation, and target.

## Development

To run the development server:

```bash
pnpm dev
```

This will start a Vite development server, usually accessible at `http://localhost:5173/`.

## Project Structure

```
.
├── src/
│   ├── helpers/
│   │   ├── _arrow.ts                   # Internal arrow helper utility
│   │   ├── directionalLightHelper.ts   # DirectionalLight helper implementation
│   │   ├── pointLightHelper.ts         # PointLight helper implementation
│   │   ├── reasources/                 # Light icon assets
│   │   ├── spotLightHelper.ts          # SpotLight helper implementation
│   │   └── types.ts                    # TypeScript types for helpers
│   ├── index.html                      # Main HTML file
│   ├── script.ts                       # Example usage of light helpers
│   └── style.css                       # Basic styling
├── static/                             # Static assets
├── package.json                        # Project dependencies and scripts
├── pnpm-lock.yaml                      # pnpm lock file
├── README.md                           # This README file
├── tsconfig.json                       # TypeScript configuration
└── vite.config.js                      # Vite build configuration
```

## Indicators Documentation

This section details the various visual indicators (sprites and geometries) used by the Three.js Better Light Helpers (`DirectionalLightHelper`, `PointLightHelper`, `SpotLightHelper`) to provide comprehensive debugging and visualization of light sources.

Each helper provides a set of customizable parameters that control the visibility and appearance of these indicators.

### Common Indicators

These indicators are present across multiple light helper types, although their exact appearance or conditions might vary slightly.

#### 1. Base Light Icon

*   **Purpose**: Represents the origin or position of the light source in the 3D scene.
*   **Appearance**: A 2D sprite, scaled to a manageable size.
*   **Parameters Affecting Appearance**:
    *   `lightIconScale`: (Number, default: 0.15) Controls the uniform scale of the icon.
*   **Specifics per Light Type**:
    *   **DirectionalLightHelper**: Uses the `dirlight.png` icon.
<img src="package/helpers/reasources/dirlight.png" alt="Directional Light Icon" width="100" style="display: block; margin-left: auto; margin-right: auto;">
    *   **PointLightHelper**: Uses the `pointlight.png` icon. Its opacity dynamically adjusts based on the light's intensity (`targetLight.intensity`) and the `minOpacity` parameter. This makes dimmer lights appear more transparent.
<img src="package/helpers/reasources/pointlight.png" alt="Point Light Icon" width="100" style="display: block; margin-left: auto; margin-right: auto;">
    *   **SpotLightHelper**: Uses the `spotlight.png` icon.
<img src="package/helpers/reasources/spotlight.png" alt="Spot Light Icon" width="100" style="display: block; margin-left: auto; margin-right: auto;">

#### 2. Shadow Indicator

*   **Purpose**: Indicates whether the associated light source is configured to cast shadows.
*   **Appearance**: A small 2D sprite (a circular icon with a shadow symbol) positioned typically below the main light icon.
*   **Conditions**: This indicator is only visible if the `targetLight.castShadow` property is set to `true`.
*   **Image**:
<img src="package/helpers/reasources/has_shadows_indigator.png" alt="Has Shadows Indicator" width="100" style="display: block; margin-left: auto; margin-right: auto;">

#### 3. Effective Radius / Light Cone

*   **Purpose**: Visualizes the effective range or influence of the light source.
*   **Appearance**:
    *   **DirectionalLightHelper & PointLightHelper**: Rendered as a flat, circular ring (a 2D quad with a shader). The size of this ring scales with the light's `intensity`. The color of the ring can be either the light's color or a default white.
    *   **SpotLightHelper**: Rendered as a wireframe cone. The cone's dimensions are derived from the `SpotLight`'s `angle` and its effective distance. The cone's vertices are colored: the base will reflect the `targetLight.color` (if enabled), and it gradually transitions to white towards the apex.
*   **Parameters Affecting Appearance**:
    *   `enableEffectiveRadius`: (Boolean, default: `true`) Toggles the visibility of this visualization.
    *   `enableLightColor`: (Boolean, default: `true`) If `true`, the indicator will take on the `targetLight.color`. If `false`, it will be rendered in a default white color.
    *   `pthickness`: (Number, DirectionalLightHelper & PointLightHelper, default: 1 for DirLight, 10 for PointLight) Controls the thickness of the circular ring (0-100, where 100 is thinnest).
    *   `coneRadialSegments`: (Number, SpotLightHelper, default: 4) Determines the number of radial segments for the wireframe cone, affecting its smoothness.

#### 4. Directional Arrow

*   **Purpose**: Clearly shows the direction in which directional and spot lights are pointing.
*   **Appearance**: A 3D arrow model, dynamically updated to point from the light's position towards its target.
*   **Parameters Affecting Appearance**:
    *   `renderDirArrow`: (Boolean, default: `true`) Toggles the visibility of the directional arrow.
*   **Applies to**:
    *   `DirectionalLightHelper`
    *   `SpotLightHelper`

#### 5. Target Indicator

*   **Purpose**: Highlights the `target` property of `DirectionalLight` and `SpotLight`, showing where the light is directed.
*   **Appearance**:
    *   A small 2D sprite (an icon with a target symbol), positioned relative to the light icon.
    *   Optionally, a `THREE.Mesh` (a flat circle) is rendered directly at the target's world position for precise tracking.
*   **Conditions**: Only visible if the `targetLight.target.parent` exists (meaning the light has a target added to the scene).
*   **Appearance Changes**:
    *   If `trackTarget` parameter is `true`, the target sprite's color will change to a distinct blue tint (RGB: 117, 180, 252) to indicate active tracking, and the `THREE.Mesh` tracker will be visible at the target's location.
*   **Parameters Affecting Appearance**:
    *   `trackTarget`: (Boolean, default: `false`) When `true`, enables active visual tracking of the target's position with the blue-tinted sprite and a separate mesh tracker.
    *   `disableTargetMatrixUpdate`: (Boolean, default: `false`) If `true`, prevents the helper from calling `targetLight.target.updateMatrixWorld()`. This is useful if you manage target updates externally.
*   **Image**:
<img src="package/helpers/reasources/has_added_target.png" alt="Has Added Target Indicator" width="100" style="display: block; margin-left: auto; margin-right: auto;">

### SpotLight Specific Indicator

#### 1. Map Projection (Optional)

*   **Purpose**: Visualizes the `map` texture assigned to a `SpotLight`, showing how it would be projected.
*   **Appearance**: A transparent plane rendered at the end of the light cone, displaying the `spotLight.map` texture.
*   **Conditions**: Only visible if `enableMap` parameter is `true` AND `spotLight.map` has a texture assigned.
*   **Parameters Affecting Appearance**:
    *   `enableMap`: (Boolean, default: `true`) Toggles the visibility of the map projection.

## Helper Parameters

Each light helper exposes a set of parameters that allow for fine-grained control over its appearance and behavior. These parameters are passed as an optional object to the helper's constructor.

### DirectionalLightHelper Parameters

```typescript
interface HelperParameters {
    lightIconScale?: number; // (Optional) Controls the uniform scale of the light's icon. Default is 0.15.
    enableEffectiveRadius?: boolean; // (Optional) Toggles the visibility of the effective radius visualization. Default is true.
    enableLightColor?: boolean; // (Optional) If true, the effective radius will be colored with the light's color; otherwise, it will be white. Default is true.
    renderDirArrow?: boolean; // (Optional) Toggles the visibility of the directional arrow. Default is true.
    disableTargetMatrixUpdate?: boolean; // (Optional) If true, prevents the helper from calling targetLight.target.updateMatrixWorld(). Useful if you manage target updates externally. Default is false.
    trackTarget?: boolean; // (Optional) When true, enables active visual tracking of the target's position with a blue-tinted sprite and a separate mesh tracker. Default is false.
    pthickness?: number; // (Optional) Controls the thickness of the effective radius ring (0-100, where 100 is thinnest). Default is 1.
}
```

### PointLightHelper Parameters

```typescript
interface HelperParameters {
    pthickness?: number; // (Optional) Controls the thickness of the effective radius ring (0-100, where 100 is thinnest). Default is 10.
    minOpacity?: number; // (Optional) Sets the minimum opacity for the light icon. Useful for very dim lights. Default is 0.25.
    lightIconScale?: number; // (Optional) Controls the uniform scale of the light's icon. Default is 0.15.
    enableEffectiveRadius: boolean; // Toggles the visibility of the effective radius visualization. Default is true.
    enableLightColor: boolean; // If true, the effective radius will be colored with the light's color; otherwise, it will be white. Default is true.
}
```

### SpotLightHelper Parameters

```typescript
interface HelperParameters {
    renderAboveAll?: boolean; // (Optional) If true, the helper will render above all other objects (depthTest: false). Default is false.
    lightIconScale?: number; // (Optional) Controls the uniform scale of the light's icon. Default is 0.15.
    enableEffectiveRadius?: boolean; // (Optional) Toggles the visibility of the effective cone visualization. Default is true.
    enableLightColor?: boolean; // (Optional) If true, the effective cone's base will be colored with the light's color. Default is true.
    coneRadialSegments?: number; // (Optional) Determines the number of radial segments for the wireframe cone, affecting its smoothness. Default is 4.
    renderDirArrow?: boolean; // (Optional) Toggles the visibility of the directional arrow. Default is true.
    enableMap?: boolean; // (Optional) Toggles the visibility of the map projection plane. Default is true.
    disableTargetMatrixUpdate?: boolean; // (Optional) If true, prevents the helper from calling targetLight.target.updateMatrixWorld(). Useful if you manage target updates externally. Default is false.
    trackTarget?: boolean; // (Optional) When true, enables active visual tracking of the target's position with a blue-tinted sprite and a separate mesh tracker. Default is false.
}
```
