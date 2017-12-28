import THREE = require("three");
import hankUrl = require("../static/hank.png");
import lunaUrl = require("../static/luna.png");
import { assertNever } from "./assertNever";
import "./index.scss";
import { makeResolvablePromise } from "./resolvablePromise";

enum DogName {
    Hank = "Hank",
    Luna = "Luna",
}

interface CancelToken {
    cancel(): void;
}

async function main(): Promise<void> {
    const { scene, render } = createSetting();
    const getHank = makeLazyLoadTexture(hankUrl);
    const getLuna = makeLazyLoadTexture(lunaUrl);
    const ballGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
    let currentDog = fixAndGetHash();
    let ball = await createBall(currentDog);

    startAnimating();
    syncWithHashChanges();

    async function createBall(dogName: DogName): Promise<THREE.Mesh> {
        const texture = await getTexture(dogName);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(ballGeometry, material);
        scene.add(mesh);
        return mesh;
    }

    function getTexture(dogName: DogName): Promise<THREE.Texture> {
        switch (dogName) {
            case DogName.Hank:
                return getHank();
            case DogName.Luna:
                return getLuna();
            default:
                return assertNever(dogName, `Unexpected dog: ${dogName}`);
        }
    }

    function startAnimating(): CancelToken {
        let isCancelled = false;
        const cancel = () => (isCancelled = true);
        (function animate() {
            if (!isCancelled) {
                requestAnimationFrame(animate);
                ball.rotation.x =
                    -1 / 24 * Math.PI +
                    1 /
                        24 *
                        Math.PI *
                        Math.sin(Date.now() / (400 * 2 * Math.PI));
                ball.rotation.y =
                    (3 / 2 + 1 / 24) * Math.PI +
                    1 /
                        16 *
                        Math.PI *
                        Math.sin(Date.now() / (100 * 2 * Math.PI));
                render();
            }
        })();
        return { cancel };
    }

    function syncWithHashChanges(): void {
        const sync = async () => {
            const dog = fixAndGetHash();
            if (currentDog !== dog) {
                currentDog = dog;
                const newBall = await createBall(dog);
                scene.remove(ball);
                scene.add(newBall);
                ball = newBall;
                // Sync again because hash may have changed again while ball
                // was changing.
                await sync();
            }
        };
        let isSynching = false;
        window.addEventListener("hashchange", async () => {
            if (!isSynching) {
                isSynching = true;
                await sync();
                isSynching = false;
            }
        });
    }
}

function createSetting() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    handleResizes(camera, renderer);
    addCanvas(renderer);
    const render = () => renderer.render(scene, camera);
    return { scene, camera, render };
}

function handleResizes(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.Renderer,
): void {
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

function makeLazyLoadTexture(url: string): () => Promise<THREE.Texture> {
    const { promise, resolve, reject } = makeResolvablePromise<THREE.Texture>();
    let isLoaded = false;
    return () => {
        if (!isLoaded) {
            isLoaded = true;
            new THREE.TextureLoader().load(url, resolve, undefined, reject);
        }
        return promise;
    };
}

function fixAndGetHash(): DogName {
    switch (window.location.hash.slice(1).toLowerCase()) {
        case "hank":
            return DogName.Hank;
        case "luna":
            return DogName.Luna;
        default:
            window.location.hash = "hank";
            return DogName.Hank;
    }
}

main();
