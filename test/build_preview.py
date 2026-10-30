from pathlib import Path
root=Path(__file__).resolve().parent
web=root/'web'
html=(web/'index.html').read_text(encoding='utf-8')
for css in ['styles.css','dining-advanced.css','business-suite.css']:
    html=html.replace(f'<link rel="stylesheet" href="/{css}"/>',f'<style>\n{(web/css).read_text(encoding="utf-8")}\n</style>')
scripts=[]
for js in ['app.js','dining-advanced.js','business-suite.js']:
    html=html.replace(f'<script defer src="/{js}"></script>','')
    source=(web/js).read_text(encoding='utf-8').replace('</script','<\\/script')
    scripts.append(f'<script>\n{source}\n</script>')
html=html.replace('</body>','\n'.join(scripts)+'\n</body>')
(web/'preview-v05.html').write_text(html,encoding='utf-8')
Path('/mnt/data/AILE_POS_Cloud_v0.5_Standalone.html').write_text(html,encoding='utf-8')
print('Created standalone HTML',len(html))
