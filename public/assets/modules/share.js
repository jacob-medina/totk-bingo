import { hideElement, showElement } from "./helper.js";

function updateShareURL() {
    $('#share-url').val(location.href);
}

async function copyShareURL() {
    const message = $('.copy-link-btn + small');

    await navigator.clipboard.writeText($('#share-url').val())
        .then(
            () => {
                message.removeClass('error');
                message.text('Copied link!');
            }, 
            () => {
                message.addClass('error');
                message.text("Copy failed!");                
            }
        );
    showElement(message);
    setTimeout(() => hideElement(message), 3000);
}

export { updateShareURL, copyShareURL };