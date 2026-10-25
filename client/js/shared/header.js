import { LOGIN_PAGE, CLIENT_HOME, ADMIN_HOME } from '../config.js';
import { isLoggedIn, isAdmin, logout } from './session.js';

export const mountHeader = () => {
    const header = document.querySelector('header#site-header');
    if (!header) {
        throw new Error('לא נמצא header עם id="site-header"');
    }

    header.classList.add('site-header');
    header.classList.remove('site-header--solid');
    header.replaceChildren();

    const brand = document.createElement('a');
    brand.className = 'brand';
    brand.href = '/index.html';
    brand.setAttribute('aria-label', 'SPORTIME — לעמוד הבית');

    const brandMark = document.createElement('span');
    brandMark.className = 'brand-mark';
    brandMark.setAttribute('aria-hidden', 'true');
    brandMark.textContent = 'S';

    const brandName = document.createElement('span');
    brandName.append('SPORTIME');
    const brandDot = document.createElement('span');
    brandDot.className = 'brand-dot';
    brandDot.textContent = '.';
    brandName.append(brandDot);
    brand.append(brandMark, brandName);

    const nav = document.createElement('nav');
    nav.id = 'main-nav';
    nav.className = 'main-nav';
    nav.setAttribute('aria-label', 'ניווט ראשי');

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

    const addLogoutButton = () => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-button';
        button.textContent = 'יציאה';
        button.addEventListener('click', logout);
        nav.append(button);
    };

    const cta = document.createElement('a');
    cta.className = 'header-cta';
    const setCta = (label, href) => {
        cta.href = href;
        cta.replaceChildren(document.createTextNode(`${label} `));
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '←';
        cta.append(arrow);
    };

    const closeMenu = () => {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'פתיחת תפריט');
    };

    const menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'פתיחת תפריט');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'main-nav');
    menuToggle.append(document.createElement('span'), document.createElement('span'));
    menuToggle.addEventListener('click', () => {
        const isOpen = header.classList.toggle('menu-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'סגירת תפריט' : 'פתיחת תפריט');
    });

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

    header.append(brand, nav, cta, menuToggle);
};
