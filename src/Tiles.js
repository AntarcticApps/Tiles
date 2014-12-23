var React = require('react/addons');
var FluxibleApp = require('fluxible-app');
var AppComponent = React.createFactory(require('./components/TilesApp.jsx'));
var TileStore = require('./stores/TileStore');

var app = new FluxibleApp({
    appComponent: AppComponent
});

app.registerStore(TileStore);

var context = app.createContext();
var loadPageAction = require('./actions/loadPage');

context.executeAction(loadPageAction, {}, function (err) {
    if (err) {
        throw err;
    }

    var element = AppComponent({
        context: context.getComponentContext()
    });

    React.render(element, document.body);
});
