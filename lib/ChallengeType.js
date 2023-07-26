class ChallengeType {
    constructor(category, difficultyMin, difficultyMax, weight=1, uniqueName=undefined, filterFunc=undefined, calcAmount=undefined) {
        this.category = [category].flat();
        this.diffMin = difficultyMin;
        this.diffMax = difficultyMax;
        this.weight = weight;
        
        if (uniqueName) this.name = uniqueName;
        else this.name = this.category[0];

        if (filterFunc) this.filterFunc = filterFunc;
        if (calcAmount) this.calcAmount = calcAmount;
        else this.calcAmount = () => 1;

        this.entries = null;
    }

    getEntries(data) {
        if (this.entries) return this.entries;
        if (!data) return null;

        // filter by category
        let filteredData = [];
        for (const cat of this.category) {
            filteredData.push(data.filter(entry => entry.category === cat));
        }
        filteredData = filteredData.flat();

        // filter data by filterFunc (if applicable)
        this.entries = filteredData;
        if (this.filterFunc) this.entries = filteredData.filter(this.filterFunc);

        return this.entries;
    }

    getRandomEntry(seededRandom) {
        return this.getEntries()[seededRandom.randInt(this.getEntries().length)];
    }
}


const challengeTypes = [
    // challenges with 1 item
    new ChallengeType('main quests', 23, 24, 3),
    new ChallengeType('side quests', 5, 8, 1),
    new ChallengeType('shrine quests', 8, 12, 1),
    new ChallengeType('side adventures', 12, 20, 1),
    new ChallengeType('armor sets', 18, 24, 1),
    new ChallengeType('autobuild', 19, 19, 1),
    new ChallengeType('creatures', 13, 13, 1, 'patricia', entry => entry.name === 'patricia'),
    new ChallengeType('monsters', 23, 23, 1, 'bosses', entry => {
        const {id} = entry;
        const isBossOrGanondorf = isBetween(id, 191, 201);
        const isKohga = (id === 165);
        return isBossOrGanondorf || isKohga;
    }),
    new ChallengeType(['monsters', 'creatures'], 9, 9, 1, 'special horse/dragon/dondon', entry => {
        const {id, name} = entry;
        const isSpecialHorse = isBetween(id, 2, 5);
        const isDragon = (isBetween(id, 188, 190) || id === 202);
        const isDondon = (name === 'dondon');
        return isSpecialHorse || isDragon || isDondon;
    }),
    new ChallengeType('monsters', 3, 3, 0.2, 'training construct', entry => entry.id === 159),
    new ChallengeType('armor', 12, 14, 1),
    new ChallengeType('armor', 16, 16, 1, 'armor ★', entry => entry.upgradable),
    new ChallengeType('equipment', 14, 16, 1, 'unique equipment', entry => uniqueEquipment.includes(entry.name)),
    
    // challenges with 1 or more items
    new ChallengeType('korok seeds', 0, 24, 1.5, undefined, undefined,
        difficulty => clamp(2 * difficulty, 1, 1000)),
    new ChallengeType('shrines', 0, 24, 2, undefined, undefined,
        difficulty => clamp(Math.ceil(1.3 * difficulty), 1, 152)),
    new ChallengeType('towers', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 2.5), 1, 15)),
    new ChallengeType('lightroots', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 1.3), 1, 120)),
    new ChallengeType('cherry blossom trees', 0, 20, 0.3, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 1.3), 1, 8)),
    new ChallengeType('caves', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(1.3 * difficulty), 1, 147)),
    new ChallengeType('yiga schematics', 0, 24, 0.2, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 2), 1, 34)),
    new ChallengeType('hudson signs', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(1.3 * difficulty), 1, 81)),
    new ChallengeType("sage's wills", 0, 24, 0.5, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 3), 1, 20)),
    new ChallengeType('creatures', 0, 10, 1, undefined,
        entry => {
            const {id, name} = entry;
            const isSpecialHorse = (id >= 2 && id <= 5);
            const isDondon = (name === 'dondon');
            const isPatricia = (name === 'patricia');
            return !isSpecialHorse && !isDondon && !isPatricia;
        }, 
        difficulty => Math.max(Math.ceil(1.3 * difficulty), 1)),
    new ChallengeType('monsters', 4, 16, 1, 'mini bosses',
        entry => {
            const {id, name} = entry;
            const words = name.split(" ");
            const isMiniBoss = isBetween(id, 147, 150) || isBetween(id, 160, 162) || (isBetween(id, 169, 187) && id !== 184) || words.includes('lynel');
            const isSilver = words.includes('silver') || words.includes('iv');
            return isMiniBoss || isSilver;
        },
        difficulty => clamp(Math.ceil(difficulty / 5), 1, 3)),
    new ChallengeType('monsters', 0, 16, 1.5, undefined,
        entry => {
            const {id, name} = entry;
            const words = name.split(" ");
            const isBoss = isBetween(id, 191, 201) || (id === 165);
            const isDragon = (isBetween(id, 188, 190) || id === 202);
            const isMiniBoss = isBetween(id, 147, 150) || isBetween(id, 160, 162) || (isBetween(id, 169, 187) && id !== 184) || words.includes('lynel');
            const isSilver = words.includes('silver') || words.includes('iv');
            return !isBoss && !isDragon && !isMiniBoss && !isSilver;
        },
        difficulty => Math.max(difficulty, 1)),
    new ChallengeType('equipment', 2, 16, 1, undefined,
        entry => {
            const { name } = entry;
            const isUnique = uniqueEquipment.includes(name);
            const isNew = name.endsWith('(new)');
            return !isUnique && !isNew;
        },
        difficulty => Math.max(Math.floor(difficulty / 1.5), 1)),
    new ChallengeType('equipment', 10, 18, 1, 'equipment ✧',
        entry => entry.name.endsWith('(new)'),
        difficulty => Math.max(Math.ceil(difficulty / 4), 1)),
    new ChallengeType('materials', 0, 10, 1.5, undefined, undefined,
        difficulty => Math.max(Math.ceil(1.3 * difficulty), 1))
];

module.exports.ChallengeType = ChallengeType;
module.exports.challengeTypes = challengeTypes;
module.exports.weightReduce = 0.5;