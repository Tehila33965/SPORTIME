import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { showLoading, showError, showEmpty } from '../../shared/dom.js';
import { confirmDialog } from '../../shared/modal.js';
import { getInstructors, deleteInstructor } from './instructor.service.js';

if (requireAdmin()) {
    mountHeader();

    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    const list = document.querySelector('#instructors-list');

    const getSearchValue = () => new URLSearchParams(window.location.search).get('name') || '';

    const updateSearchUrl = (value) => {
        const params = new URLSearchParams(window.location.search);

        if (value) {
            params.set('name', value);
        } else {
            params.delete('name');
        }

        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
        history.replaceState({}, '', nextUrl);
    };

    const createAvatar = (instructor) => {
        const avatar = document.createElement('div');
        avatar.className = 'instructor-avatar';

        if (instructor.image) {
            const image = document.createElement('img');
            image.src = instructor.image;
            image.alt = instructor.name;
            image.loading = 'lazy';
            image.addEventListener('error', () => {
                avatar.textContent = (instructor.name || '?').charAt(0).toUpperCase();
                avatar.classList.add('instructor-avatar--fallback');
                image.remove();
            });
            avatar.appendChild(image);
            return avatar;
        }

        avatar.textContent = (instructor.name || '?').charAt(0).toUpperCase();
        avatar.classList.add('instructor-avatar--fallback');
        return avatar;
    };

    const renderInstructorCard = (instructor) => {
        const card = document.createElement('article');
        card.className = 'instructor-card';
        card.dataset.id = instructor.id;

        const avatarWrap = createAvatar(instructor);

        const details = document.createElement('div');
        details.className = 'instructor-details';

        const titleRow = document.createElement('div');
        titleRow.className = 'instructor-title-row';

        const name = document.createElement('h2');
        name.className = 'instructor-name';
        name.textContent = instructor.name;

        const specialization = document.createElement('span');
        specialization.className = 'instructor-specialization';
        specialization.textContent = instructor.specialization;

        titleRow.append(name, specialization);

        const meta = document.createElement('div');
        meta.className = 'instructor-meta';

        const email = document.createElement('p');
        email.textContent = instructor.email;

        const phone = document.createElement('p');
        phone.textContent = instructor.phone;

        meta.append(email, phone);

        const actions = document.createElement('div');
        actions.className = 'instructor-actions';

        const editLink = document.createElement('a');
        editLink.className = 'btn btn-secondary';
        editLink.href = `./instructor-form.html?id=${instructor.id}`;
        editLink.textContent = 'עריכה';

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-danger';
        deleteButton.textContent = 'מחיקה';

        deleteButton.addEventListener('click', async () => {
            const confirmed = await confirmDialog({
                title: 'מחיקת מאמן',
                text: `האם למחוק את ${instructor.name}?`,
                confirmLabel: 'מחיקה',
                cancelLabel: 'ביטול',
            });

            if (!confirmed) {
                return;
            }

            try {
                await deleteInstructor(instructor.id);
                card.remove();

                if (!list.querySelector('.instructor-card')) {
                    showEmpty(list, 'לא נמצאו מאמנים');
                }
            } catch (error) {
                showError(list, error);
            }
        });

        actions.append(editLink, deleteButton);
        details.append(titleRow, meta);
        card.append(avatarWrap, details, actions);

        return card;
    };

    const loadInstructors = async () => {
        const rawName = getSearchValue();
        searchInput.value = rawName;

        showLoading(list, 'טוען מאמנים...');

        try {
            const instructors = await getInstructors({ name: rawName });

            if (!instructors || instructors.length === 0) {
                showEmpty(list, 'לא נמצאו מאמנים');
                return;
            }

            list.replaceChildren();
            const cards = instructors.map(renderInstructorCard);
            cards.forEach((card) => list.appendChild(card));
        } catch (error) {
            showError(list, error);
        }
    };

    searchInput.value = getSearchValue();

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = searchInput.value.trim();
        updateSearchUrl(value);
        loadInstructors();
    });

    loadInstructors();
}
