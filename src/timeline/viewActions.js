const centerTimeline = {
    name: 'Center Timeline',
    key: 'center-timeline',
    description: "Set time bounds to center timeline",
    cssClass: 'icon-timeline labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().centerTimeline();
    },
    group: 'view',
};

const zoomIn = {
    name: 'Zoom In',
    key: 'zoom-in-timeline',
    description: "Zoom in by 5 minutes",
    cssClass: 'icon-plus labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().zoomIn();
    },
    group: 'view',
};

const zoomOut = {
    name: 'Zoom Out',
    key: 'zoom-out-timeline',
    description: "Zoom in by 5 minutes",
    cssClass: 'icon-minus labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().zoomOut();
    },
    group: 'view',
};

const viewActions = [
    centerTimeline,
    zoomIn,
    zoomOut
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