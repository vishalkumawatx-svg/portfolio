'use strict';

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileBreakpoint = window.matchMedia('(max-width: 600px)');
const navigationLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a[href^="#"]');
const sections = [...document.querySelectorAll('main > section[id]')];
let menuOpen = false;

function setMenu(open, restoreFocus = false) {
    menuOpen = open;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.querySelector('main').inert = open;
    document.querySelector('footer').inert = open;
    document.body.classList.toggle('scroll-locked', open);
    if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => setMenu(!menuOpen));
mobileBreakpoint.addEventListener('change', (event) => {
    if (!event.matches) setMenu(false);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        setMenu(false);
        target.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth' });
        if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
        target.focus({ preventScroll: true });
        try {
            history.replaceState(null, '', link.getAttribute('href'));
        } catch { }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) setMenu(false, true);
    if (event.key !== 'Tab' || !menuOpen) return;
    const lastLink = mobileNav.querySelector('a:last-child');
    if (event.shiftKey && document.activeElement === menuToggle) {
        event.preventDefault();
        lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        menuToggle.focus();
    }
});

function updateNavigation() {
    header.classList.toggle('scrolled', window.scrollY > 12);
    const marker = header.offsetHeight + Math.min(180, window.innerHeight * 0.25);
    let currentSection = 'home';
    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) currentSection = section.id;
    });
    navigationLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentSection}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
}

let navigationFramePending = false;
function scheduleNavigationUpdate() {
    if (navigationFramePending) return;
    navigationFramePending = true;
    requestAnimationFrame(() => {
        updateNavigation();
        navigationFramePending = false;
    });
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
updateNavigation();

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('.back-top').addEventListener('click', () => {
    document.querySelector('.site-header .wordmark').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth' });
    try {
        history.replaceState(null, '', '#home');
    } catch { }
});

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !motionPreference.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove('pending');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.08 });
    reveals.forEach((element) => {
        if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('pending');
        revealObserver.observe(element);
    });
    motionPreference.addEventListener('change', (event) => {
        if (!event.matches) return;
        reveals.forEach((element) => element.classList.remove('pending'));
        revealObserver.disconnect();
    });
}

const copyButton = document.querySelector('.copy-button');
const toast = document.querySelector('.toast');
let toastTimer;
copyButton.addEventListener('click', async () => {
    copyButton.disabled = true;
    try {
        await navigator.clipboard.writeText('https://t.me/vishaldied');
        toast.textContent = 'Telegram link copied.';
    } catch {
        toast.textContent = 'Copy unavailable here. Connect using the Telegram link.';
    } finally {
        copyButton.disabled = false;
        clearTimeout(toastTimer);
        toast.classList.add('visible');
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
    }
});