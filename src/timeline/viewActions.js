const appliesTo = (objectPath, viewProvider = {}) => {
    return viewProvider.type === 'apres-timeline'
};

const centerTimeline = {
    name: 'Center Timeline',
    key: 'apres:center-timeline',
    description: "Set time bounds to center timeline",
    cssClass: 'icon-timeline labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.centerTimeline();
    },
    group: 'view',
    appliesTo,
};

const zoomIn = {
    name: 'Zoom In',
    key: 'apres:zoom-in-timeline',
    description: "Zoom in by 5 minutes",
    cssClass: 'icon-plus labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.zoomIn();
    },
    group: 'view',
    appliesTo,
};

const zoomOut = {
    name: 'Zoom Out',
    key: 'apres:zoom-out-timeline',
    description: "Zoom in by 5 minutes",
    cssClass: 'icon-minus labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.zoomOut();
    },
    group: 'view',
    appliesTo,
};

const importTimeline = {
    name: 'Import Timeline',
    key: 'apres:import-timeline',
    description: 'Import timeline from JSON file',
    cssClass: 'icon-import',
    invoke: (objectPath, viewProvider) => {
        viewProvider.importTimeline();
    },
    group: 'view',
    appliesTo,
}

const viewActions = [
    importTimeline,
    centerTimeline,
    zoomIn,
    zoomOut,
];

export default viewActions;