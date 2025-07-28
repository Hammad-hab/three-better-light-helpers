import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Arrow from './helpers/_arrow'
import { PointLightHelper, DirectionalLightHelper, SpotLightHelper } from './helpers'
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
const renderer = new THREE.WebGLRenderer({ canvas, })
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
    new THREE.PlaneGeometry(10, 10, 32, 32),
    new THREE.MeshStandardMaterial({
        // map: texture
    })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
floor.name = 'floor'
scene.add(floor)

/**
 * Lights
 */
const spotLight = new THREE.SpotLight(0xffffff, 5, 0, Math.PI * 0.2, 1)
spotLight.map = texture
spotLight.position.y += 1
spotLight.castShadow = true


const pointLight = new THREE.PointLight(0xffffff, 3)
pointLight.position.y += 1
pointLight.position.x += 3.0
pointLight.castShadow = true


const dirLight = new THREE.DirectionalLight(0xff0fff, 1)
dirLight.position.y += 1
dirLight.position.x -= 3.0
dirLight.castShadow = true


scene.add(spotLight, pointLight, dirLight, dirLight.target, spotLight.target)

const lhelper = new SpotLightHelper(spotLight, {
    trackTarget: true
})
const l2helper = new PointLightHelper(pointLight,)
const l3helper = new DirectionalLightHelper(dirLight,{
    trackTarget: true
})
const l4 = new THREE.DirectionalLightHelper(dirLight)

scene.add(lhelper, l2helper, l3helper,)


const ambientLight = new THREE.AmbientLight(0xffffff, 0.01)
scene.add(ambientLight)


/**
 * Animation Loop
 */
const clock = new THREE.Clock()

function animate() {
    const elapsedTime = clock.getElapsedTime()

    // Update camera-related uniforms
    dirLight.target.updateMatrixWorld()
    dirLight.target.position.x = Math.sin(elapsedTime)

    renderer.render(scene, camera)
    lhelper.update()
    l2helper.update()
    l3helper.update()
    controls.update()

    l4.update()


    requestAnimationFrame(animate)
}
animate()
