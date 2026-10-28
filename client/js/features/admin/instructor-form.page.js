import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { clearFormErrors, setFieldError, showFormError } from '../../shared/dom.js';
import { addInstructor, getInstructor, updateInstructor } from './instructor.service.js';

if (requireAdmin()) {
    mountHeader();

    const form = document.querySelector('#instructor-form');
    const title = document.querySelector('#form-title');
    const imageInput = document.querySelector('#image');
    const preview = document.querySelector('#image-preview');
    const params = new URLSearchParams(window.location.search);
    const instructorId = params.get('id');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    let currentImage = '';
    let previewObjectUrl = '';

    const setPreview = (src) => {
        if (previewObjectUrl) {
            URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = '';
        }
        if (!src) {
            preview.hidden = true;
            preview.removeAttribute('src');
            return;
        }

        preview.src = src;
        preview.hidden = false;
        if (src.startsWith('blob:')) {
            previewObjectUrl = src;
        }
    };

    const validateSelectedFile = (file) => {
        if (!file) {
            return true;
        }

        if (!allowedTypes.includes(file.type)) {
            setFieldError(imageInput, 'סוג הקובץ חייב להיות JPG, PNG, GIF או WEBP');
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
            setPreview(currentImage);
            return;
        }

        if (!validateSelectedFile(file)) {
            imageInput.value = '';
            setPreview(currentImage);
            return;
        }

        setPreview(URL.createObjectURL(file));
    });

    const populateForm = (instructor) => {
        form.elements.name.value = instructor.name || '';
        form.elements.specialization.value = instructor.specialization || '';
        form.elements.email.value = instructor.email || '';
        form.elements.phone.value = instructor.phone || '';
        currentImage = instructor.image || '';
        setPreview(currentImage);
    };

    const renderPageTitle = () => {
        title.textContent = instructorId ? 'עריכת מאמן' : 'הוספת מאמן';
    };

    const loadInstructor = async () => {
        if (!instructorId) {
            renderPageTitle();
            return;
        }

        try {
            const instructor = await getInstructor(instructorId);
            populateForm(instructor);
            renderPageTitle();
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לטעון את פרטי המאמן');
            renderPageTitle();
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormErrors(form);

        if (!form.reportValidity()) {
            return;
        }

        const file = imageInput.files?.[0];
        if (file && !validateSelectedFile(file)) {
            return;
        }

        const formData = new FormData();
        formData.append('name', form.elements.name.value.trim());
        formData.append('specialization', form.elements.specialization.value.trim());
        formData.append('email', form.elements.email.value.trim());
        formData.append('phone', form.elements.phone.value.trim());
        if (file) {
            formData.append('image', file);
        }

        try {
            if (instructorId) {
                await updateInstructor(instructorId, formData);
            } else {
                await addInstructor(formData);
            }

            window.location.href = './instructors.html';
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לשמור את המאמן');
        }
    });

    renderPageTitle();
    loadInstructor();
}
