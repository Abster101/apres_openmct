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

const viewActions = [
    centerTimeline
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