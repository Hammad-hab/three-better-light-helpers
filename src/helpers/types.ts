import * as THREE from 'three'


const MAX_LIGHT_NG = 0.01
const SCALE_FACTOR = 10

abstract class LightHelper<L extends THREE.Light, P extends Object> extends THREE.Object3D {
    protected targetLight!: L
    protected parameters!: P
    protected baseSprite?: THREE.Sprite
    

    public static TLoader = new THREE.TextureLoader();

    protected static _getEffectiveDist(intensity: number) {
        return Math.sqrt(intensity / MAX_LIGHT_NG) / SCALE_FACTOR // d = sqrt(intensity/intensity_at_point)
    }

    protected abstract _loadpLightSprite(): void
    public update(): void {
        this.position.copy(this.targetLight.position)
        this.rotation.copy(this.targetLight.rotation)
    }
}


export {
    LightHelper,
    MAX_LIGHT_NG,
    SCALE_FACTOR
}