const centerTimeline = {
    name: 'Center Timeline',
    key: 'apres:center-timeline',
    description: "Set time bounds to center timeline",
    cssClass: 'icon-timeline labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().centerTimeline();
    },
    group: 'view',
};

const zoomIn = {
    name: 'Zoom In',
    key: 'apres:zoom-in-timeline',
    description: "Zoom in by 5 minutes",
    cssClass: 'icon-plus labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().zoomIn();
    },
    group: 'view',
};

const zoomOut = {
    name: 'Zoom Out',
    key: 'apres:zoom-out-timeline',
    description: "Zoom in by 5 minutes",
    cssClass: 'icon-minus labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().zoomOut();
    },
    group: 'view',
};

const importTimeline = {
    name: 'Import Timeline',
    key: 'apres:import-timeline',
    description: 'Import timeline from JSON file',
    cssClass: 'icon-import',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().importTimeline();
    },
    group: 'view'
}

const viewActions = [
    importTimeline,
    centerTimeline,
    zoomIn,
    zoomOut,
];

viewActions.forEach(action => {
    action.appliesTo = (objectPath, viewProvider = {}) => {
        let viewContext = viewProvider.getViewContext && viewProvider.getViewContext();

        if (viewContext) {
            let type = viewContext.type;

            return type === 'timeline-component';
        }

        return false;
    };
})

export default viewActions;