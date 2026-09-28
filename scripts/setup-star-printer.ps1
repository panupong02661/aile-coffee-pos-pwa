# StarXpand SDK auto-setup for Android (pure PowerShell - no bash/python needed)
# Run from project root AFTER: npx cap sync android
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-star-printer.ps1
$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false)
function ReadF($p) { return [System.IO.File]::ReadAllText((Resolve-Path $p)) }
function WriteF($p, $s) { [System.IO.File]::WriteAllText((Join-Path (Get-Location) $p), $s, $utf8) }

if (-not (Test-Path "android")) { throw "No android folder - run 'npx cap add android' first" }

$appPath   = "app/lovable/ailecoffeepos"
$pluginDir = "android/app/src/main/java/$appPath/starprinter"
$resXml    = "android/app/src/main/res/xml"
$manifest  = "android/app/src/main/AndroidManifest.xml"
$appGradle = "android/app/build.gradle"
$rootGradle= "android/build.gradle"
$mainAct   = "android/app/src/main/java/$appPath/MainActivity.java"

Write-Host "==> 1. Copy Kotlin plugin"
New-Item -ItemType Directory -Force -Path $pluginDir, $resXml | Out-Null
Copy-Item -Force "android-plugin/StarPrinterPlugin.kt" "$pluginDir/StarPrinterPlugin.kt"
Copy-Item -Force "android-plugin/device_filter.xml" "$resXml/device_filter.xml"

Write-Host "==> 2. Enable Kotlin"
$g = ReadF $appGradle
if ($g -notmatch "kotlin-android") {
  $g = $g -replace "apply plugin: 'com.android.application'", "apply plugin: 'com.android.application'`napply plugin: 'kotlin-android'"
}
Write-Host "==> 3. Add Star SDK dependencies"
if ($g -notmatch "com.starmicronics:stario10") {
  $inject = "dependencies {`n    implementation `"com.starmicronics:stario10:1.5.0`"`n    implementation `"org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3`"`n    implementation `"org.jetbrains.kotlin:kotlin-stdlib:1.9.22`"`n"
  $idx = $g.LastIndexOf("dependencies {")
  if ($idx -ge 0) { $g = $g.Substring(0, $idx) + $inject + $g.Substring($idx + "dependencies {".Length) }
  else { $g = $g + "`n" + $inject + "}`n" }
}
WriteF $appGradle $g

Write-Host "==> 4. Kotlin gradle plugin + Star Maven repo"
$r = ReadF $rootGradle
if ($r -notmatch "kotlin-gradle-plugin") {
  $r = [regex]::new("(buildscript\s*\{[\s\S]*?dependencies\s*\{)").Replace($r, "`$1`n        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'", 1)
}
if ($r -notmatch "star-m.jp") {
  if ($r -match "allprojects\s*\{\s*repositories\s*\{") {
    $r = [regex]::new("(allprojects\s*\{\s*repositories\s*\{)").Replace($r, "`$1`n        maven { url `"https://www21.star-m.jp/repo/android`" }", 1)
  } else {
    $r = $r + "`nallprojects { repositories { maven { url `"https://www21.star-m.jp/repo/android`" } } }`n"
  }
}
WriteF $rootGradle $r

Write-Host "==> 5. Patch AndroidManifest.xml"
$m = ReadF $manifest
if ($m -notmatch "android.hardware.usb.host") {
  $m = [regex]::new("(<manifest[^>]*>)").Replace($m, "`$1`n    <uses-feature android:name=`"android.hardware.usb.host`" />", 1)
}
if ($m -notmatch "USB_DEVICE_ATTACHED") {
  $usb = @"
            <intent-filter>
                <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
            </intent-filter>
            <meta-data
                android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
                android:resource="@xml/device_filter" />
        </activity>
"@
  $i = $m.IndexOf("</activity>")
  if ($i -ge 0) { $m = $m.Substring(0, $i) + $usb.TrimStart() + $m.Substring($i + "</activity>".Length) }
}
WriteF $manifest $m

Write-Host "==> 6. Register plugin in MainActivity"
if (Test-Path $mainAct) {
  $a = ReadF $mainAct
  if ($a -notmatch "StarPrinterPlugin.class") {
    $a = $a.Replace("import com.getcapacitor.BridgeActivity;", "import com.getcapacitor.BridgeActivity;`nimport app.lovable.ailecoffeepos.starprinter.StarPrinterPlugin;")
    if ($a -match "super.onCreate\(savedInstanceState\);") {
      $a = [regex]::new("super.onCreate\(savedInstanceState\);").Replace($a, "registerPlugin(StarPrinterPlugin.class);`n        super.onCreate(savedInstanceState);", 1)
    } else {
      $a = $a.Replace("public class MainActivity extends BridgeActivity {", "public class MainActivity extends BridgeActivity {`n    @Override`n    public void onCreate(android.os.Bundle savedInstanceState) {`n        registerPlugin(StarPrinterPlugin.class);`n        super.onCreate(savedInstanceState);`n    }`n")
    }
    WriteF $mainAct $a
  }
} else {
  Write-Host "WARNING: MainActivity.java not found at $mainAct" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "DONE - เสร็จเรียบร้อย! ต่อไป: npx cap open android แล้ว Build APK" -ForegroundColor Green
