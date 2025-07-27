import * as THREE from 'three'
import { LightHelper } from './types'
import Arrow from './_arrow'

interface HelperParameters {
    renderAboveAll: boolean,
    lightIconScale?: number,
    enableEffectiveRadius: boolean
    enableLightColor: boolean
    coneRadialSegments?: number
    renderDirArrow: boolean
    enableMap: boolean
}

class BetterSpotLightHelper extends LightHelper<THREE.SpotLight, HelperParameters> {
    public static _spotLightSprite: THREE.Texture
    protected _dirarrow!: Arrow
    protected indigator?: THREE.Mesh

    constructor(spotLight: THREE.SpotLight, parameters?: HelperParameters) {
        super()
        this.name = 'SPLIGHTHELPER'
        this.targetLight = spotLight
        this.parameters = parameters ?? {
            renderAboveAll: false,
            renderDirArrow: true,
            lightIconScale: 0.15,
            enableEffectiveRadius: true,
            enableLightColor: true,
            coneRadialSegments: 4,
            enableMap: true
        }
        this._loadpLightSprite()
        this._createSprite()
        this._createDirArrow()
    }

    private _createSprite() {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: BetterSpotLightHelper._spotLightSprite,
            transparent: true,
        })
        this.baseSprite = new THREE.Sprite(spriteMaterial)

        if (this.baseSprite) {
            this.baseSprite.scale.setScalar(0.15)
        }
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

        this._dirarrow.arrowBody.material.visible = this.parameters.renderDirArrow
        this._dirarrow.arrowHead.material.visible = this.parameters.renderDirArrow

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

        if (this.parameters.enableMap) {
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(this.targetLight.angle, this.targetLight.angle),
                new THREE.MeshBasicMaterial({ side: 2, map: this.targetLight.map })
            )
            plane.position.y += eff
            plane.rotation.x += Math.PI * 0.5
            this._dirarrow.add(plane)
        }

        this.add(this._dirarrow, this.baseSprite!)
    }

    protected _loadpLightSprite(): void {
        const textureLoader = LightHelper.TLoader
        BetterSpotLightHelper._spotLightSprite = textureLoader.load('/spotlight.png')
    }

    public update() {
        super.update()

        const from = this.targetLight.position.clone()
        const to = this.targetLight.target.position.clone()

        const dir = new THREE.Vector3().subVectors(to, from).normalize()

        // Align the arrow to look in the light's direction
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) // assuming Y+ is arrow's default direction
        this._dirarrow.setRotationFromQuaternion(quaternion)

    }
}


export const SpotLightHelper = BetterSpotLightHelper