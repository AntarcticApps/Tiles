var React = require('react/addons');
var FluxibleApp = require('fluxible-app');
var AppComponent = React.createFactory(require('./components/TilesApp.jsx'));
var TileStore = require('./stores/TileStore');
var ApplicationStore = require('./stores/ApplicationStore');
var storage = require('./chrome-integration/storage.js');

var app = new FluxibleApp({
    appComponent: AppComponent
});

app.registerStore(TileStore);
app.registerStore(ApplicationStore);

app.plug({
    name: 'LocalStoragePlugin',
    plugContext: function (options) {
        var storeHandler = options.storeHandler;

        return {
            plugStoreContext: function plugStoreContext(storeContext) {
                storeContext.dehydrateToLocalStorage = function dehydrateToLocalStorage() {
                    storeHandler();
                };
            }
        };
    }
});

var rehydrate = function rehydrate(callback) {
    storage.load(function loadHandlerCallback(data) {
        storage.load(function loadCallback(data) {
            if (data) {
                context.rehydrate(data);
            }

            callback();
        });
    });
}

var context = app.createContext({
    storeHandler: function storeHandler() {
        storage.store(context.dehydrate(context));
    }
});

var loadPageAction = require('./actions/loadPage');

storage.subscribeToContextualMenuEvents();

rehydrate(function rehydrateCallback() {
    context.executeAction(loadPageAction, {}, function (err) {
        if (err) {
            throw err;
        }

        var element = AppComponent({
            context: context.getComponentContext()
        });

        React.render(element, document.body);
    });
});
