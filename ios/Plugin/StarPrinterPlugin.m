#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

/**
 * ObjC Bridge สำหรับลงทะเบียน StarPrinterPlugin กับ Capacitor
 *
 * ไฟล์นี้จำเป็นเพราะ Capacitor ใช้ ObjC runtime ในการค้นหา plugin
 * CAP_PLUGIN จะลงทะเบียน class "StarPrinterPlugin" ให้ Capacitor รู้จัก
 * CAP_PLUGIN_METHOD จะ map ชื่อ method ที่ JS เรียก ไปยัง Swift method
 */

CAP_PLUGIN(StarPrinterPlugin, "StarPrinter",
    CAP_PLUGIN_METHOD(connect, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(disconnect, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getStatus, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(searchPrinters, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(print, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openCashDrawer, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(configure, CAPPluginReturnPromise);
)
