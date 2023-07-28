class SeededRandom {
    constructor(seed=Math.random().toString().slice(2,8)) {
        this._seed = seed;
        this.getSeed = () => this._seed;
        this.setSeed = (newSeed) => {this._seed = newSeed;};
        this.rand = this.mulberry32(this.cyrb128(this.getSeed()));
        this.randInt = (max) => Math.floor(this.rand() * max);
    }

    // START OF code from bryc @ https://stackoverflow.com/a/47593316
    // hashing function
    cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return (h1^h2^h3^h4)>>>0;
    }

    // random number generator
    mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
    // END OF code from bryc @ https://stackoverflow.com/a/47593316
}

const chars = '1234567890qwertyuiopasdfghjkzxcvbnm';

function getRandSeed() {
    const randNums = Array(8).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length)));
    return randNums.join("");
}

export { SeededRandom, getRandSeed };