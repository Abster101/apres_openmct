const APRES_TIMELINE_KEY = 'apres.timeline';
import axios from 'axios';
import config from '../../../apresConfig.js';
import timelineUtil from '../../lib/timelineUtil';
import cloneDeep from 'lodash/cloneDeep';

class LocalStorageProvider {
    constructor(space, openmct, projectJSON) {
        this.space = space || 'mct';
        this.spaces = this.space ? [this.space] : [];
        this.openmct = openmct;
        this.localStorage = window.localStorage;
        this.cachedModel = projectJSON;
        this.initialProjectJSON = cloneDeep(projectJSON);
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

    /** @param {TimelineDomainObject} model */
    create(model) {
        // TODO Don't save if any activities have invalid values.

        const spaceObj = this.getValue(this.space);
        spaceObj[model.identifier.key] = model;

        this.setValue(this.space, JSON.stringify(spaceObj));

        if (model.identifier.key === APRES_TIMELINE_KEY) {
            const saveUrl = `${config['apres_service_root_url']}/save`;
            const projectJSON = timelineUtil.getProjectJsonFromTimelineObject(model, this.initialProjectJSON);

            console.log('SAVE PROJECT!!!!!')

            return axios.put(saveUrl, projectJSON)
                .then((success) => {
                    return Promise.resolve(true);
                })
                .catch((error) => {
                    return Promise.reject(false);
                });
        }

        return Promise.resolve(true);
    }

    get(identifier) {
        const spaceObj = this.getValue('mct');
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
        const spaceObj = this.getValue(this.space);
        delete spaceObj[identifier.key];
        this.setValue(this.space, spaceObj);

        return Promise.resolve(true);
    }

    update(model) {
        return this.create(model);
    }
}

export default LocalStorageProvider;
