import * as THREE from 'three'

const MAX_LIGHT_NG = 0.01
const SCALE_FACTOR = 10

class BetterPointLightHelper extends THREE.Object3D {
    private targetLight: THREE.PointLight
    private baseSprite?: THREE.Sprite
    private radiSprite?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
    public static _pointLightSprite: THREE.Texture

    private static _loadpLightSprite() 
    {
        const textureLoader = new THREE.TextureLoader()
        BetterPointLightHelper._pointLightSprite = textureLoader.load('/pointlight.png')
    }
    
    private static _getEffectiveDist(intensity: number) 
    {
       return Math.sqrt(intensity/MAX_LIGHT_NG)/SCALE_FACTOR
    }

    constructor(pointLight: THREE.PointLight) {
        super()
        this.targetLight = pointLight

        if (!BetterPointLightHelper._pointLightSprite)
            BetterPointLightHelper._loadpLightSprite()

        this._createSprite()
        this._createDecayHelper()

    }


    private _createSprite() {
        const cd = this.targetLight.intensity > 0.25 ? this.targetLight.intensity : 0.25
        const spriteMaterial = new THREE.SpriteMaterial({
            map: BetterPointLightHelper._pointLightSprite,
            transparent: true,
            opacity: cd
        })
        this.baseSprite = new THREE.Sprite(spriteMaterial)
        this.baseSprite.scale.setScalar(0.15)
        this.add(this.baseSprite)
    }

    private _createDecayHelper() {
        const effectiveDistRadius = BetterPointLightHelper._getEffectiveDist(this.targetLight.intensity)
        const geometry = new THREE.PlaneGeometry(1, 1); // Simple quad
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                uColor: { value: this.targetLight.color },
                uInnerRadius: { 
                    value: effectiveDistRadius * 99/100  // inner radius is 1% smaller than the outer radius
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
        this.add(this.radiSprite);
    }

    update() {
        this.position.copy(this.targetLight.position)
        this.rotation.copy(this.targetLight.rotation)

        const cd = this.targetLight.intensity > 0.25 ? this.targetLight.intensity : 0.25

        if (this.radiSprite)
            this.radiSprite.material.uniforms.uIntensity.value = cd
    }
}


export default BetterPointLightHelper