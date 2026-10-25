import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { showError, showEmpty } from '../../shared/dom.js';
import { confirmDialog } from '../../shared/modal.js';
import { getClassTemplates, deleteClassTemplate } from './classTemplate.service.js';

if (requireAdmin()) {
    mountHeader();

    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    const list = document.querySelector('#templates-list');
    let searchTimeoutId;
    let lastRequestId = 0;

    const getSearchValue = () => new URLSearchParams(window.location.search).get('title') || '';

    const updateSearchUrl = (value) => {
        const params = new URLSearchParams(window.location.search);

        if (value) {
            params.set('title', value);
        } else {
            params.delete('title');
        }

        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
        history.replaceState({}, '', nextUrl);
    };

    const createImage = (template) => {
        const avatar = document.createElement('div');
        avatar.className = 'template-cover';

        if (template.image) {
            const image = document.createElement('img');
            image.src = template.image;
            image.alt = template.title;
            image.loading = 'lazy';
            image.addEventListener('error', () => {
                avatar.textContent = (template.title || '?').charAt(0).toUpperCase();
                avatar.classList.add('template-cover--fallback');
                image.remove();
            });
            avatar.appendChild(image);
            return avatar;
        }

        avatar.textContent = (template.title || '?').charAt(0).toUpperCase();
        avatar.classList.add('template-cover--fallback');
        return avatar;
    };

    const renderTemplateCard = (template) => {
        const card = document.createElement('article');
        card.className = 'template-card';
        card.dataset.id = template.id;

        const cover = createImage(template);

        const content = document.createElement('div');
        content.className = 'template-content';

        const title = document.createElement('h2');
        title.className = 'template-title';
        title.textContent = template.title;

        const category = document.createElement('span');
        category.className = 'template-category';
        category.textContent = template.category;

        const description = document.createElement('p');
        description.className = 'template-description';
        description.textContent = template.description;

        const actions = document.createElement('div');
        actions.className = 'template-actions';

        const editLink = document.createElement('a');
        editLink.className = 'btn btn-secondary';
        editLink.href = `./template-form.html?id=${template.id}`;
        editLink.textContent = 'עריכה';

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-danger';
        deleteButton.textContent = 'מחיקה';

        deleteButton.addEventListener('click', async () => {
            const confirmed = await confirmDialog({
                title: 'מחיקת תבנית',
                text: `האם למחוק את ${template.title}?`,
                confirmLabel: 'מחיקה',
                cancelLabel: 'ביטול',
            });

            if (!confirmed) {
                return;
            }

            try {
                await deleteClassTemplate(template.id);
                card.remove();

                if (!list.querySelector('.template-card')) {
                    showEmpty(list, 'לא נמצאו תבניות');
                }
            } catch (error) {
                showError(list, error);
            }
        });

        actions.append(editLink, deleteButton);
        content.append(title, category, description, actions);
        card.append(cover, content);

        return card;
    };

    const loadTemplates = async (valueOverride) => {
        const title = (valueOverride ?? searchInput.value).trim();
        const requestId = ++lastRequestId;

        updateSearchUrl(title);
        searchInput.value = title;

        try {
            const templates = await getClassTemplates({ title, limit: 100 });

            if (requestId !== lastRequestId) {
                return;
            }

            if (!templates || templates.length === 0) {
                showEmpty(list, 'לא נמצאו תבניות');
                return;
            }

            list.replaceChildren();
            templates.map(renderTemplateCard).forEach((card) => list.appendChild(card));
        } catch (error) {
            if (requestId !== lastRequestId) {
                return;
            }

            showError(list, error);
        }
    };

    const scheduleSearch = () => {
        window.clearTimeout(searchTimeoutId);
        searchTimeoutId = window.setTimeout(() => {
            loadTemplates(searchInput.value);
        }, 300);
    };

    searchInput.value = getSearchValue();

    searchInput.addEventListener('input', scheduleSearch);
    searchInput.addEventListener('search', () => {
        window.clearTimeout(searchTimeoutId);
        loadTemplates(searchInput.value);
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        window.clearTimeout(searchTimeoutId);
        loadTemplates(searchInput.value);
    });

    loadTemplates(searchInput.value);
}
