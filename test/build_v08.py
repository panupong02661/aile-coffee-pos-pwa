from pathlib import Path
root=Path(__file__).resolve().parent
web=root/'web'
dist=root/'dist';dist.mkdir(exist_ok=True)

def inline_html(template,css_files,js_files):
 html=(web/template).read_text('utf8')
 for name in css_files:
  tag=f'<link rel="stylesheet" href="/{name}"/>'
  if tag not in html: tag=f'<link rel="stylesheet" href="/{name}">'
  assert tag in html,name
  html=html.replace(tag,'<style>\n'+(web/name).read_text('utf8')+'\n</style>')
 sources=[]
 for name in js_files:
  tag=f'<script defer src="/{name}"></script>'
  assert tag in html,name
  html=html.replace(tag,'')
  source=(web/name).read_text('utf8').replace('</script','<\\/script')
  sources.append('<script>\n'+source+'\n</script>')
 return html.replace('</body>','\n'.join(sources)+'\n</body>')

staff=inline_html('index.html',['styles.css','dining-advanced.css','business-suite.css','guest-management.css','service-desk.css'],['app.js','dining-advanced.js','business-suite.js','qr-vendor.js','guest-management.js','service-desk.js','buffet-alerts.js'])
guest=inline_html('guest.html',['guest.css','guest-v08.css'],['guest.js'])
for name,data in [('AILE_POS_Cloud_v0.8_Standalone.html',staff),('AILE_POS_Cloud_v0.8_Guest.html',guest)]:
 (dist/name).write_text(data,'utf8')
(web/'preview-v08.html').write_text(staff,'utf8')
print('staff',len(staff),'guest',len(guest))
