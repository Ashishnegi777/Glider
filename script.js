import { isDataView } from "util/types";
import { sliderData } from "./sliderData";
import gsap from "gsap";
import { stat } from "fs";

gsap.ticker.lagSmoothing(10000, 16);


const config = {
	SCROLL_SPEED: 1.75,
	LERP_FACTOR: 0.05,
	MAX_VELOCITY: 150,
};

const state = {
	currentX: 0,// current position of slider
	targetX: 0,//target position to be reach
	sliderWidth: 390,//
	slides: [],
	isDragging: false,
	startX: 0,
	lastX: 0,
	lastMouseX: 0,
	lastScrollTime: Date.now(),
	isMoving: false,
	velocity: 0,
	lastCurrentX: 0,
	dragDistance: 0,
	hasActualDragged: false,
	isMobile: false,
};

const totalSlideCount = sliderData.length;
const copies = 6;
const totalSlides = totalSlideCount * copies;
let track;

function checkMobile() {
	state.isMobile = window.innerWidth <= 768;
}


let count = document.querySelector(".loader-counter");

function counter (){
	let numCount = 0;
	function update(){

		if(numCount > 100) return;
		
		numCount += Math.floor(Math.random() * 20 ) + 1;
		
		if(numCount > 100){
			headerRevel();
			numCount = 100;
		} 
		
		count.textContent = numCount + "%";
		document.querySelector(".loader-bar").style.width = `${numCount}%`;
		
		let dely = Math.floor(Math.random() * 200 ) + 50;
		
		setTimeout(update, dely);
	} 
	
	requestAnimationFrame(update);
}

counter();

function headerRevel(){
	gsap.to("header", {
		y: -10000,
		duration: 0.5,
		delay: 0.2,
		ease: "power2.in",
	})
}

function createSlideElement(index) {
	const slide = document.createElement("div");
	slide.className = "slide";

	const width = state.isMobile ? 175 : 300;
	slide.style.width = `${width}px`;
	slide.style.flexShrink = "0";

	const imageContainer = document.createElement("div");
	imageContainer.className = "slide-image";

	const img = document.createElement("img");
	const dataIndex = index % totalSlideCount;
	img.src = sliderData[dataIndex].img;
	img.alt = sliderData[dataIndex].title;

	const overlay = document.createElement("div");
	overlay.className = "slide-overlay";

	const title = document.createElement("p");
	title.className = "project-title";
	title.textContent = sliderData[dataIndex].title;

	const arrow = document.createElement("div");
	arrow.className = "project-arrow";
	arrow.innerHTML = `
    <svg viewBox="0 0 24 24">
    <path d="M7 17L17 7M17 7H7M17 7V17"/>
    </svg>
    `;

	//checking if the user draging or clicking
	slide.addEventListener("click", (e) => {
		e.preventDefault();
		if (state.dragDistance < 8 && !state.hasActualDragged) {
			window.location.href = sliderData[dataIndex].url;
		}
	});

	overlay.appendChild(title);
	overlay.appendChild(arrow);
	imageContainer.appendChild(img);
	slide.appendChild(imageContainer);
	slide.appendChild(overlay);

	return slide;
}

function initializeSlides() {
	track = document.querySelector(".slide-track");
	track.innerHTML = "";

	state.sliderWidth = state.isMobile ? 215 : 300;
	state.slides = [];

	for (let i = 0; i < totalSlides; i++) {
		const slide = createSlideElement(i);
		track.appendChild(slide);
		state.slides.push(slide);
	}

	for (let i = 0; i < state.slides.length; i++) {
		if (i % 2 == 0) slideUp(state.slides[i]);
		else slideDown(state.slides[i]);
	}

	slideIn();

	const totalTrackWidth = state.sliderWidth * totalSlides;
	track.style.width = `${totalTrackWidth}px`;
	const initialOffset = -(state.sliderWidth * totalSlideCount * 2);// shifting the slider to the 2 copies ahead

	state.currentX = initialOffset;
	state.targetX = initialOffset;
}



