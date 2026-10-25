import { ADMIN_HOME, CLIENT_HOME, LOGIN_PAGE } from '../../config.js';
import { isAdmin, isLoggedIn, logout } from '../../shared/session.js';

const nav = document.querySelector('#main-nav');
const cta = document.querySelector('.header-cta');
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');

if (!nav || !cta || !header || !menuToggle) {
    throw new Error('לא נמצאו רכיבי הניווט הנדרשים בעמוד הבית');
}

const closeMenu = () => {
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'פתיחת תפריט');
};

const addLink = (label, href) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    const currentUrl = new URL(window.location.href);
    const linkUrl = new URL(href, window.location.origin);
    if (currentUrl.pathname === linkUrl.pathname && currentUrl.hash === linkUrl.hash) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
    }
    link.addEventListener('click', closeMenu);
    nav.append(link);
};

const setCta = (label, href) => {
    cta.href = href;
    cta.replaceChildren(document.createTextNode(`${label} `));

    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '←';
    cta.append(arrow);
};

const addLogoutButton = () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-button';
    button.textContent = 'יציאה';
    button.addEventListener('click', logout);
    nav.append(button);
};

const toggleMenu = () => {
    const isOpen = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'סגירת תפריט' : 'פתיחת תפריט');
};

menuToggle.addEventListener('click', toggleMenu);
nav.replaceChildren();

if (!isLoggedIn()) {
    addLink('עלינו', '/index.html#about');
    addLink('האימונים שלנו', '/index.html#training');
    addLink('צור קשר', '/index.html#contact');
    addLink('מערכת שעות', CLIENT_HOME);
    addLink('התחברות', LOGIN_PAGE);
    setCta('מתחילים לזוז', '/pages/auth/register.html');
} else if (isAdmin()) {
    addLink('ניהול שיעורים', ADMIN_HOME);
    addLink('מאמנים', '/pages/admin/instructors.html');
    addLink('תבניות', '/pages/admin/templates.html');
    addLogoutButton();
    setCta('לניהול השיעורים', ADMIN_HOME);
} else {
    addLink('עלינו', '/index.html#about');
    addLink('האימונים שלנו', '/index.html#training');
    addLink('צור קשר', '/index.html#contact');
    addLink('מערכת שעות', CLIENT_HOME);
    addLink('ההרשמות שלי', '/pages/registrations/my-registrations.html');
    addLogoutButton();
    setCta('למערכת השעות', CLIENT_HOME);
}
