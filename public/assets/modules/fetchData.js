function fetchData() {
    const compendiumPromise = fetch('https://botw-compendium.herokuapp.com/api/v3/compendium/all?game=totk')
        .then(response => {
            if (response.ok) return response.json();
            else console.error(response);
        })
        .then(data => {
            data = data.data;
            data.sort((a, b) => a.id - b.id);  // sort by id, ASC
            return data;
        })
        .catch(error => {
            console.error(error);
        });

    const otherEntriesPromise = fetch('/api/entries')
        .then(response => {
            if (response.ok) return response.json();
            else console.error(response);
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error(error);
        });
        
    return Promise.all([compendiumPromise, otherEntriesPromise])
        .then(data => data.flat(2));
}

export { fetchData };