function slideIn() {
	let ele = document.querySelector(".slide-track");
	const slide = document.querySelectorAll(".slide");
	ele.style.rotate = "-0.2deg";
	ele.style.overflow = "unset";


	gsap.from(slide,{
		scale: 0.2,
		translateY: 800,
		rotate: 10,
		delay: 0.1,
		stagger: 0.3,
		duration: 1.2,
		ease: "powe3.Out",
	});


}

function updateSlidePosition() {
	const sequenceWidth = state.sliderWidth * totalSlideCount;

	if (state.currentX > -sequenceWidth) {
		state.currentX -= sequenceWidth * 2;
		state.targetX -= sequenceWidth * 2;
	}
	 else if (state.currentX < -sequenceWidth * (copies - 2)) {
		state.currentX += sequenceWidth * 2;
		state.targetX += sequenceWidth * 2;
	}

	track.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
}



function updateParallax() {
	const viewportCenter = window.innerWidth / 2;
	state.slides.forEach((slide) => {
		const img = slide.querySelector("img");
		if (!img) return;
		const rect = slide.getBoundingClientRect();
		const slideCenter = rect.left + rect.width / 2;
		const offset = (slideCenter - viewportCenter) * -0.2;
		img.style.transform = `translateX(${offset}px) scale(2)`;
	});
}

function updateMovingState() {
	state.velocity = Math.abs(state.currentX - state.lastCurrentX);
	state.lastCurrentX = state.currentX;

	const isSlow = state.velocity < 0.15;
	const stillLongEnough = Date.now() - state.lastScrollTime > 200;
	state.isMoving = state.hasActualDragged || !isSlow || !stillLongEnough;

	document.documentElement.style.setProperty(
		"--slider-moving",
		state.isMoving ? "1" : "0"
	);
}


function handleWheel(e) {
	if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;// if user scrolling/swiping horizontally then reutrn it
	e.preventDefault();// preventing the default behaviour
	state.lastScrollTime = Date.now();
	const delta = e.deltaY * config.SCROLL_SPEED;
	state.targetX -= Math.max(
		Math.min(delta, config.MAX_VELOCITY),
		-config.MAX_VELOCITY
	);
}

function handleTouchStart(e){
	state.isDragging = true;
	state.startX = e.touches[0].clientX;//getting the first touch in horizontal direction
	state.lastX = state.targetX;
	state.dragDistance = 0;
	state.hasActualDragged = false;//resetting the flag
	state.lastScrollTime = Date.now();
}

function handleTouchMove(e){
	if(!state.isDragging) return;

	const deltaX = (e.touches[0].clientX - state.currentX) * 1.4;// how far user scrolled
	state.targetX = deltaX + state.lastX;// new target 
	state.dragDistance = Math.abs(deltaX);// saving the drag distance 
	state.hasActualDragged = deltaX - dragDistance > 5;// if user drag more then 5px
	state.lastScrollTime = Date.now(); //saving current time when user scroll
}


function handleTouchEnd(){
	state.isDragging = false;
	setTimeout(()=> (state.hasActualDragged = false), 80);
}

function handleMouseDown(e){
	e.preventDefault();// preving selecting text or default behaviours 
	state.isDragging = true;
	state.startX = e.clientX;// used to calculate how far mouse moved
	state.lastMouseX = e.clientX;// track the current mouse position 
	state.lastX = state.targetX;//store the slider position before drag starts 
	state.dragDistance= 0;
	state.lastScrollTime = Date.now();
	state.hasActualDragged =false;
	document.body.style.cursor = "grabbing";
}


function handleMouseMove(e){
	if(!state.isDragging) return;

	const deltaX  = e.clientX - state.startX;
	state.targetX += deltaX;
	state.lastCurrentX  = e.clientX;
	state.dragDistance = Math.abs(deltaX);
	state.hasActualDragged = state.dragDistance > 5;
	state.lastScrollTime = Date.now();
}

function handleMouseUp(e){
	state.isDragging = false;
	document.body.style.cursor = "";
	setTimeout(()=> state.hasActualDragged = false, 80);
}

