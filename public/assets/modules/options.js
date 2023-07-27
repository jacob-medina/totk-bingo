import { challengeTypes } from "./ChallengeType.js";
import { titleCase } from "./formatName.js";
import { hideElement, showElement } from "./helper.js";


const defaultBoardSize = 5;
const defaultDiffMultiplier = 1.0;

let boardSize = defaultBoardSize;
let diffMultiplier = defaultDiffMultiplier;


function handleRandomSeedBtn() {
    const randSeed = Math.random().toString().slice(2,8);
    $('#seed-input').val(randSeed);
    replaceNewSeed(randSeed);
}

// gives the site a new seed from input, or a random one instead
function replaceNewSeed(seed=undefined) {
    seed = seed ?? Math.random().toString().slice(2,8);
    const url = location.href.split('?')[0]
    location.assign(url + `?seed=${seed}`);
}


function handleOptionsFormSubmit(event) {
    event.preventDefault();

    let seed = $('#seed-input').val().trim();

    if (seed === "") {
        handleRandomSeedBtn();
        return;
    }

    const params = new URLSearchParams({
        seed: seed,
        boardSize: (boardSize !== defaultBoardSize) ? boardSize : undefined,
        difficulty: (diffMultiplier !== defaultDiffMultiplier) ? diffMultiplier : undefined
    });

    let exclude = "";
    $('.include-option').each(function() {
        const opt = $(this);
        if (opt.prop('checked')) return;
        exclude += opt.attr('name') + ',';
    });
    exclude = exclude.slice(0, -1);

    if (exclude !== "") params.exclude = exclude;

    location.assign(url + `?seed=${seed}`);

    // replaceNewSeed(seed);
}


function setBoardSize() {
    boardSize = $('#board-size-range').val();
    const text = boardSize + 'x' + boardSize;
    $('.board-size').text(text);
}


function setDifficulty() {
    diffMultiplier = parseFloat($('#difficulty-range').val()).toFixed(1);
    $('.difficulty').text(diffMultiplier);
}


function generateChallengeOptions() {
    const optionsContainer = $('.challenge-options');
    let html = "";

    for (const challengeType of challengeTypes.sort((a, b) => b.diffMax - a.diffMax)) {
        const dashedName = challengeType.name.split(" ").join('-');
        html +=
`<div>
    <input type="checkbox" id="${dashedName}-option" class="include-option" name="${dashedName}" checked>
    <label for="${dashedName}-option">${titleCase(challengeType.name)}</label>
</div>`;
        html += "\n";
}
    optionsContainer.append(html);
}

export { boardSize, diffMultiplier, handleRandomSeedBtn, replaceNewSeed, handleOptionsFormSubmit, setBoardSize, setDifficulty, showBoardStats, hideBoardStats, generateChallengeOptions };