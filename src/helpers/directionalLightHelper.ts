import * as THREE from 'three'
import { LightHelper } from './types'
import Arrow from './_arrow'

interface HelperParameters {}

class BetterDirectionalLightHelper extends LightHelper<THREE.DirectionalLight, HelperParameters> {
    public static _dirLightSprite: THREE.Texture
    protected _dirarrow!: Arrow
    
    constructor(directionalLight: THREE.DirectionalLight) 
    {
        super()
        this.targetLight = directionalLight
        this._createDirArrow()
    }   

    private _createDirArrow() {
        this._dirarrow = new Arrow()
        this.add(this._dirarrow)
    } 

    protected _loadpLightSprite(): void {
        
    }

    public update() {
        super.update()
    }
}


export const DirectionalLightHelper = BetterDirectionalLightHelper