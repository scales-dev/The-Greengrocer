const carousel = document.querySelector('.events-carousel');

const track = carousel.querySelector('.events-track');
const slides = carousel.querySelectorAll('.event-slide');
const eventsTitle = document.querySelector('.promo > h1');

let current = 0;


// find the next event
const today = new Date();
today.setHours(0, 0, 0, 0);

let nextEvent = -1;

slides.forEach((slide, index) => {
    const date = new Date(slide.dataset.date);
    date.setHours(0, 0, 0, 0);

    if (date >= today && nextEvent === -1) {
        nextEvent = index;
    }
});


if (nextEvent !== -1) {
    current = nextEvent;
} else {
    current = slides.length - 1;
}


function updateCarousel() {

    slides.forEach((slide, index) => {

        const active = index === current;

        slide.classList.toggle('active', active);

        // show the correct arrows only on the active slide
        slide.querySelector('.events-prev').style.display =
            active && current > 0
                ? 'flex'
                : 'none';

        slide.querySelector('.events-next').style.display =
            active && current < slides.length - 1
                ? 'flex'
                : 'none';
    });


    // change heading
    if (current < nextEvent) {
        eventsTitle.textContent = 'Our previous events';
    }
    else if (current >= nextEvent) {
        eventsTitle.textContent = 'Our upcoming events';
    }


    // centre the active slide
    const currentSlide = slides[current];

    const carouselCentre =
        carousel.offsetWidth / 2;

    const slideCentre =
        currentSlide.offsetLeft +
        currentSlide.offsetWidth / 2;

    track.style.transform =
        `translateX(${carouselCentre - slideCentre}px)`;
}


// add click events to ALL arrows
carousel.querySelectorAll('.events-prev').forEach(button => {
    button.addEventListener('click', () => {
        if (current > 0) {
            current--;
            updateCarousel();
        }
    });
});
carousel.querySelectorAll('.events-next').forEach(button => {
    button.addEventListener('click', () => {
        if (current < slides.length - 1) {
            current++;
            updateCarousel();
        }
    });
});


window.addEventListener('resize', updateCarousel);
window.addEventListener('load', updateCarousel);