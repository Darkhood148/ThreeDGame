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
let enemy_add_rate = 100;
const min_rate = 40;
let enemies = [];
let isKeyPressed = false;
const cube_side = 0.5;
const allowedChars = "abcdefghijklmnopqrstuvwxyz";

const loader = new FontLoader();

class LinkedList { //Apparently JS doesn't have built-in implementation of LinkedList.
	constructor() {
	  this.nodes = [];
	}
  
	get size() {
	  return this.nodes.length;
	}
  
	insertAt(index, value) {
	  const previousNode = this.nodes[index - 1] || null;
	  const nextNode = this.nodes[index] || null;
	  const node = { value, next: nextNode };
  
	  if (previousNode) previousNode.next = node;
	  this.nodes.splice(index, 0, node);
	}
  
	insertLast(value) {
	  this.insertAt(this.size, value);
	}
  
	getAt(index) {
	  return this.nodes[index];
	}
  
	removeAt(index) {
	  const previousNode = this.nodes[index - 1];
	  const nextNode = this.nodes[index + 1] || null;
  
	  if (previousNode) previousNode.next = nextNode;
  
	  return this.nodes.splice(index, 1);
	}
  
	clear() {
	  this.nodes = [];
	}
  
	*[Symbol.iterator]() {
	  yield* this.nodes;
	}
  }

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
		this.character_associated = allowedChars.charAt(Math.random()*allowedChars.length);
		textSpawner(temp, this, this.character_associated);
	}
}

scene.add(platform);
scene.add(light);

camera.position.z = 3;
light.position.z = 3;

window.addEventListener('keydown', (event) => {
	let temp = event.code.charAt(3).toLowerCase();
	isKeyPressed = true;
  })

window.addEventListener('keyup', (event) => {
	isKeyPressed = false;
  })

function checkChar()
{

}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	frames++;
	console.log(isKeyPressed);
	if (frames % enemy_add_rate == 0) {
		frames = 0;
		let temp = new EnemyBox1();
		enemies.push(temp);
		scene.add(temp);
	}
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].position.z += enemies[i].velocity;
	}
}

animate();