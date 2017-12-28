import THREE = require("three");
import hankUrl = require("../static/hank.png");
import "../static/luna.png";
import "./index.scss";

function main(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    handleResizes(camera, renderer);
    addCanvas(renderer);

    const ball = createBall();
    scene.add(ball);
    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        ball.rotation.x =
            -1 / 24 * Math.PI +
            1 / 24 * Math.PI * Math.sin(Date.now() / (400 * 2 * Math.PI));
        ball.rotation.y =
            (3 / 2 + 1 / 24) * Math.PI +
            1 / 16 * Math.PI * Math.sin(Date.now() / (100 * 2 * Math.PI));
        renderer.render(scene, camera);
    }
    animate();
}

function handleResizes(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.Renderer,
): void {
    // Throttle resizes, as suggested by MDN.
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function addCanvas(renderer: THREE.Renderer): void {
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
}

function createBall(): THREE.Mesh {
    const geometry = new THREE.SphereBufferGeometry(2, 32, 32);
    const texture = new THREE.TextureLoader().load(hankUrl);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geometry, material);
}

main();
