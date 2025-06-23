import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let box, lid;
let isAnimating = false;
let counter = 0;

const sound1 = document.getElementById("box-sound1");
const sound2 = document.getElementById("box-sound2");

const sounds = [sound1, sound2]
const counterElement = document.getElementById("counter");

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 4);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("webgl"), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    // Box Base
    const baseGeometry = new THREE.BoxGeometry(1, 1, 1);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x156289 });
    box = new THREE.Mesh(baseGeometry, baseMaterial);
    scene.add(box);

    // Lid
    const lidGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const lidMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.set(0, 0.55, 0);
    lid.userData.clickable = true;
    scene.add(lid);

    // For hinge rotation
    lid.geometry.translate(0, -0.05, 0); // make it hinge from back
    lid.position.y = 0.55;

    // Click event
    renderer.domElement.addEventListener("click", onClick, false);

    // Resize
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function onClick(event) {
    if (isAnimating) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([lid]);

    if (intersects.length > 0) {
        isAnimating = true;
        counter++;
        counterElement.textContent = `Counter: ${counter}`;
        const random = Math.floor(Math.random() * 2)
        const sound = sounds[random]
        sound.currentTime = 0;
        
        sound.play();

        openLid().then(() => {
            setTimeout(() => {
                closeLid().then(() => {
                    isAnimating = false;
                });
            }, 1000); // wait 1s before closing
        });
    }
}

function openLid() {
    return new Promise(resolve => {
        const duration = 500; // ms
        const start = performance.now();
        const startAngle = 0;
        const targetAngle = -Math.PI / 2;

        function animateOpen(time) {
            let progress = (time - start) / duration;
            if (progress < 1) {
                lid.rotation.x = startAngle + (targetAngle - startAngle) * progress;
                requestAnimationFrame(animateOpen);
            } else {
                lid.rotation.x = targetAngle;
                resolve();
            }
        }

        requestAnimationFrame(animateOpen);
    });
}

function closeLid() {
    return new Promise(resolve => {
        const duration = 500;
        const start = performance.now();
        const startAngle = lid.rotation.x;
        const targetAngle = 0;

        function animateClose(time) {
            let progress = (time - start) / duration;
            if (progress < 1) {
                lid.rotation.x = startAngle + (targetAngle - startAngle) * progress;
                requestAnimationFrame(animateClose);
            } else {
                lid.rotation.x = targetAngle;
                resolve();
            }
        }

        requestAnimationFrame(animateClose);
    });
}

function animate() {
    requestAnimationFrame(animate);
    box.rotation.y += 0.005;
    lid.rotation.y += 0.005;
    renderer.render(scene, camera);
}
