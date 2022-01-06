export default class Dataset {
    constructor(parentIndentifier, openmct) {
        this._openmct = openmct;
        this.parentIndentifier = parentIndentifier;
        this.actionTypes;
        this.stateChronicleTypes;
    }

    getActionTypes() {
        if (this.actionTypes) {
            return this.actionTypes;
        } else {

        }
    }
    stateChronicleTypes(){
        if (this.stateChronicleTypes) {
            return this.stateChronicleTypes;
        } else {

        }
    }
}
