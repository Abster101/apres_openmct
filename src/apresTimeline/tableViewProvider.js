let exportCSV = {
    name: 'Export Table Data',
    key: 'export-csv-all',
    description: "Export this view's data",
    cssClass: 'icon-download labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().exportAllDataAsCSV();
    },
    group: 'view'
};
let exportMarkedDataAsCSV = {
    name: 'Export Marked Rows',
    key: 'export-csv-marked',
    description: "Export marked rows as CSV",
    cssClass: 'icon-download labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().exportMarkedDataAsCSV();
    },
    group: 'view'
};
let unmarkAllRows = {
    name: 'Unmark All Rows',
    key: 'unmark-all-rows',
    description: 'Unmark all rows',
    cssClass: 'icon-x labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().unmarkAllRows();
    },
    showInStatusBar: true,
    group: 'view'
};

let expandColumns = {
    name: 'Expand Columns',
    key: 'expand-columns',
    description: "Increase column widths to fit currently available data.",
    cssClass: 'icon-arrows-right-left labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().expandColumns();
    },
    showInStatusBar: true,
    group: 'view'
};
let autosizeColumns = {
    name: 'Autosize Columns',
    key: 'autosize-columns',
    description: "Automatically size columns to fit the table into the available space.",
    cssClass: 'icon-expand labeled',
    invoke: (objectPath, viewProvider) => {
        viewProvider.getViewContext().autosizeColumns();
    },
    showInStatusBar: true,
    group: 'view'
};
let viewActions = [
    exportCSV,
    exportMarkedDataAsCSV,
    unmarkAllRows,
    expandColumns,
    autosizeColumns
];

viewActions.forEach(action => {
    action.appliesTo = (objectPath, viewProvider = {}) => {
        let viewContext = viewProvider.getViewContext && viewProvider.getViewContext();

        if (viewContext) {
            let type = viewContext.type;

            return type === 'telemetry-table';
        }

        return false;
    };
});


