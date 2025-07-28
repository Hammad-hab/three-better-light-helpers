import * as THREE from 'three'
import { LightHelper } from './types'
import Arrow from './_arrow'
import sprite_path from './reasources/dirlight.png'
import has_shadows from './reasources/has_shadows_indigator.png'
import has_target from './reasources/has_added_target.png'

interface HelperParameters {
    lightIconScale?: number,
    enableEffectiveRadius?: boolean
    enableLightColor?: boolean
    renderDirArrow?: boolean
    disableTargetMatrixUpdate?: boolean,
    trackTarget?: boolean
    pthickness?: number
}


class BetterDirectionalLightHelper extends LightHelper<THREE.DirectionalLight, HelperParameters> {
    public static _dirLightSprite: THREE.Texture
    protected _dirarrow!: Arrow
    private radiSprite?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
    public direction!: THREE.Vector3
    private _targetTracker?: THREE.Mesh

    constructor(directionalLight: THREE.DirectionalLight, parameters?: HelperParameters) {
        super()
        this.name = 'DIRLIGHTHELPER'
        this.targetLight = directionalLight
        this.direction = new THREE.Vector3()
        this.parameters = {
            renderDirArrow: true,
            lightIconScale: 0.15,
            enableEffectiveRadius: true,
            enableLightColor: true,
            disableTargetMatrixUpdate: false,
            trackTarget: false,
            ...parameters
        }

        this._loadpLightSprite()

        this.baseSprite = this._createSprite(BetterDirectionalLightHelper._dirLightSprite)

        this._createEffectiveRadiusHelper()

        this.hasShadowsEnabled()
        this.hasTarget()

        this.createTargetTracker()
    }

    protected _loadpLightSprite(): void {
        const textureLoader = LightHelper.TLoader
        BetterDirectionalLightHelper._dirLightSprite = textureLoader.load(sprite_path)
    }

    private createTargetTracker() {
        const targetParent = this.targetLight.target.parent
        if (!targetParent) return

        this._targetTracker = new THREE.Mesh(
            new THREE.CircleGeometry(0.1,),
            new THREE.MeshBasicMaterial({ side: 2, depthTest: false })
        )
        this._targetTracker.rotation.x += Math.PI * 0.5
        targetParent.add(this._targetTracker)
    }

    private hasShadowsEnabled() {
        const hasShadows = this.targetLight.castShadow
        if (!hasShadows) return

        const shadow_texture = LightHelper.TLoader.load(has_shadows)
        const sprite = this._createSprite(shadow_texture)
        sprite.position.y -= 0.25
        this.add(sprite)
    }

    private _createSprite(_sprite: THREE.Texture) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: _sprite,
            transparent: true,
        })
        const sprite = new THREE.Sprite(spriteMaterial)

        if (sprite) {
            sprite.scale.setScalar(this.parameters.lightIconScale ?? 0.15)
        }
        return sprite
    }

    private hasTarget() {
        const targetParent = this.targetLight.target.parent
        if (!targetParent) return
        const target_texture = LightHelper.TLoader.load(has_target)
        const sprite = this._createSprite(target_texture)

        if (this.parameters.trackTarget) 
            sprite.material.color = new THREE.Color('rgba(117, 180, 252, 1)')
        
        sprite.position.y += 0.25
        this.add(sprite)
    }


    private _createDirArrow(effectiveDistRadius: number) {
        if (!this.parameters.renderDirArrow) return
        this._dirarrow = new Arrow(effectiveDistRadius, 0.05, 0.0075)
        this._dirarrow.arrowBody.material.depthTest = true
        this._dirarrow.arrowHead.material.depthTest = true

        this._dirarrow.arrowBody.position.y += effectiveDistRadius / 2
        this._dirarrow.arrowHead.position.y += effectiveDistRadius / 2

        if (this.baseSprite) {
            this.add(this.baseSprite)
        }
        this.add(this._dirarrow)
    }

    private _createEffectiveRadiusHelper() {
        const effectiveDistRadius = BetterDirectionalLightHelper._getEffectiveDist(this.targetLight.intensity, 0.01, 10)
        const pThickness = (100 - (this.parameters.pthickness ?? 1)) / 100
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
        this.add(this.radiSprite);
        this._createDirArrow(effectiveDistRadius)
    }

    public update() {
        super.update()

        const from = this.targetLight.position.clone()
        const to = this.targetLight.target.position.clone()
        this.direction = this._dirarrow.pointAtVector3(from, to)

        if (this._targetTracker && this.parameters.trackTarget) {
            this._targetTracker.position.set(to.x, to.y, to.z)
        }

          if (!this.parameters.disableTargetMatrixUpdate) {
            this.targetLight.target.updateMatrixWorld()
        }
    }
}


export const DirectionalLightHelper = BetterDirectionalLightHelper