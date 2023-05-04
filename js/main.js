import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const light = new THREE.DirectionalLight(0xffffff, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
let frames = 0;
let enemy_add_rate = 200;
const min_rate = 40;
let enemies = [];
let isKeyPressed = false;
const cube_side = 0.5;
const allowedChars = "abcdefghijklmnopqrstuvwxyz";
let score = 0;
let id = null;

const loader = new FontLoader();

class Box extends THREE.Mesh {
	constructor({ width = cube_side, height = cube_side, depth = cube_side, color, spawn_x = 0, spawn_y = 0, spawn_z = 0, velocity = 0 }) {
		super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color }));
		this.position.setX(spawn_x);
		this.position.setY(spawn_y);
		this.position.setZ(spawn_z);
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.velocity = velocity
	}
}

const platform = new Box({
	width: 5,
	height: 0.2,
	depth: 20,
	color: 0x73bfb8,
	spawn_y: -0.25
});

function textSpawner(spawn_x, qube, char) {
	loader.load('https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {

		const textGeometry = new TextGeometry(char, {
			font: font,
			size: 0.2,
			height: 0.1,
		});

		const material = new THREE.MeshStandardMaterial({
			color: 'lime',
			roughness: 0.5
		});

		const textMesh = new THREE.Mesh(textGeometry, material);
		textMesh.position.set(-0.09, -0.05, 0.2); //hit and trial random values.
		qube.add(textMesh);
	});
}

class EnemyBox1 extends Box {
	constructor() {
		let temp = (Math.random() - 0.5) * platform.width / 2;
		super({ color: 0xe39ec1, spawn_x: temp, spawn_z: -platform.depth / 2, velocity: Math.random() * 0.15 });
		this.character_associated = allowedChars.charAt(Math.random() * allowedChars.length);
		textSpawner(temp, this, this.character_associated);
	}
}

scene.add(platform);
scene.add(light);

camera.position.z = 3;
light.position.z = 3;

window.addEventListener('keydown', (event) => {
	let temp = event.code.charAt(3).toLowerCase();
	checkChar(temp);
	isKeyPressed = true;
})

window.addEventListener('keyup', (event) => {
	isKeyPressed = false;
})

function checkChar(ch) {
	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].character_associated === ch) {
			scene.remove(enemies[i]);
			enemies.splice(i, 1);
			score++;
		}
	}
}

function animate() {
	id = requestAnimationFrame(animate);
	renderer.render(scene, camera);
	frames++;
	if (frames % enemy_add_rate == 0) {
		frames = 0;
		let temp = new EnemyBox1();
		enemies.push(temp);
		scene.add(temp);
		if(enemy_add_rate>50){
			enemy_add_rate-=2;
		}
	}
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].position.z += enemies[i].velocity;
		document.getElementById("currentScore").innerHTML = score;
		if (enemies[i].position.z >= 5) {	//shouldn't it be 0?
			{
				console.log("Game Over");
				cancelAnimationFrame(id);
				document.getElementById("endGame").style.visibility = "visible";
				document.getElementById("endscore").innerHTML = score;
				let highScore = null;
				try {
					highScore = localStorage.getItem("highScore");
					if (score > highScore) {
						localStorage.setItem("highScore", score);
						highScore = score;
					}
				} catch {
					localStorage.setItem("highScore", score);
				}
				document.getElementById("endhighscore").innerHTML = highScore;
			}
		}
	}
}
function onResize() {
	console.log("Bruh");
	// Set the camera's aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;

	// update the camera's frustum
	camera.updateProjectionMatrix();

	// update the size of the renderer AND the canvas
	renderer.setSize(window.innerWidth, window.innerHeight);

	// set the pixel ratio (for mobile devices)
	renderer.setPixelRatio(window.devicePixelRatio);
}

window.addEventListener('resize', onResize); //for responsiveness B)

animate();