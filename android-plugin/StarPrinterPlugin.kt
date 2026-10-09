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
import com.starmicronics.stario10.starxpandcommand.DrawerBuilder
import com.starmicronics.stario10.starxpandcommand.drawer.Channel
import com.starmicronics.stario10.starxpandcommand.drawer.OpenParameter
import com.starmicronics.stario10.starxpandcommand.printer.ImageParameter
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
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
                lastType = interfaceType; lastId = id
                val ret = JSObject()
                ret.put("connected", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject(friendly(e))
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

    private var lastType: InterfaceType = InterfaceType.Usb
    private var lastId: String = ""

    /** TSP100III เป็นเครื่องพิมพ์แบบภาพ — วาดข้อความ (รวมภาษาไทย) เป็นภาพกว้าง 576px */
    private fun textToBitmap(raw: String): Bitmap {
        val text = raw.replace(Regex("\u001B[@EF]|\u001Ba[\u0000-\u0002]"), "")
            .replace(Regex("[\u0000-\u0009\u000B-\u001F]"), "")
        val width = 576
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK; textSize = 26f; typeface = Typeface.DEFAULT
        }
        val lines = mutableListOf<String>()
        text.split("\n").forEach { line ->
            var rest = line
            if (rest.isEmpty()) lines.add("")
            while (rest.isNotEmpty()) {
                val n = paint.breakText(rest, true, width.toFloat() - 8f, null).coerceAtLeast(1)
                lines.add(rest.substring(0, n)); rest = rest.substring(n)
            }
        }
        val lineH = 34
        val bmp = Bitmap.createBitmap(width, (lines.size + 1) * lineH, Bitmap.Config.ARGB_8888)
        val c = Canvas(bmp); c.drawColor(Color.WHITE)
        lines.forEachIndexed { i, l -> c.drawText(l, 4f, ((i + 1) * lineH).toFloat(), paint) }
        return bmp
    }

    private fun friendly(e: Exception): String {
        val n = e.javaClass.simpleName; val m = e.message ?: ""
        return when {
            n.contains("Unprintable") -> "เครื่องพิมพ์ไม่พร้อม — ตรวจกระดาษหมด/ฝาเครื่องเปิด ($m)"
            n.contains("Communication") -> "ติดต่อเครื่องพิมพ์ไม่ได้ — ตรวจสาย USB/OTG และเปิดเครื่อง ($m)"
            m.contains("ermission", true) -> "ยังไม่ได้อนุญาตให้แอปใช้ USB — ถอดสายเสียบใหม่แล้วกด อนุญาต"
            n.contains("InUse") -> "เครื่องพิมพ์ถูกใช้งานอยู่ — ลองใหม่อีกครั้ง"
            else -> "$n: $m"
        }
    }

    private suspend fun sendWithRetry(commands: String) {
        try {
            currentPrinter!!.printAsync(commands).await()
        } catch (e: Exception) {
            try { currentPrinter?.closeAsync()?.await() } catch (_: Exception) {}
            val p = StarPrinter(StarConnectionSettings(lastType, lastId), context)
            p.openAsync().await()
            currentPrinter = p
            p.printAsync(commands).await()
        }
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
                    .actionPrintImage(ImageParameter(textToBitmap(data), 576))
                    .actionCut(
                        when (cutType) {
                            "FullCut" -> CutType.Full
                            "NoCut" -> CutType.Partial
                            else -> CutType.Partial
                        }
                    )
                builder.addDocument(DocumentBuilder().addPrinter(printerBuilder))
                val commands = builder.getCommands()
                sendWithRetry(commands)
                val ret = JSObject()
                ret.put("success", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject(friendly(e))
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
                val drawerBuilder = DrawerBuilder()
                    .actionOpen(OpenParameter().setChannel(Channel.No1))
                builder.addDocument(DocumentBuilder().addDrawer(drawerBuilder))
                sendWithRetry(builder.getCommands())
                val ret = JSObject()
                ret.put("opened", true)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject(friendly(e))
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
