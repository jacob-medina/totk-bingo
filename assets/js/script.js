function handleColorModeToggle(event) {
    let colorMode = $('body').attr('data-color-mode');
    colorMode = (colorMode === "dark") ? "light" : "dark";
    $('body').attr('data-color-mode', colorMode);
}


function init() {
   $(".color-mode-toggle").on("click", handleColorModeToggle); 
}

$(init());