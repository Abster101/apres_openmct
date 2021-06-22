import Dataset from './Dataset';

export default class DatasetCache {
    constructor(openmct) {
        this._openmct = openmct;
        this.datasets = {};
    }

    get(identifier) {
        let keystring = this._openmct.objects.makeKeyString(identifier);

        if (!this.datasets[keystring]) {
            this.datasets[keystring] = new Dataset(keystring);
        }

        return this.datasets[keystring];
    }
}