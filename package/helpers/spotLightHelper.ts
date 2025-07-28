import * as THREE from 'three'
import { LightHelper } from './types'
import Arrow from './_arrow'
import sprite_path from './reasources/spotlight.png'
import has_shadows from './reasources/has_shadows_indigator.png'
import has_target from './reasources/has_added_target.png'


interface HelperParameters {
    renderAboveAll?: boolean,
    lightIconScale?: number,
    enableEffectiveRadius?: boolean
    enableLightColor?: boolean
    coneRadialSegments?: number
    renderDirArrow?: boolean
    enableMap?: boolean,
    disableTargetMatrixUpdate?: boolean,
    trackTarget?: boolean,
}

class BetterSpotLightHelper extends LightHelper<THREE.SpotLight, HelperParameters> {
    public static _spotLightSprite: THREE.Texture
    protected _dirarrow!: Arrow
    protected indigator?: THREE.Mesh
    private _targetTracker?: THREE.Mesh
    public direction!: THREE.Vector3

    constructor(spotLight: THREE.SpotLight, parameters?: HelperParameters) {
        super()
        this.name = 'SPLIGHTHELPER'
        this.targetLight = spotLight
        this.parameters = {
            renderAboveAll: false,
            renderDirArrow: true,
            lightIconScale: 0.15,
            enableEffectiveRadius: true,
            enableLightColor: true,
            coneRadialSegments: 4,
            enableMap: true,
            disableTargetMatrixUpdate: false,
            trackTarget: false,
            ...parameters
        }
        this._loadpLightSprite()
        this.baseSprite = this._createSprite(BetterSpotLightHelper._spotLightSprite)
        this._createDirArrow()
        this.hasShadowsEnabled()
        this.hasTarget()

        this.createTargetTracker()
    }

    private _createSprite(_sprite: THREE.Texture) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: _sprite,
            transparent: true,
            depthTest: false
        })
        const sprite = new THREE.Sprite(spriteMaterial)

        if (sprite) {
            sprite.scale.setScalar(0.15)
        }
        return sprite
    }


    private hasShadowsEnabled() {
        const hasShadows = this.targetLight.castShadow
        if (!hasShadows) return

        const shadow_texture = LightHelper.TLoader.load(has_shadows)
        const sprite = this._createSprite(shadow_texture)
        sprite.position.y -= this._dirarrow.length / 2
        this.add(sprite)
    }

    private hasTarget() {
        const targetParent = this.targetLight.target.parent
        if (!targetParent) return
        const target_texture = LightHelper.TLoader.load(has_target)
        const sprite = this._createSprite(target_texture)

        sprite.position.y -= this._dirarrow.length + this._dirarrow.coneh
        
        if (this.parameters.trackTarget)
            sprite.material.color = new THREE.Color('rgba(117, 180, 252, 1)')

        this.add(sprite)
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

    private static _computeVertexColors(geometry: THREE.ConeGeometry, _lightColor: THREE.Color) {
        const count = geometry.attributes.position.count;
        const colors = new Float32Array(count * 3);

        const lightColor = _lightColor.clone()

        for (let i = 0; i < count; i++) {
            const y = geometry.attributes.position.getY(i);
            if (y > 0) {
                colors[i * 3] = 1;     // R
                colors[i * 3 + 1] = 1; // G
                colors[i * 3 + 2] = 1; // B
            }
            else {
                colors[i * 3] = lightColor.r;     // R
                colors[i * 3 + 1] = lightColor.g; // G
                colors[i * 3 + 2] = lightColor.b; // B
            }
        }
        return colors
    }

    private _createDirArrow() {
        this._dirarrow = new Arrow(0.75, 0.05, 0.005)
        this._dirarrow.arrowBody.material.depthTest = !this.parameters.renderAboveAll
        this._dirarrow.arrowHead.material.depthTest = !this.parameters.renderAboveAll

        this._dirarrow.arrowBody.material.visible = this.parameters.renderDirArrow!
        this._dirarrow.arrowHead.material.visible = this.parameters.renderDirArrow!

        const eff = LightHelper._getEffectiveDist(this.targetLight.intensity) - this.targetLight.distance

        const geometry = new THREE.ConeGeometry(this.targetLight.angle, eff, this.parameters.coneRadialSegments!)
        if (this.parameters.enableLightColor) {
            const colors = BetterSpotLightHelper._computeVertexColors(geometry, this.targetLight.color)
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        }
        const cone = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            wireframe: true,
            depthTest: !this.parameters.renderAboveAll,
            vertexColors: this.parameters.enableLightColor
        }))
        cone.rotation.z += Math.PI
        cone.position.y += eff / 2

        this._dirarrow.arrowBody.position.y += 0.5
        this._dirarrow.arrowHead.position.y += 0.5
        this._dirarrow.add(cone)

        if (this.parameters.enableMap && this.targetLight.map) {
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(this.targetLight.angle, this.targetLight.angle),
                new THREE.MeshBasicMaterial({ side: 2, map: this.targetLight.map, opacity: 0.5, transparent: true, depthTest: true })
            )
            plane.position.y += eff
            plane.rotation.x += Math.PI * 0.5
            this._dirarrow.add(plane)
        }

        this.add(this._dirarrow, this.baseSprite!)
    }

    protected _loadpLightSprite(): void {
        const textureLoader = LightHelper.TLoader
        BetterSpotLightHelper._spotLightSprite = textureLoader.load(sprite_path)
    }

    public update() {
        super.update()

        const from = this.targetLight.position.clone()
        const to = this.targetLight.target.position.clone()
        this.direction = this._dirarrow.pointAtVector3(from, to)
        if (!this.parameters.disableTargetMatrixUpdate) {
            this.targetLight.target.updateMatrixWorld()
        }

        if (this._targetTracker && this.parameters.trackTarget) {
            this._targetTracker.position.set(to.x, to.y, to.z)
        }
    }
}


export const SpotLightHelper = BetterSpotLightHelper