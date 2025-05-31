import * as THREE from "three";
import { scene, camera } from "./scene.js";

let depthTarget, depthTarget2;
let water;

function createWaterMesh() {
    const vertShader = `
        uniform float uTime;
        varying vec2 vUV;
        varying vec3 WorldPosition;

        void main() {
            vec3 pos = position;
            pos.z += cos(pos.x * 5.0 + uTime) * 0.1 * sin(pos.y * 5.0 + uTime);
            WorldPosition = pos;
            vUV = uv;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragShader = `
        #include <packing>

        varying vec2 vUV;
        varying vec3 WorldPosition;

        uniform sampler2D uSurfaceTexture;
        uniform sampler2D uDepthMap;
        uniform sampler2D uDepthMap2;
        uniform float uTime;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform vec4 uScreenSize;
        uniform bool isMask;

        float readDepth(sampler2D depthSampler, vec2 coord) {
            float fragCoordZ = texture2D(depthSampler, coord).x;
            float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
            return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
        }

        float getLinearScreenDepth(sampler2D map) {
            vec2 uv = gl_FragCoord.xy * uScreenSize.zw;
            return readDepth(map, uv);
        }

        void main() {
            vec4 color = vec4(0.0, 0.7, 1.0, 0.45);

            vec2 pos = vUV * 2.0;
            pos.y -= uTime * 0.002;
            vec4 WaterLines = texture2D(uSurfaceTexture, pos);
            color.rgba += WaterLines.r * 0.1;

            float worldDepth = getLinearScreenDepth(uDepthMap2);
            float screenDepth = getLinearScreenDepth(uDepthMap);
            float foamLine = clamp((screenDepth - worldDepth), 0.0, 1.0);

            if (foamLine < 0.001) {
                color.rgba += 0.2;
            }

            if (isMask) {
                color = vec4(1.0);
            }

            gl_FragColor = color;
        }
    `;

    const waterLinesTexture = new THREE.TextureLoader().load("textures/WaterTexture.png");
    waterLinesTexture.wrapS = THREE.RepeatWrapping;
    waterLinesTexture.wrapT = THREE.RepeatWrapping;

    const uniforms = {
        uTime: { value: 0.0 },
        uSurfaceTexture: { value: waterLinesTexture },
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        uDepthMap: { value: depthTarget.depthTexture },
        uDepthMap2: { value: depthTarget2.depthTexture },
        isMask: { value: false },
        uScreenSize: { value: new THREE.Vector4(window.innerWidth, window.innerHeight, 1 / window.innerWidth, 1 / window.innerHeight) }
    };

    const waterGeometry = new THREE.CircleGeometry(800, 64);
    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
    });

    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;

    return water;
}

function setupDepthBuffer() {
    depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    depthTarget.texture.format = THREE.RGBFormat;
    depthTarget.texture.minFilter = THREE.NearestFilter;
    depthTarget.texture.magFilter = THREE.NearestFilter;
    depthTarget.texture.generateMipmaps = false;
    depthTarget.stencilBuffer = false;
    depthTarget.depthBuffer = true;
    depthTarget.depthTexture = new THREE.DepthTexture();
    depthTarget.depthTexture.type = THREE.UnsignedShortType;

    depthTarget2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    depthTarget2.texture.format = THREE.RGBFormat;
    depthTarget2.texture.minFilter = THREE.NearestFilter;
    depthTarget2.texture.magFilter = THREE.NearestFilter;
    depthTarget2.texture.generateMipmaps = false;
    depthTarget2.stencilBuffer = false;
    depthTarget2.depthBuffer = true;
    depthTarget2.depthTexture = new THREE.DepthTexture();
    depthTarget2.depthTexture.type = THREE.UnsignedShortType;
}

function createWater() {
    setupDepthBuffer();
    water = createWaterMesh();
    scene.add(water);
    water.receiveShadow = true;
}

function updateWater() {
    if (water) {
        water.material.uniforms.uTime.value += 0.1;
    }
}

export { createWater, updateWater };
