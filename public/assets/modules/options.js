import { challengeTypes } from "./ChallengeType.js";
import { titleCase } from "./formatName.js";
import { getRandSeed } from "./SeededRandom.js";


const defaultBoardSize = 5;
const defaultDiffMultiplier = 1.0;

let boardSize = defaultBoardSize;
let diffMultiplier = defaultDiffMultiplier;


function handleRandomSeedBtn() {
    const randSeed = getRandSeed();
    $('#seed-input').val(randSeed);
    const params = new URLSearchParams(new URL(location.href).search);
    params.set('seed', randSeed)
    newBoard(params);
}


function newBoard(params) {
    const url = location.href.split('?')[0];
    console.log(params.toString());
    location.assign(url + "?" + params.toString());
}


function handleOptionsFormSubmit(event) {
    event.preventDefault();

    let seed = $('#seed-input').val().trim();
    if (seed === "") {
        const params = new URLSearchParams(new URL(location.href).search);
        seed = params.get("seed");
    }

    const params = new URLSearchParams({seed: seed});
    if (boardSize != defaultBoardSize) params.append('boardSize', boardSize.toString());
    if (diffMultiplier != defaultDiffMultiplier) params.append('difficulty', diffMultiplier.toString());

    let exclude = "";
    $('.include-option').each(function() {
        const opt = $(this);
        if (opt.prop('checked')) return;
        exclude += opt.attr('name') + ',';
    });
    exclude = exclude.slice(0, -1);

    if (exclude !== "") params.append('exclude', exclude);

    newBoard(params);
}


function resetOptions() {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    $('.seed').val(params.get("seed"));
    setBoardSizeValue(defaultBoardSize);
    setDifficultyValue(defaultDiffMultiplier);

    $('.include-option').each(function() {
        $(this).prop('checked', true);
    });
}


function setBoardSize(val) {
    boardSize = val;
}

function setDifficulty(val) {
    diffMultiplier = val;
}


function setBoardSizeValue(val) {
    if (val && val.type !== 'input') {
        setBoardSize(val);
        $('#board-size-range').val(boardSize);
    }
    else setBoardSize($('#board-size-range').val());
    const text = boardSize + 'x' + boardSize;
    $('.board-size').text(text);
}


function setDifficultyValue(val) {
    if (val && val.type !== 'input') {
        setDifficulty(val);
        $('#difficulty-range').val(diffMultiplier);
    }
    else setDifficulty( parseFloat($('#difficulty-range').val()).toFixed(1) );
    $('.difficulty').text(diffMultiplier);
}


function generateChallengeOptions() {
    const params = new URLSearchParams(new URL(location.href).search);
    const exclude = params.get("exclude");
    let excludeTypes = [];
    if (exclude) excludeTypes = exclude.split(',')
    
    const optionsContainer = $('.challenge-options');
    let html = "";

    for (const challengeType of challengeTypes.sort((a, b) => (a.name < b.name) ? -1 : 1)) {
        const dashedName = challengeType.name.split(" ").join('-');
        const checked = excludeTypes.includes(dashedName) ? "" : " checked";
        html +=
`<div>
    <input type="checkbox" id="${dashedName}-option" class="include-option" name="${dashedName}" ${checked}>
    <label for="${dashedName}-option">${titleCase(challengeType.name)}</label>
</div>`;
        html += "\n";
}
    optionsContainer.append(html);
}

export { boardSize, diffMultiplier, defaultBoardSize, defaultDiffMultiplier, newBoard, handleRandomSeedBtn, handleOptionsFormSubmit, resetOptions, setBoardSize, setDifficulty, setBoardSizeValue, setDifficultyValue, generateChallengeOptions };