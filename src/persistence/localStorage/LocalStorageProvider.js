const APRES_TIMELINE_KEY = 'apres.timeline';
import axios from 'axios';
import config from '../../../apresConfig.js';
import timelineUtil from '../../lib/timelineUtil';
import lodash from 'lodash';

class LocalStorageProvider {
    constructor(space, openmct, projectJSON) {
        this.space = space || 'mct';
        this.spaces = this.space ? [this.space] : [];
        this.openmct = openmct;
        this.localStorage = window.localStorage;
        this.cachedModel = projectJSON;
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
        var spaceObj = this.getValue(this.space);
        spaceObj[model.identifier.key] = model;
        this.setValue(this.space, JSON.stringify(spaceObj));


        if (model.identifier.key === APRES_TIMELINE_KEY) {
            const saveUrl = `${config['apres_service_root_url']}/save`;
            const projectJSON = timelineUtil.getProjectJsonFromTimelineObject(model);

            if (lodash.isEqual(projectJSON, this.cachedModel)) {
                return Promise.resolve(true);
            }
    
            this.cachedModel = projectJSON;

            return axios.put(saveUrl, projectJSON).then((success) => {
                this.openmct.notifications.info('Success: Project Saved to APRES Service.');
            });
        }

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

export default LocalStorageProvider;
