import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.initParticles();
    this.initAnimations();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    hamburger?.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav?.classList.toggle('active');
    });

    // Scroll animations
    window.addEventListener('scroll', this.reveal);

    // Header scroll effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('header');
      if (window.scrollY > 10) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });
  }

  private reveal(): void {
    const reveals = document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right'
    );

    for (let i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const revealTop = reveals[i].getBoundingClientRect().top;
      const revealPoint = 150;

      if (revealTop < windowHeight - revealPoint) {
        reveals[i].classList.add('reveal-visible');
      }
    }
  }

  private initParticles(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    const particlesContainer = document.getElementById('particles-js');
    if (particlesContainer) {
      particlesContainer.appendChild(renderer.domElement);
    }

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;

    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    camera.position.z = 2;

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private initAnimations(): void {
    // Hero animations
    gsap.from('.hero-content', {
      duration: 1.2,
      y: 50,
      opacity: 0,
      ease: 'power3.out',
    });

    gsap.from('.hero-visual', {
      duration: 1.5,
      x: 100,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.3,
    });
  }
}
