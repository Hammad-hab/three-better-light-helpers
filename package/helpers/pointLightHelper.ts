import * as THREE from 'three'
import { LightHelper } from './types'
import sprite_path from './reasources/pointlight.png'
import has_shadows from './reasources/has_shadows_indigator.png'

interface HelperParameters {
    pthickness?: number,
    effectiveRadiusShader?: string,
    minOpacity?: number
    lightIconScale?: number,
    enableEffectiveRadius: boolean
    enableLightColor: boolean
}

class BetterPointLightHelper extends LightHelper<THREE.PointLight, HelperParameters> {
    private radiSprite?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
    public static _pointLightSprite: THREE.Texture

    constructor(pointLight: THREE.PointLight, parameters?: HelperParameters) {
        super()
        this.name = 'PLIGHTHELPER'
        this.targetLight = pointLight
        this.parameters = {
            pthickness: 1,
            minOpacity: 0.25,
            lightIconScale: 0.15,
            enableEffectiveRadius: true,
            enableLightColor: true,
            ...parameters
        }
        if (!BetterPointLightHelper._pointLightSprite)
            this._loadpLightSprite()

        this.baseSprite = this._createSprite(BetterPointLightHelper._pointLightSprite)
        this.add(this.baseSprite)
        this.hasShadowsEnabled()
        this._createEffectiveRadiusHelper()

    }

    private _createSprite(_sprite: THREE.Texture) {
        const cd = this.targetLight.intensity > (this.parameters.minOpacity ?? 0.25) ? this.targetLight.intensity : (this.parameters.minOpacity ?? 0.25)
        const spriteMaterial = new THREE.SpriteMaterial({
            map: _sprite,
            transparent: true,
            opacity: cd,
        })
        const sprite = new THREE.Sprite(spriteMaterial)

        if (sprite) {
            sprite.scale.setScalar(this.parameters.lightIconScale ?? 0.15)
        }
        return sprite
    }


    private hasShadowsEnabled() {
        const hasShadows = this.targetLight.castShadow
        if (!hasShadows) return

        const shadow_texture = LightHelper.TLoader.load(has_shadows)
        const sprite = this._createSprite(shadow_texture)
        sprite.position.y -= 0.25
        this.add(sprite)
    }


    private _createEffectiveRadiusHelper() {
        const effectiveDistRadius = BetterPointLightHelper._getEffectiveDist(this.targetLight.intensity, 0.01, 10)
        const pThickness = (100 - (this.parameters.pthickness ?? 10)) / 100
        const defaultColor = new THREE.Color(0xffffff)

        const geometry = new THREE.PlaneGeometry(effectiveDistRadius, effectiveDistRadius); // Simple quad
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                uColor: { value: this.parameters.enableLightColor ? this.targetLight.color : defaultColor },
                uInnerRadius: {
                    value: 1.0 * pThickness  // inner radius is 1% smaller than the outer radius
                },
                uOuterRadius: { value: 1.0 },
                uIntensity: { value: 1.0 }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                // Billboard the quad (optional if facing the camera)
                mat3 cameraRotationInverse = mat3(viewMatrix); // Assumes viewMatrix is already inverted for rotation
                cameraRotationInverse = transpose(cameraRotationInverse); // Transpose to get inverse rotation

                // Rotate the quad's local position to face the camera
                vec3 rotatedPosition = cameraRotationInverse * position;

                // Get the quad's world position (center)
                vec4 worldCenter = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);

                // Combine rotated local position with world center
                vec4 worldPosition = vec4(worldCenter.xyz + rotatedPosition, 1.0);

                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `,
            fragmentShader: `
            varying vec2 vUv;
            uniform vec3 uColor;
            uniform float uInnerRadius;
            uniform float uOuterRadius;
            uniform float uIntensity;

            void main() {
                vec2 uv = vUv * 2.0 - 1.0; // center the UVs to range [-1, 1]
                float dist = length(uv);
                float ring = smoothstep(uOuterRadius, uOuterRadius - 0.01, dist) -
                            smoothstep(uInnerRadius, uInnerRadius - 0.01, dist);
                if (ring <= 0.01) discard;
                gl_FragColor = vec4(uColor*uIntensity, ring);
            }
        `
        });

        this.radiSprite = new THREE.Mesh(geometry, material);
        if (this.parameters.enableEffectiveRadius)
            this.add(this.radiSprite);
    }

    protected _loadpLightSprite() {
        const textureLoader = LightHelper.TLoader
        BetterPointLightHelper._pointLightSprite = textureLoader.load(sprite_path)
    }

    public update() {
        super.update()

        const cd = this.targetLight.intensity > (this.parameters.minOpacity ?? 0.25) ? this.targetLight.intensity : (this.parameters.minOpacity ?? 0.25)
        if (this.radiSprite)
            this.radiSprite.material.uniforms.uIntensity.value = cd
    }
}

export const PointLightHelper = BetterPointLightHelper