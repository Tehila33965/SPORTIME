const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.carousel-dot'));
const hero = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex = 0;
let autoplay;

function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
        dots[slideIndex].classList.toggle('is-active', isActive);
        if (isActive) {
            dots[slideIndex].setAttribute('aria-current', 'true');
        } else {
            dots[slideIndex].removeAttribute('aria-current');
        }
    });
}

function stopAutoplay() {
    window.clearInterval(autoplay);
}

function startAutoplay() {
    stopAutoplay();
    if (!reducedMotion.matches) {
        autoplay = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    }
}

document.querySelectorAll('.carousel-arrow').forEach((button) => {
    button.addEventListener('click', () => {
        showSlide(activeIndex + Number(button.dataset.direction));
        startAutoplay();
    });
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
        startAutoplay();
    });
});

hero.addEventListener('mouseenter', stopAutoplay);
hero.addEventListener('mouseleave', startAutoplay);
hero.addEventListener('focusin', stopAutoplay);
hero.addEventListener('focusout', (event) => {
    if (!hero.contains(event.relatedTarget)) {
        startAutoplay();
    }
});

reducedMotion.addEventListener('change', startAutoplay);

const menuToggle = document.querySelector('.menu-toggle');
const siteHeader = document.querySelector('.site-header');

menuToggle.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
});

siteHeader.querySelectorAll('.main-nav a').forEach((link) => {
    link.addEventListener('click', () => {
        siteHeader.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

startAutoplay();
