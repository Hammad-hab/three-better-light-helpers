import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Arrow from './helpers/_arrow'
import BetterPointLightHelper from './helpers/pointLightHelper'
/**
 * Constants
 */
const DPR = Math.min(window.devicePixelRatio, 2)

/**
 * GUI
 */

/**
 * Canvas
 */
const canvas: HTMLCanvasElement = document.querySelector('canvas.webgl')!

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0.25, 0.5, 1)
scene.add(camera)
camera.layers.enable(1)
/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(DPR)
renderer.shadowMap.enabled = true

/**
 * Resize Handling
 */
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Meshes
 */

const tloader = new THREE.TextureLoader()
const texture = tloader.load('/tool.jpg')
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 32, 32),
    new THREE.MeshStandardMaterial({
        map: texture
    })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
floor.name = 'floor'
scene.add(floor)

/**
 * Lights
 */
const pointLight = new THREE.PointLight()
pointLight.position.y += 0.5
pointLight.castShadow = true
pointLight.shadow.radius = 20
scene.add(pointLight)

const lhelper = new BetterPointLightHelper(pointLight)
scene.add(lhelper)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)


/**
 * Animation Loop
 */
const clock = new THREE.Clock()

function animate() {
    const elapsedTime = clock.getElapsedTime()

    // Update camera-related uniforms
   
    renderer.render(scene, camera)
    lhelper.update()
    controls.update()
    pointLight.position.x = Math.sin(elapsedTime)
    pointLight.intensity = Math.abs(Math.sin(elapsedTime))
    requestAnimationFrame(animate)
}
animate()
