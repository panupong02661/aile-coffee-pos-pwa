#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(StarPrinterPlugin, "StarPrinter",
           CAP_PLUGIN_METHOD(connect, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disconnect, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getStatus, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(searchPrinters, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(print, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openCashDrawer, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(configure, CAPPluginReturnPromise);
)