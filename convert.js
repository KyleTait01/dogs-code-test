const fs = require('fs');

const input = JSON.parse(fs.readFileSync('dogs.json'));
const output = Object.entries(input).map(([breed, subBreeds]) => ({
    breed, subBreeds
}));

fs.writeFileSync('dogs-updated.json', JSON.stringify(output, null, 2));
console.log('Done');