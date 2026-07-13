#!/usr/bin/env bash
# ============================================================
# StarXpand SDK auto-setup for Android (Capacitor)
# Run from project root AFTER: npm install && npx cap add android
# Idempotent — safe to re-run.
# ============================================================
set -e

ROOT="$(pwd)"
APP_ID_PATH="app/lovable/ailecoffeepos"
PLUGIN_PKG_PATH="$APP_ID_PATH/starprinter"
JAVA_DIR="android/app/src/main/java/$APP_ID_PATH"
PLUGIN_DIR="android/app/src/main/java/$PLUGIN_PKG_PATH"
RES_XML_DIR="android/app/src/main/res/xml"
MANIFEST="android/app/src/main/AndroidManifest.xml"
APP_GRADLE="android/app/build.gradle"
ROOT_GRADLE="android/build.gradle"
MAIN_ACT="$JAVA_DIR/MainActivity.java"

if [ ! -d "android" ]; then
  echo "❌ ยังไม่มีโฟลเดอร์ android — กรุณารัน 'npx cap add android' ก่อน"
  exit 1
fi

echo "==> 1. Copy Kotlin plugin"
mkdir -p "$PLUGIN_DIR" "$RES_XML_DIR"
cp -f android-plugin/StarPrinterPlugin.kt "$PLUGIN_DIR/StarPrinterPlugin.kt"
cp -f android-plugin/device_filter.xml    "$RES_XML_DIR/device_filter.xml"

echo "==> 2. Enable Kotlin in app/build.gradle"
if ! grep -q "kotlin-android" "$APP_GRADLE"; then
  # add kotlin plugin after com.android.application
  sed -i.bak "/apply plugin: 'com.android.application'/a apply plugin: 'kotlin-android'" "$APP_GRADLE" 2>/dev/null || \
  sed -i "/apply plugin: 'com.android.application'/a apply plugin: 'kotlin-android'" "$APP_GRADLE"
fi

echo "==> 3. Add Star SDK + coroutines dependencies"
if ! grep -q "com.starmicronics:stario10" "$APP_GRADLE"; then
  # inject before last closing brace of file (dependencies block ends near EOF)
  python3 - <<'PY'
import re, pathlib
p = pathlib.Path("android/app/build.gradle")
s = p.read_text()
inject = '''
    implementation "com.starmicronics:stario10:1.5.0"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
    implementation "org.jetbrains.kotlin:kotlin-stdlib:1.9.22"
'''
# find last dependencies { ... }
m = list(re.finditer(r'dependencies\s*\{', s))
if m:
    start = m[-1].end()
    depth = 1
    i = start
    while i < len(s) and depth > 0:
        if s[i] == '{': depth += 1
        elif s[i] == '}': depth -= 1
        i += 1
    s = s[:i-1] + inject + s[i-1:]
    p.write_text(s)
    print("  injected into dependencies block")
else:
    p.write_text(s + "\ndependencies {\n" + inject + "}\n")
    print("  created new dependencies block")
PY
fi

echo "==> 4. Add Star Maven repo to root build.gradle"
if ! grep -q "star-m.jp/repo/android" "$ROOT_GRADLE"; then
  python3 - <<'PY'
import re, pathlib
p = pathlib.Path("android/build.gradle")
s = p.read_text()
repo = 'maven { url "https://www21.star-m.jp/repo/android" }'
# insert into allprojects { repositories { ... } }
def add(match):
    block = match.group(0)
    if "star-m.jp" in block: return block
    return block.replace("repositories {", "repositories {\n        " + repo, 1)
new = re.sub(r'allprojects\s*\{[^}]*repositories\s*\{[^}]*\}[^}]*\}', add, s, count=1, flags=re.DOTALL)
if new == s:
    # fallback: append allprojects block
    new = s + '\nallprojects { repositories { ' + repo + ' } }\n'
p.write_text(new)
PY
fi

echo "==> 5. Patch AndroidManifest.xml (USB host + intent filter)"
python3 - <<'PY'
import pathlib, re
p = pathlib.Path("android/app/src/main/AndroidManifest.xml")
s = p.read_text()
changed = False

if 'android.hardware.usb.host' not in s:
    s = s.replace('<manifest',
        '<!-- StarPrinter USB -->\n<manifest', 1)
    # add uses-feature after <manifest ...>
    s = re.sub(r'(<manifest[^>]*>)',
               r'\1\n    <uses-feature android:name="android.hardware.usb.host" />',
               s, count=1)
    changed = True

if 'USB_DEVICE_ATTACHED' not in s:
    inject = '''
                <intent-filter>
                    <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
                </intent-filter>
                <meta-data
                    android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
                    android:resource="@xml/device_filter" />
'''
    # inject before </activity> of MainActivity
    s = re.sub(r'(<activity[^>]*MainActivity[^>]*>)([\s\S]*?)(</activity>)',
               lambda m: m.group(1) + m.group(2) + inject + m.group(3), s, count=1)
    changed = True

if changed:
    p.write_text(s)
    print("  manifest updated")
else:
    print("  manifest already patched")
PY

echo "==> 6. Register plugin in MainActivity"
if [ -f "$MAIN_ACT" ]; then
  if ! grep -q "StarPrinterPlugin.class" "$MAIN_ACT"; then
    python3 - <<PY
import pathlib
p = pathlib.Path("$MAIN_ACT")
s = p.read_text()
if "import app.lovable.ailecoffeepos.starprinter.StarPrinterPlugin;" not in s:
    s = s.replace("import com.getcapacitor.BridgeActivity;",
                  "import com.getcapacitor.BridgeActivity;\nimport app.lovable.ailecoffeepos.starprinter.StarPrinterPlugin;")
if "registerPlugin(StarPrinterPlugin.class)" not in s:
    # add onCreate override if none, else inject
    if "onCreate" in s:
        s = s.replace("super.onCreate(savedInstanceState);",
                      "registerPlugin(StarPrinterPlugin.class);\n        super.onCreate(savedInstanceState);", 1)
    else:
        s = s.replace("public class MainActivity extends BridgeActivity {",
                      '''public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(StarPrinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
''', 1)
p.write_text(s)
PY
  fi
else
  echo "  ⚠️  ไม่พบ MainActivity.java ที่ $MAIN_ACT — ตรวจ appId ใน capacitor.config.ts"
fi

echo ""
echo "✅ เสร็จเรียบร้อย! ขั้นตอนถัดไป:"
echo "   npm run build"
echo "   npx cap sync android"
echo "   npx cap open android"
echo ""
