function titleCase(string) {
    let words = string.split(" ");
    words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return words.join(" ");
}


function simplifyName(name, id) {
    const namesToSimplify = [
        'duck', 'pigeon', 'sparrow', 'seagull', 'bear', 'fox', 'buck', 'moose', 'sheep',
        'coyote', 'cow', 'heron', 'squirrel', 'boar', 'hawk', 'doe', 'crow', 'buffalo'
    ];

    if (id === 171 || id === 170) return "stone talus";
    if (id === 13) return "goat";
    
    const words = name.split(" ");
    
    if (words.includes('wolf') || words.includes('coyote')) return 'wolf';
    if (words.includes('(new)')) return words.slice(0,-1).join(" ") + "✧";
    
    if (words.some(word => namesToSimplify.includes(word))) {
        return words.at(-1);
    }

    return name;
}


function getPlural(amount, name) {
    const words = name.split(" ");
    const pluralWordBefore = (word) => words.slice(0, words.indexOf(word) - 1).join(" ") + " " + words[words.indexOf(word) - 1] + "s " + words.slice(words.indexOf(word)).join(" ");

    if (amount === 1) return name;

    if (words.includes('moose') || words.includes('sheep') || words.at(-1) === "keese" || words.includes('carp') || words.includes('honey')) return name;
    if (name === "donkey") return name + "s";
    if (name === "wolf") return 'wolves';
    if (words.includes('of')) return pluralWordBefore('of');
    if (name.endsWith('✧')) return name.slice(0, -1) + "s✧";
    if (words.includes('bass') || name.endsWith('ss') || name.endsWith('x')) return name + "es";
    if (name.endsWith('s')) return name;
    if (name.endsWith('y')) return name.slice(0, -1) + 'ies';
    if (name.endsWith('h')) return name + "es";
    if (name.endsWith('i') || name.endsWith(' iv')) return name + "'s";

    if (amount > 1) return name + "s";
    return name;
}


function romanNumeral(string) {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v'];
    const romanNumberalPlurals = romanNumerals.map(string => string += "'s");

    let words = string.toLowerCase().split(" ");
    words = words.map(word => {
        if (romanNumerals.includes(word)) return word.toUpperCase();
        if (romanNumberalPlurals.includes(word)) return word.toUpperCase().slice(0, -2) + "'s";
        return word;
    });

    return words.join(" ");
}