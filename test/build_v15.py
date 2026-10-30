from pathlib import Path
root=Path(__file__).resolve().parent;web=root/'web';dist=root/'dist';dist.mkdir(exist_ok=True)
def bundle(template,css,js):
 html=(web/template).read_text(encoding='utf8')
 for name in css:
  tag=f'<link rel="stylesheet" href="/{name}"/>'
  if tag not in html: tag=f'<link rel="stylesheet" href="/{name}">'
  assert tag in html,name
  html=html.replace(tag,'<style>\n'+(web/name).read_text(encoding='utf8')+'\n</style>')
 scripts=[]
 for name in js:
  tag=f'<script defer src="/{name}"></script>'
  assert tag in html,name
  html=html.replace(tag,'')
  scripts.append('<script>\n'+(web/name).read_text(encoding='utf8').replace('</script','<\\/script')+'\n</script>')
 return html.replace('</body>','\n'.join(scripts)+'\n</body>')
staff=bundle('index.html',['styles.css','dining-advanced.css','business-suite.css','guest-management.css','service-desk.css','payments-v09.css','after-sales-v10.css','operations-v11.css','reliability-v12.css','saas-v13.css','offline-print-v14.css','extended-v15.css'],['offline-core.js','app.js','dining-advanced.js','business-suite.js','qr-vendor.js','guest-management.js','service-desk.js','buffet-alerts.js','payments-v09.js','after-sales-v10.js','operations-v11.js','reliability-v12.js','saas-v13.js','offline-print-v14.js','extended-v15.js'])
guest=bundle('guest.html',['guest.css','guest-v08.css'],['guest.js'])
mobile=bundle('customer-app.html',['customer-app.css'],['customer-app.js'])
for name,html in [('AILE_POS_Cloud_v1.5_Standalone.html',staff),('AILE_POS_Cloud_v1.5_Guest.html',guest),('AILE_POS_Cloud_v1.5_CustomerApp.html',mobile)]:
 (dist/name).write_text(html,encoding='utf8')
(web/'preview-v15.html').write_text(staff,encoding='utf8')
print('Bundled HTML:',len(staff),len(guest),len(mobile))
