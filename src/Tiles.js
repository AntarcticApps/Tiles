var React = require('react/addons');
var FluxibleApp = require('fluxible-app');
var AppComponent = React.createFactory(require('./components/TilesApp.jsx'));

var app = new FluxibleApp({
    appComponent: AppComponent
});

var context = app.createContext();
var loadPageAction = require('./actions/LoadPage');

context.executeAction(loadPageAction, {/*payload*/}, function (err) {
    if (err) {
        throw err;
    }

    var element = AppComponent({
        context: context.getComponentContext()
    });

    React.render(element, document.body);
});
