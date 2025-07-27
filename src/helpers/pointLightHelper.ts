import * as THREE from 'three'
import { LightHelper } from './types'

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

    constructor(pointLight: THREE.PointLight, parameters?:HelperParameters) {
        super()
        this.targetLight = pointLight
        this.parameters = parameters ?? {
            pthickness: 1,
            minOpacity: 0.25,
            lightIconScale: 0.15,
            enableEffectiveRadius: true,
            enableLightColor: true
        }
        if (!BetterPointLightHelper._pointLightSprite)
            this._loadpLightSprite()

        this._createSprite()
        this._createEffectiveRadiusHelper()
    }


    private _createSprite() {
        const cd = this.targetLight.intensity > (this.parameters.minOpacity ?? 0.25) ? this.targetLight.intensity : (this.parameters.minOpacity ?? 0.25)
        const spriteMaterial = new THREE.SpriteMaterial({
            map: BetterPointLightHelper._pointLightSprite,
            transparent: true,
            opacity: cd
        })
        this.baseSprite = new THREE.Sprite(spriteMaterial)
        this.baseSprite.scale.setScalar(this.parameters.lightIconScale ?? 0.15)
        this.add(this.baseSprite)
    }

    private _createEffectiveRadiusHelper() {
        const effectiveDistRadius = BetterPointLightHelper._getEffectiveDist(this.targetLight.intensity)
        const pThickness = (100-(this.parameters.pthickness ?? 0))/100
        const defaultColor = new THREE.Color(0xffffff)

        const geometry = new THREE.PlaneGeometry(1, 1); // Simple quad
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                uColor: { value: this.parameters.enableLightColor ? this.targetLight.color: defaultColor },
                uInnerRadius: { 
                    value: effectiveDistRadius * pThickness  // inner radius is 1% smaller than the outer radius
                },
                uOuterRadius: { value: effectiveDistRadius },
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

    protected _loadpLightSprite() 
    {
        const textureLoader = LightHelper.TLoader
        BetterPointLightHelper._pointLightSprite = textureLoader.load('/pointlight.png')
    }


    public update() {
        super.update()

        const cd = this.targetLight.intensity > (this.parameters.minOpacity ?? 0.25) ? this.targetLight.intensity : (this.parameters.minOpacity ?? 0.25)
        if (this.radiSprite)
            this.radiSprite.material.uniforms.uIntensity.value = cd
    }
}

export const PointLightHelper = BetterPointLightHelper