from pathlib import Path
root=Path(__file__).resolve().parent
web=root/'web'; dist=root/'dist'; dist.mkdir(exist_ok=True)
def bundle(template,css,js):
    html=(web/template).read_text(encoding='utf8')
    for name in css:
        tag=f'<link rel="stylesheet" href="/{name}"/>'
        if tag not in html:tag=f'<link rel="stylesheet" href="/{name}">'
        assert tag in html,name
        html=html.replace(tag,'<style>\n'+(web/name).read_text(encoding='utf8')+'\n</style>')
    scripts=[]
    for name in js:
        tag=f'<script defer src="/{name}"></script>'
        assert tag in html,name
        html=html.replace(tag,'')
        scripts.append('<script>\n'+(web/name).read_text(encoding='utf8').replace('</script','<\\/script')+'\n</script>')
    return html.replace('</body>','\n'.join(scripts)+'\n</body>')
staff=bundle('index.html',['styles.css','dining-advanced.css','business-suite.css','guest-management.css','service-desk.css','payments-v09.css','after-sales-v10.css'],['app.js','dining-advanced.js','business-suite.js','qr-vendor.js','guest-management.js','service-desk.js','buffet-alerts.js','payments-v09.js','after-sales-v10.js'])
guest=bundle('guest.html',['guest.css','guest-v08.css'],['guest.js'])
for name,content in [('AILE_POS_Cloud_v1.0_Standalone.html',staff),('AILE_POS_Cloud_v1.0_Guest.html',guest)]:
    (dist/name).write_text(content,encoding='utf-8')
(web/'preview-v10.html').write_text(staff,encoding='utf-8')
print('v1.0 bundle',len(staff),len(guest))
