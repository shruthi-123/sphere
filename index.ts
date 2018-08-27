import * as glMatrix from 'gl-matrix';
import { Camera, Material, Scene, Sphere, Shader, WebGLUtils } from './src';

let angle: number = 0;
let shader: Shader;
let camera: Camera;
let earthMaterial: Material;
let earth: Sphere;
let scene: Scene;

let canvas = document.getElementById('webgl');
let gl = WebGLUtils.setupWebGL(canvas, null, null);

let earthImage = new Image();
earthImage.src = './earth.jpg';
earthImage.onload = () => setupScene();

const vertexShaderSource = `
  attribute vec3 a_Position;
  attribute vec2 a_TexCoord;

  uniform mat4 u_ModelViewProjectionMatrix;

  varying vec2 v_TexCoord;

  void main() {
    // Output tex coord to frag shader.
    v_TexCoord = a_TexCoord;

    // Output the final position.
    gl_Position = u_ModelViewProjectionMatrix * vec4(a_Position, 1.0);
  }
`;

const fragmentShaderSource = `
  #ifdef GL_ES
    precision mediump float;
  #endif

  uniform sampler2D u_Sampler;

  varying vec2 v_TexCoord;

  void main() {
    // Get texture color for tex coord.
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`;

function setupScene() {
  // Setup shader.
  shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);

  // Setup camera.
  let eye = [0.0, 0.0, 5.0];
  let center = [0.0, 0.0, 0.0];
  let up = [0.0, 1.0, 0.0];
  let fov = Math.PI / 3;
  let aspect = 1.0;
  let near = 0.1;
  let far = 100.0;
  camera = new Camera(eye, center, up, fov, aspect, near, far);

  // Setup Earth.
  earthMaterial = new Material(gl, null, null, null, null, earthImage);
  earth = new Sphere(gl, earthMaterial, 2, 250, 250);

  // Setup scene.
  scene = new Scene([earth], null);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  WebGLUtils.animate(update, draw);
}

function update(seconds: number) {
  angle += (Math.PI / 4) * seconds;
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  earth.modelToWorld = glMatrix.mat4.create();
  glMatrix.mat4.rotateY(earth.modelToWorld, earth.modelToWorld, -angle);

  shader.draw(scene, camera);
}