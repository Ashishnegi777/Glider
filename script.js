import { sliderData } from "./sliderData";
import gsap from "gsap";

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