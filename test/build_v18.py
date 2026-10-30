from pathlib import Path
root=Path(__file__).resolve().parent;web=root/'web';dist=root/'dist';dist.mkdir(exist_ok=True)
def bundle(template,css,js):
 html=(web/template).read_text(encoding='utf8')
 for name in css:
  tag=f'<link rel="stylesheet" href="/{name}"/>'
  if tag not in html: tag=f'<link rel="stylesheet" href="/{name}">'
  versioned=re.search(r'<link\s+rel="stylesheet"\s+href="/'+re.escape(name)+r'(?:\?[^"]*)?"\s*/?>',html)
  assert versioned,name
  tag=versioned.group(0)
  html=html.replace(tag,'<style>\n'+(web/name).read_text(encoding='utf8')+'\n</style>')
 scripts=[]
 for name in js:
  tag=f'<script defer src="/{name}"></script>'
  versioned=re.search(r'<script\s+defer\s+src="/'+re.escape(name)+r'(?:\?[^"]*)?"\s*>\s*</script>',html)
  assert versioned,name
  tag=versioned.group(0)
  html=html.replace(tag,'')
  scripts.append('<script>\n'+(web/name).read_text(encoding='utf8').replace('</script','<\\/script')+'\n</script>')
 return html.replace('</body>','\n'.join(scripts)+'\n</body>')
import re
index=(web/'index.html').read_text(encoding='utf8')
css=re.findall(r'<link\s+rel="stylesheet"\s+href="/([^"?]+)(?:\?[^"]*)?"',index)
js=re.findall(r'<script\s+defer\s+src="/([^"?]+)(?:\?[^"]*)?"',index)
staff=bundle('index.html',css,js)
guest=bundle('guest.html',['guest.css','guest-v08.css','guest-responsive-v18.css'],['guest.js','pwa-boot-v18.js'])
# Isolated preview: start an explicitly demo-labelled sample table when no session exists.
guest=guest.replace('<script>\n','<script>window.__AILE_STANDALONE_GUEST__=true;</script><script>\n',1)
mobile=bundle('customer-app.html',['customer-app.css','customer-responsive-v18.css'],['customer-app.js','pwa-boot-v18.js'])
import json
# Only the standalone POS needs guest source embedded. Server mode loads /guest.html.
boot='<script>window.__AILE_GUEST_INLINE_HTML__='+json.dumps(guest,ensure_ascii=False).replace('</','<\\/')+';</script>'
staff=staff.replace('<script>\n',boot+'<script>\n',1)
for name,html in [('AILE_POS_Cloud_v1.8_Standalone.html',staff),('AILE_POS_Cloud_v1.8_Guest.html',guest),('AILE_POS_Cloud_v1.8_CustomerApp.html',mobile)]:
 (dist/name).write_text(html,encoding='utf8')
(web/'preview-v18.html').write_text(staff,encoding='utf8')
print('Bundled HTML:',len(staff),len(guest),len(mobile))
