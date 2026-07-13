package app.lovable.ailecoffeepos.starprinter

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.starmicronics.stario10.InterfaceType
import com.starmicronics.stario10.StarConnectionSettings
import com.starmicronics.stario10.StarDeviceDiscoveryManager
import com.starmicronics.stario10.StarDeviceDiscoveryManagerFactory
import com.starmicronics.stario10.StarPrinter
import com.starmicronics.stario10.StarPrinterModel
import com.starmicronics.stario10.starxpandcommand.DocumentBuilder
import com.starmicronics.stario10.starxpandcommand.PrinterBuilder
import com.starmicronics.stario10.starxpandcommand.StarXpandCommandBuilder
import com.starmicronics.stario10.starxpandcommand.printer.Alignment
import com.starmicronics.stario10.starxpandcommand.printer.CutType
import com.starmicronics.stario10.starxpandcommand.printer.OpenCashDrawerParameter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * StarPrinter Capacitor Plugin — Android
 * Uses StarXpand SDK v2 (com.starmicronics:stario10)
 * รองรับ Star TSP143III USB / LAN / Bluetooth + Cash Drawer
 */
@CapacitorPlugin(name = "StarPrinter")
class StarPrinterPlugin : Plugin() {

    private var currentPrinter: StarPrinter? = null
    private var discoveryManager: StarDeviceDiscoveryManager? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    @PluginMethod
    fun searchPrinters(call: PluginCall) {
        scope.launch {
            try {
                val found = JSArray()
                discoveryManager?.stopDiscovery()

                discoveryManager = StarDeviceDiscoveryManagerFactory.create(
                    listOf(InterfaceType.Usb, InterfaceType.Lan, InterfaceType.Bluetooth),
                    context
                )

                discoveryManager?.discoveryTime = 5000
                discoveryManager?.callback = object : StarDeviceDiscoveryManager.Callback {
                    override fun onPrinterFound(printer: StarPrinter) {
                        val obj = JSObject()
                        obj.put("portName", printer.connectionSettings.identifier)
                        obj.put("modelName", printer.information?.model?.name ?: "Star Printer")
                        obj.put(
                            "connectionType",
                            when (printer.connectionSettings.interfaceType) {
                                InterfaceType.Usb -> "USB"
                                InterfaceType.Lan -> "LAN"
                                InterfaceType.Bluetooth -> "Bluetooth"
                                else -> "Unknown"
                            }
                        )
                        found.put(obj)
                    }

                    override fun onDiscoveryFinished() {
                        val ret = JSObject()
                        ret.put("printers", found)
                        call.resolve(ret)
                    }
                }
                discoveryManager?.startDiscovery()
            } catch (e: Exception) {
                call.reject("Discovery failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        val type = call.getString("connectionType") ?: "USB"
        val id = call.getString("deviceIdentifier") ?: ""

        val interfaceType = when (type) {
            "USB" -> InterfaceType.Usb
            "LAN" -> InterfaceType.Lan
            "Bluetooth" -> InterfaceType.Bluetooth
            else -> InterfaceType.Usb
        }

        scope.launch {
            try {
                val settings = StarConnectionSettings(interfaceType, id)
                val printer = StarPrinter(settings, context)
                withContext(Dispatchers.IO) { printer.openAsync().await() }
                currentPrinter = printer
                val ret = JSObject()
                ret.put("connected", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Connect failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        scope.launch {
            try {
                currentPrinter?.closeAsync()?.await()
                currentPrinter = null
                val ret = JSObject()
                ret.put("disconnected", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Disconnect failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val ret = JSObject()
        ret.put("connected", currentPrinter != null)
        ret.put("deviceName", currentPrinter?.information?.model?.name ?: "")
        call.resolve(ret)
    }

    @PluginMethod
    fun print(call: PluginCall) {
        val printer = currentPrinter ?: run {
            call.reject("Printer not connected")
            return
        }
        val data = call.getString("data") ?: ""
        val cutType = call.getString("cutType") ?: "PartialCut"

        scope.launch {
            try {
                val builder = StarXpandCommandBuilder()
                val printerBuilder = PrinterBuilder()
                    .styleAlignment(Alignment.Left)
                    .actionPrintText(data + "\n")
                    .actionCut(
                        when (cutType) {
                            "FullCut" -> CutType.Full
                            "NoCut" -> CutType.Partial
                            else -> CutType.Partial
                        }
                    )
                builder.addDocument(DocumentBuilder().addPrinter(printerBuilder))
                val commands = builder.getCommands()
                printer.printAsync(commands).await()
                val ret = JSObject()
                ret.put("success", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Print failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun openCashDrawer(call: PluginCall) {
        val printer = currentPrinter ?: run {
            call.reject("Printer not connected")
            return
        }
        scope.launch {
            try {
                val builder = StarXpandCommandBuilder()
                val printerBuilder = PrinterBuilder()
                    .actionOpenCashDrawer(OpenCashDrawerParameter(1))
                builder.addDocument(DocumentBuilder().addPrinter(printerBuilder))
                printer.printAsync(builder.getCommands()).await()
                val ret = JSObject()
                ret.put("opened", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Open drawer failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun configure(call: PluginCall) {
        // config เก็บฝั่ง JS อย่างเดียว
        val ret = JSObject()
        ret.put("configured", true)
        call.resolve(ret)
    }
}
