class ThreeScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('three-canvas'),
            alpha: true,
            antialias: true
        });
        
        this.mouse = { x: 0, y: 0 };
        this.particles = [];
        this.gems = [];
        this.time = 0;
        
        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupLights();
        this.createParticles();
        this.createGems();
        this.setupEventListeners();
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Enable tone mapping for better colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point lights for gem illumination
        const pointLight1 = new THREE.PointLight(0xf59e0b, 0.8, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xef4444, 0.6, 100);
        pointLight2.position.set(-20, -20, 20);
        this.scene.add(pointLight2);

        // Spotlight for dramatic effect
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 50, 50);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        spotLight.decay = 2;
        spotLight.distance = 200;
        this.scene.add(spotLight);
    }

    createParticles() {
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Positions
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            // Colors (golden and red hues)
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                colors[i * 3] = 1; // R
                colors[i * 3 + 1] = 0.62; // G
                colors[i * 3 + 2] = 0.04; // B (golden)
            } else {
                colors[i * 3] = 1; // R
                colors[i * 3 + 1] = 0.25; // G
                colors[i * 3 + 2] = 0.25; // B (red)
            }

            // Sizes
            sizes[i] = Math.random() * 3 + 1;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                uniform float time;
                uniform float pixelRatio;
                attribute float size;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Add floating animation
                    pos.y += sin(time + position.x * 0.01) * 10.0;
                    pos.x += cos(time + position.z * 0.01) * 5.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        this.particles = this.particleSystem;
    }

    createGems() {
        const gemCount = 15;
        
        for (let i = 0; i < gemCount; i++) {
            // Create gem geometry (octahedron for diamond-like shape)
            const geometry = new THREE.OctahedronGeometry(Math.random() * 2 + 1, 2);
            
            // Create gem material with different colors
            const gemColors = [0xf59e0b, 0xef4444, 0x06b6d4, 0x8b5cf6, 0x10b981];
            const color = gemColors[Math.floor(Math.random() * gemColors.length)];
            
            const material = new THREE.MeshPhysicalMaterial({
                color: color,
                metalness: 0.1,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                transmission: 0.8,
                opacity: 0.9,
                transparent: true,
                ior: 2.4, // Index of refraction for diamond
                thickness: 1,
                envMapIntensity: 1
            });

            const gem = new THREE.Mesh(geometry, material);
            
            // Random position
            gem.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 100
            );
            
            // Random rotation
            gem.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Store initial position for animation
            gem.userData = {
                initialPosition: gem.position.clone(),
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.02 + 0.01,
                floatRange: Math.random() * 20 + 10
            };
            
            gem.castShadow = true;
            gem.receiveShadow = true;
            
            this.scene.add(gem);
            this.gems.push(gem);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Touch support for mobile
        document.addEventListener('touchmove', (event) => {
            if (event.touches[0]) {
                this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update pixel ratio for particles
        if (this.particleSystem && this.particleSystem.material.uniforms) {
            this.particleSystem.material.uniforms.pixelRatio.value = Math.min(window.devicePixelRatio, 2);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Update particles
        if (this.particleSystem && this.particleSystem.material.uniforms) {
            this.particleSystem.material.uniforms.time.value = this.time;
        }
        
        // Rotate particle system
        if (this.particleSystem) {
            this.particleSystem.rotation.y += 0.001;
            this.particleSystem.rotation.x = this.mouse.y * 0.1;
        }
        
        // Animate gems
        this.gems.forEach((gem, index) => {
            const userData = gem.userData;
            
            // Rotation
            gem.rotation.x += userData.rotationSpeed.x;
            gem.rotation.y += userData.rotationSpeed.y;
            gem.rotation.z += userData.rotationSpeed.z;
            
            // Floating animation
            const floatOffset = Math.sin(this.time * userData.floatSpeed + index) * userData.floatRange;
            gem.position.y = userData.initialPosition.y + floatOffset;
            
            // Mouse interaction
            const mouseInfluence = 0.05;
            gem.position.x = userData.initialPosition.x + this.mouse.x * mouseInfluence * (index % 2 ? 10 : -10);
            gem.position.z = userData.initialPosition.z + this.mouse.y * mouseInfluence * (index % 2 ? 10 : -10);
            
            // Pulsing scale effect
            const scale = 1 + Math.sin(this.time * 2 + index) * 0.1;
            gem.scale.setScalar(scale);
        });
        
        // Camera movement based on mouse
        this.camera.position.x = this.mouse.x * 5;
        this.camera.position.y = this.mouse.y * 5;
        this.camera.position.z = 50;
        this.camera.lookAt(0, 0, 0);
        
        // Add subtle camera rotation
        this.camera.position.x += Math.sin(this.time * 0.5) * 2;
        this.camera.position.y += Math.cos(this.time * 0.3) * 1;
        
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        // Clean up resources
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
        window.removeEventListener('resize', this.onWindowResize);
    }
}

// Initialize Three.js scene when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const threeScene = new ThreeScene();
    
    // Store reference for cleanup if needed
    window.threeScene = threeScene;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.threeScene) {
        window.threeScene.destroy();
    }
});