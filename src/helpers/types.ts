import * as THREE from 'three'



abstract class LightHelper<L extends THREE.Light, P extends Object> extends THREE.Object3D {
    protected targetLight!: L
    protected parameters!: P
    protected baseSprite?: THREE.Sprite
    

    public static TLoader = new THREE.TextureLoader();

    protected static _getEffectiveDist(intensity: number, MAX_LIGHT_NG: number=0.01, SCALE_FACTOR: number=10) {
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
}