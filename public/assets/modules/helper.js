function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function isBetween(value, min, max) {
    return (value >= min && value <= max);
}

function hideElement(element) {
    $(element).addClass("hide");
}

function showElement(element) {
    $(element).removeClass("hide");
}

export {clamp, isBetween, hideElement, showElement };