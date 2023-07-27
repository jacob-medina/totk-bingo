class WeightedValue {
    constructor(value, weight=1) {
        this.value = value;
        this.weight = weight;
    }
}

// returns a random value from an array of WeightedValues
// larger weights have a higher chance of being chosen
function getWeightedRandom(weightValues, seededRandom) {
    let weightSum = 0;
    const weightedArray = weightValues.map(wv => {
        weightSum += wv.weight;

        return {
            value: wv.value,
            max: weightSum
        };
    });

    const randNum = seededRandom.rand() * weightSum;
    const value = weightedArray.find(wv => randNum < wv.max);
    return value.value;
}

export { WeightedValue, getWeightedRandom };