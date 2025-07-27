import * as THREE from 'three'

class Arrow extends THREE.Object3D
{
    public readonly arrowHead: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>
    public readonly arrowBody: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>

    constructor(length: number=0.5, coneh: number=0.05, thickness: number=0.05) {
        super()
        const mat = new THREE.MeshBasicMaterial({depthTest: false})
        
        this.arrowHead = new THREE.Mesh(
            new THREE.ConeGeometry(thickness*2, coneh),
            mat
        )

        this.arrowBody = new THREE.Mesh(
            new THREE.CylinderGeometry(thickness, thickness, length),
            mat
        )
        this.arrowHead.position.y += (length)/2 
        this.arrowBody.position.y -= coneh/2
        this.add(this.arrowBody, this.arrowHead)
    }

    pointAt(theta: number) {
        this.rotation.y = theta
    }

    setColor(color: THREE.Color) {
        this.arrowBody.material.color = color
        this.arrowBody.material.color = color
    }
}


export default Arrow