import Foundation
import Capacitor

/**
 * StarPrinterPlugin - Capacitor Bridge สำหรับเชื่อมต่อเครื่องพิมพ์ Star Micronics บน iOS
 *
 * Plugin นี้ทำหน้าที่เป็นตัวกลางระหว่าง JavaScript (Capacitor) กับ Native iOS (Swift)
 * เพื่อให้สามารถสั่งพิมพ์ผ่าน USB, Bluetooth, หรือ LAN ได้
 *
 * การติดตั้ง:
 * 1. เพิ่ม StarIO SDK ผ่าน CocoaPods หรือ SPM
 * 2. คัดลอกไฟล์ Swift ไปยัง ios/App/App/Plugins/StarPrinter/
 * 3. ตั้งค่า Info.plist ตาม README
 */
@objc(StarPrinterPlugin)
public class StarPrinterPlugin: CAPPlugin, CAPBridgedPlugin {
    
    public let identifier = "StarPrinterPlugin"
    public let jsName = "StarPrinter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "connect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "searchPrinters", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "print", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openCashDrawer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise)
    ]
    
    private let manager = StarPrinterManager()
    
    // MARK: - Connect
    
    @objc func connect(_ call: CAPPluginCall) {
        guard let connectionType = call.getString("connectionType") else {
            call.reject("connectionType is required")
            return
        }
        
        let deviceIdentifier = call.getString("deviceIdentifier")
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            self.manager.connect(
                connectionType: connectionType,
                deviceIdentifier: deviceIdentifier
            ) { success, error in
                DispatchQueue.main.async {
                    if let error = error {
                        call.reject(error.localizedDescription)
                    } else {
                        call.resolve(["connected": success])
                    }
                }
            }
        }
    }
    
    // MARK: - Disconnect
    
    @objc func disconnect(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            self.manager.disconnect { success, error in
                DispatchQueue.main.async {
                    if let error = error {
                        call.reject(error.localizedDescription)
                    } else {
                        call.resolve(["disconnected": success])
                    }
                }
            }
        }
    }
    
    // MARK: - Get Status
    
    @objc func getStatus(_ call: CAPPluginCall) {
        let status = manager.getStatus()
        call.resolve([
            "connected": status.connected,
            "deviceName": status.deviceName ?? "",
            "online": status.online,
            "coverOpen": status.coverOpen,
            "paperEmpty": status.paperEmpty,
            "cutterError": status.cutterError
        ])
    }
    
    // MARK: - Search Printers
    
    @objc func searchPrinters(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            self.manager.searchPrinters { printers, error in
                DispatchQueue.main.async {
                    if let error = error {
                        call.reject(error.localizedDescription)
                    } else {
                        let printersData = printers.map { printer -> [String: Any] in
                            return [
                                "portName": printer.portName,
                                "macAddress": printer.macAddress ?? "",
                                "modelName": printer.modelName,
                                "connectionType": printer.connectionType
                            ]
                        }
                        call.resolve(["printers": printersData])
                    }
                }
            }
        }
    }
    
    // MARK: - Print
    
    @objc func print(_ call: CAPPluginCall) {
        guard let data = call.getString("data") else {
            call.reject("data is required")
            return
        }
        
        let cutType = call.getString("cutType") ?? "PartialCut"
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            self.manager.print(data: data, cutType: cutType) { success, error in
                DispatchQueue.main.async {
                    if let error = error {
                        call.reject(error.localizedDescription)
                    } else {
                        call.resolve(["success": success])
                    }
                }
            }
        }
    }
    
    // MARK: - Open Cash Drawer
    
    @objc func openCashDrawer(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            self.manager.openCashDrawer { success, error in
                DispatchQueue.main.async {
                    if let error = error {
                        call.reject(error.localizedDescription)
                    } else {
                        call.resolve(["opened": success])
                    }
                }
            }
        }
    }
    
    // MARK: - Configure
    
    @objc func configure(_ call: CAPPluginCall) {
        let paperWidth = call.getInt("paperWidth") ?? 80
        let encoding = call.getString("encoding") ?? "UTF-8"
        let language = call.getString("language") ?? "th"
        let cashDrawerOpenActiveHigh = call.getBool("cashDrawerOpenActiveHigh") ?? false
        
        manager.configure(
            paperWidth: paperWidth,
            encoding: encoding,
            language: language,
            cashDrawerOpenActiveHigh: cashDrawerOpenActiveHigh
        )
        
        call.resolve(["configured": true])
    }
}
