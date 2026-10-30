from pathlib import Path
root=Path(__file__).resolve().parent
web=root/'web'
html=(web/'index.html').read_text('utf-8')
for css in ['styles.css','dining-advanced.css','business-suite.css','guest-management.css','service-desk.css']:
 html=html.replace(f'<link rel="stylesheet" href="/{css}"/>',f'<style>\n{(web/css).read_text("utf-8")}\n</style>')
scripts=[]
for js in ['app.js','dining-advanced.js','business-suite.js','qr-vendor.js','guest-management.js','service-desk.js']:
 html=html.replace(f'<script defer src="/{js}"></script>','')
 source=(web/js).read_text('utf-8').replace('</script','<\\/script')
 scripts.append(f'<script>\n{source}\n</script>')
html=html.replace('</body>','\n'.join(scripts)+'\n</body>')
(web/'preview-v07.html').write_text(html,'utf-8')
(root/'dist').mkdir(exist_ok=True)
(root/'dist'/'AILE_POS_Cloud_v0.7_Standalone.html').write_text(html,'utf-8')

guest=(web/'guest.html').read_text('utf-8')
guest=guest.replace('<link rel="stylesheet" href="/guest.css">',f'<style>\n{(web/"guest.css").read_text("utf-8")}\n</style>')
guest=guest.replace('<script defer src="/guest.js"></script>','')
guest=guest.replace('</body>',f'<script>\n{(web/"guest.js").read_text("utf-8").replace("</script","<\\/script")}\n</script>\n</body>')
(root/'dist'/'AILE_POS_Cloud_v0.7_Guest.html').write_text(guest,'utf-8')
print('Generated two standalone previews',len(html),len(guest))
