import Foundation
import Capacitor
import StarIO10

@objc(StarPrinterPlugin)
public class StarPrinterPlugin: CAPPlugin {
    private var printer: StarPrinter?
    private var manager: StarConnectionManager?
    
    @objc func connect(_ call: CAPPluginCall) {
        guard let connectionType = call.getString("connectionType") else {
            call.reject("Connection type is required")
            return
        }
        
        let deviceIdentifier = call.getString("deviceIdentifier")
        
        DispatchQueue.global().async {
            do {
                // Search for printers
                let printers = try StarDeviceDiscoveryManagerFactory.create(interfaceTypes: [.usb, .bluetooth, .lan]).discoverDevices(timeout: 3000)
                
                guard let firstPrinter = printers.first else {
                    call.reject("No printers found")
                    return
                }
                
                // Create printer instance
                self.printer = StarPrinterBuilder()
                    .interface(firstPrinter.interface)
                    .model(StarPrinterModel.tsp100iii)
                    .build()
                
                // Open connection
                try self.printer?.open()
                
                DispatchQueue.main.async {
                    call.resolve([
                        "connected": true,
                        "deviceName": firstPrinter.model,
                        "portName": firstPrinter.connectionSettings.portName
                    ])
                }
                
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to connect: \(error.localizedDescription)")
                }
            }
        }
    }
    
    @objc func disconnect(_ call: CAPPluginCall) {
        DispatchQueue.global().async {
            do {
                try self.printer?.close()
                self.printer = nil
                
                DispatchQueue.main.async {
                    call.resolve(["disconnected": true])
                }
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to disconnect: \(error.localizedDescription)")
                }
            }
        }
    }
    
    @objc func getStatus(_ call: CAPPluginCall) {
        guard let printer = self.printer else {
            call.resolve(["connected": false])
            return
        }
        
        DispatchQueue.global().async {
            do {
                let status = try printer.getStatus()
                
                DispatchQueue.main.async {
                    call.resolve([
                        "connected": true,
                        "online": !status.hasError,
                        "coverOpen": status.coverOpen,
                        "cutterError": status.cutterError,
                        "paperEmpty": status.paperEmpty,
                        "drawerOpen": status.drawerOpen
                    ])
                }
            } catch {
                DispatchQueue.main.async {
                    call.resolve(["connected": false])
                }
            }
        }
    }
    
    @objc func searchPrinters(_ call: CAPPluginCall) {
        DispatchQueue.global().async {
            do {
                let printers = try StarDeviceDiscoveryManagerFactory.create(interfaceTypes: [.usb, .bluetooth, .lan]).discoverDevices(timeout: 3000)
                
                let printerList = printers.map { printer in
                    return [
                        "portName": printer.connectionSettings.portName,
                        "modelName": printer.model,
                        "connectionType": self.connectionTypeString(for: printer.interface),
                        "macAddress": printer.connectionSettings.identifier ?? ""
                    ]
                }
                
                DispatchQueue.main.async {
                    call.resolve(["printers": printerList])
                }
                
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to search printers: \(error.localizedDescription)")
                }
            }
        }
    }
    
    @objc func print(_ call: CAPPluginCall) {
        guard let printer = self.printer else {
            call.reject("Printer not connected")
            return
        }
        
        guard let data = call.getString("data") else {
            call.reject("Print data is required")
            return
        }
        
        let cutType = call.getString("cutType") ?? "PartialCut"
        
        DispatchQueue.global().async {
            do {
                let builder = StarDocumentBuilder()
                
                // Add receipt content
                builder.addText(data)
                builder.addCutLine(self.cutType(from: cutType))
                
                let document = builder.getDocument()
                
                // Print
                try printer.print(document: document)
                
                DispatchQueue.main.async {
                    call.resolve(["success": true])
                }
                
            } catch {
                DispatchQueue.main.async {
                    call.reject("Print failed: \(error.localizedDescription)")
                }
            }
        }
    }
    
    @objc func openCashDrawer(_ call: CAPPluginCall) {
        guard let printer = self.printer else {
            call.reject("Printer not connected")
            return
        }
        
        DispatchQueue.global().async {
            do {
                let builder = StarDocumentBuilder()
                builder.addDrawerOpenAction(channel: .no1)
                let document = builder.getDocument()
                
                try printer.print(document: document)
                
                DispatchQueue.main.async {
                    call.resolve(["opened": true])
                }
                
            } catch {
                DispatchQueue.main.async {
                    call.reject("Failed to open cash drawer: \(error.localizedDescription)")
                }
            }
        }
    }
    
    @objc func configure(_ call: CAPPluginCall) {
        // Configuration is handled during printer creation
        call.resolve(["configured": true])
    }
    
    // Helper methods
    private func connectionTypeString(for interface: InterfaceType) -> String {
        switch interface {
        case .usb:
            return "USB"
        case .bluetooth:
            return "Bluetooth"
        case .lan:
            return "LAN"
        default:
            return "Unknown"
        }
    }
    
    private func cutType(from string: String) -> CutType {
        switch string {
        case "NoCut":
            return .noCut
        case "FullCut":
            return .fullCut
        default:
            return .partialCut
        }
    }
}