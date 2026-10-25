import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { clearFormErrors, setFieldError, showFormError } from '../../shared/dom.js';
import { getClassTemplate, addClassTemplate, updateClassTemplate, getClassTemplates } from './classTemplate.service.js';

if (requireAdmin()) {
    mountHeader();

    const form = document.querySelector('#template-form');
    const title = document.querySelector('#template-form-title');
    const imageInput = document.querySelector('#image');
    const preview = document.querySelector('#image-preview');
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('id');
    const dataList = document.querySelector('#category-options');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    const updateCategoryList = async () => {
        try {
            const templates = await getClassTemplates();
            const categories = [...new Set(templates.map((item) => item.category).filter(Boolean))];
            dataList.replaceChildren();

            categories.forEach((category) => {
                const option = document.createElement('option');
                option.value = category;
                dataList.appendChild(option);
            });
        } catch {
            // אם אין אפשרות לטעון קטגוריות, נשאיר את הרשימה ריקה.
        }
    };

    const setPreview = (src) => {
        if (!src) {
            preview.hidden = true;
            preview.removeAttribute('src');
            return;
        }

        preview.src = src;
        preview.hidden = false;
    };

    const validateSelectedFile = (file) => {
        if (!file) {
            return true;
        }

        if (!allowedTypes.includes(file.type)) {
            setFieldError(imageInput, 'סוג הקובץ חייב להיות JPG, PNG או GIF');
            return false;
        }

        if (file.size > maxSize) {
            setFieldError(imageInput, 'הקובץ חייב להיות עד 5MB');
            return false;
        }

        return true;
    };

    imageInput.addEventListener('change', () => {
        clearFormErrors(form);
        const file = imageInput.files?.[0];

        if (!file) {
            setPreview('');
            return;
        }

        if (!validateSelectedFile(file)) {
            imageInput.value = '';
            setPreview('');
            return;
        }

        setPreview(URL.createObjectURL(file));
    });

    const populateForm = (template) => {
        form.elements.title.value = template.title || '';
        form.elements.description.value = template.description || '';
        form.elements.category.value = template.category || '';

        if (template.image) {
            setPreview(template.image);
        } else {
            setPreview('');
        }
    };

    const renderPageTitle = () => {
        title.textContent = templateId ? 'עריכת תבנית' : 'הוספת תבנית';
    };

    const loadTemplate = async () => {
        renderPageTitle();
        await updateCategoryList();

        if (!templateId) {
            return;
        }

        try {
            const template = await getClassTemplate(templateId);
            populateForm(template);
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לטעון את התבנית');
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormErrors(form);

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData();
        const file = imageInput.files?.[0];

        if (file && !validateSelectedFile(file)) {
            return;
        }

        formData.append('title', form.elements.title.value.trim());
        formData.append('description', form.elements.description.value.trim());
        formData.append('category', form.elements.category.value.trim());

        if (file) {
            formData.append('image', file);
        }

        try {
            if (templateId) {
                await updateClassTemplate(templateId, formData);
            } else {
                await addClassTemplate(formData);
            }

            window.location.href = './templates.html';
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לשמור את התבנית');
        }
    });

    loadTemplate();
}
