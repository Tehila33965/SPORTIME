import { LOGIN_PAGE, CLIENT_HOME, ADMIN_HOME } from '../config.js';
import { getUser, isLoggedIn, isAdmin, logout } from './session.js';

export const mountHeader = () => {
    const header = document.querySelector('header#site-header');
    if (!header) {
        throw new Error('לא נמצא header עם id="site-header"');
    }

    header.classList.add('site-header', 'site-header--solid');
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

        if (window.location.pathname === href) {
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

    const closeMenu = () => {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
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
        addLink('מערכת שעות', CLIENT_HOME);
        addLink('התחברות', LOGIN_PAGE);
    } else if (isAdmin()) {
        addLink('ניהול שיעורים', ADMIN_HOME);
        addLink('מאמנים', '/pages/admin/instructors.html');
        addLink('תבניות', '/pages/admin/templates.html');
        addLogoutButton();
    } else {
        addLink('מערכת שעות', CLIENT_HOME);
        addLink('ההרשמות שלי', '/pages/registrations/my-registrations.html');

        const userName = document.createElement('span');
        userName.textContent = `שלום, ${getUser()?.name ?? ''}`;
        nav.append(userName);

        addLogoutButton();
    }

    header.append(brand, nav, menuToggle);
};
