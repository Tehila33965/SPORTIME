import { mountHeader } from '../../shared/header.js';
import { requireAdmin } from '../../shared/guard.js';
import { clearFormErrors, showFormError } from '../../shared/dom.js';
import { addInstructor, getInstructor, updateInstructor } from './instructor.service.js';

if (requireAdmin()) {
    mountHeader();

    const form = document.querySelector('#instructor-form');
    const title = document.querySelector('#form-title');
    const imageInput = document.querySelector('#image');
    const preview = document.querySelector('#image-preview');
    const params = new URLSearchParams(window.location.search);
    const instructorId = params.get('id');

    const updatePreview = () => {
        const value = imageInput.value.trim();

        if (!value) {
            preview.hidden = true;
            preview.removeAttribute('src');
            return;
        }

        preview.src = value;
        preview.hidden = false;
    };

    imageInput.addEventListener('input', updatePreview);

    const populateForm = (instructor) => {
        form.elements.name.value = instructor.name || '';
        form.elements.specialization.value = instructor.specialization || '';
        form.elements.email.value = instructor.email || '';
        form.elements.phone.value = instructor.phone || '';
        form.elements.image.value = instructor.image || '';
        updatePreview();
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

        const payload = {
            name: form.elements.name.value.trim(),
            specialization: form.elements.specialization.value.trim(),
            email: form.elements.email.value.trim(),
            phone: form.elements.phone.value.trim(),
            image: form.elements.image.value.trim(),
        };

        try {
            if (instructorId) {
                await updateInstructor(instructorId, payload);
            } else {
                await addInstructor(payload);
            }

            window.location.href = './instructors.html';
        } catch (error) {
            showFormError(form, error.message || 'לא ניתן לשמור את המאמן');
        }
    });

    renderPageTitle();
    loadInstructor();
}
