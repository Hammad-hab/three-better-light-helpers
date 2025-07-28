import * as THREE from 'three'

class Arrow extends THREE.Object3D {
    public readonly arrowHead: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>
    public readonly arrowBody: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>
    public length: number
    public coneh: number
    public thickness: number

    constructor(length: number = 0.5, coneh: number = 0.05, thickness: number = 0.05) {
        super()
        const mat = new THREE.MeshBasicMaterial({ depthTest: false })

        this.length = length
        this.coneh = coneh
        this.thickness = thickness

        this.arrowHead = new THREE.Mesh(
            new THREE.ConeGeometry(this.thickness * 2, this.coneh),
            mat
        )

        this.arrowBody = new THREE.Mesh(
            new THREE.CylinderGeometry(this.thickness, this.thickness, this.length),
            mat
        )
        this.arrowHead.position.y += (this.length) / 2
        this.arrowBody.position.y -= this.coneh / 2
        this.add(this.arrowBody, this.arrowHead)
    }

    pointAt(theta: number) {
        this.rotation.y = theta
    }

    pointAtVector3(_from: THREE.Vector3, _to: THREE.Vector3) {
        const from = _from.clone()
        const to = _to.clone()

        const dir = new THREE.Vector3().subVectors(to, from).normalize()

        // Align the arrow to look in the light's direction
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) // assuming Y+ is arrow's default direction
        this.setRotationFromQuaternion(quaternion)
        return dir
    }

    setColor(color: THREE.Color) {
        this.arrowBody.material.color = color
        this.arrowBody.material.color = color
    }
}


export default Arrow