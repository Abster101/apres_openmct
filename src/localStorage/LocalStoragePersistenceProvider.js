
class LocalStoragePersistenceProvider {
    constructor(space) {
        this.space = space || 'mct';
        this.spaces = this.space ? [this.space] : [];
        this.localStorage = window.localStorage;
    }

    setValue(key, value) {
        this.localStorage[key] = value;
    }

    getValue(key) {
        return this.localStorage[key] !== undefined
                ? JSON.parse(this.localStorage[key]) : {};
    }

    listSpaces() {
        return Promise.resolve(this.spaces);
    }

    list() {
        return Promise.resolve(Object.keys(this.getValue(this.space)));
    }

    create(model) {
        console.log('create', model);
        var spaceObj = this.getValue(this.space);
        spaceObj[model.identifier.key] = model;
        this.setValue(this.space, JSON.stringify(spaceObj));

        return Promise.resolve(true);
    }

    get(identifier) {
        var spaceObj = this.getValue('mct');
        const identifierWithNamespace = {
            namespace: '',
            key: identifier.key
        };

        const domainObject = {
            ...spaceObj[identifier.key],
            identifier: identifierWithNamespace,
        };

        return Promise.resolve(domainObject);
    }

    delete(identifier) {
        var spaceObj = this.getValue(this.space);
        delete spaceObj[identifier.key];
        this.setValue(this.space, spaceObj);

        return Promise.resolve(true);
    }

    update(model) {
        return this.create(model);
    }
}

export default LocalStoragePersistenceProvider;
