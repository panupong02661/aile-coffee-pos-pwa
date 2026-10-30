from pathlib import Path
p=Path(__file__).parent
server=p/'api/src/server.js'
s=server.read_text()
s=s.replace("import { registerAfterSalesRoutes } from './after-sales.js';", "import { registerAfterSalesRoutes } from './after-sales.js';\nimport {registerOperationsRoutes,lockOpenShift} from './operations.js';")
s=s.replace(" const branch=await client.query('SELECT id FROM branches WHERE tenant_id=$1 AND id=$2',[t,v.branchId]);if(!branch.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Branch not found'})}"," const branch=await client.query('SELECT id FROM branches WHERE tenant_id=$1 AND id=$2',[t,v.branchId]);if(!branch.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Branch not found'})}\n const shiftId=await lockOpenShift(client,t,v.branchId);if(!shiftId){await client.query('ROLLBACK');return res.status(409).json({error:'Open a cash shift before recording a sale'})}")
s=s.replace("INSERT INTO sales(id,tenant_id,branch_id,created_by,total_cents,status,payment_method) VALUES($1,$2,$3,$4,$5,'paid','cash')\",[saleId,t,v.branchId,req.actor.userId,total]", "INSERT INTO sales(id,tenant_id,branch_id,created_by,total_cents,status,payment_method,shift_id) VALUES($1,$2,$3,$4,$5,'paid','cash',$6)\",[saleId,t,v.branchId,req.actor.userId,total,shiftId]")
s=s.replace('registerAfterSalesRoutes(app,{pool,auth,wrap});','registerAfterSalesRoutes(app,{pool,auth,wrap});\nregisterOperationsRoutes(app,{pool,auth,wrap});')
server.write_text(s)
res=p/'api/src/restaurant.js';s=res.read_text();s=s.replace("import { publishChange } from './dining.js';", "import { publishChange } from './dining.js';\nimport {lockOpenShift} from './operations.js';")
needle="    const session=await lockSession(c,t,v.branchId,id);if(!session||session.status!=='open')return http(res,409,'Session not open');"
assert needle in s
s=s.replace(needle,"    const shiftId=await lockOpenShift(c,t,v.branchId);if(!shiftId)return http(res,409,'Open a cash shift before payment');\n"+needle,1)
needle="INSERT INTO sales(id,tenant_id,branch_id,created_by,total_cents,status,payment_method)\n      VALUES($1,$2,$3,$4,$5,'paid','cash')`,[saleId,t,v.branchId,req.actor.userId,total]"
assert needle in s
s=s.replace(needle,"INSERT INTO sales(id,tenant_id,branch_id,created_by,total_cents,status,payment_method,shift_id)\n      VALUES($1,$2,$3,$4,$5,'paid','cash',$6)`,[saleId,t,v.branchId,req.actor.userId,total,shiftId]")
res.write_text(s)
res=p/'api/src/after-sales.js';s=res.read_text();s=s.replace("import { publishChange } from './dining.js';", "import { publishChange } from './dining.js';\nimport {lockOpenShift} from './operations.js';")
needle="      // Serializes all refunds of one sale, even when the requests use different keys."
assert needle in s
s=s.replace(needle,"      const shiftId=await lockOpenShift(c,t,v.branchId);\n      if(!shiftId){await c.query('ROLLBACK');return res.status(409).json({error:'Open a cash shift before recording a refund'});}\n"+needle)
needle="INSERT INTO sale_refunds(id,tenant_id,branch_id,sale_id,idempotency_key,request_hash,total_cents,cash_returned_cents,reason,created_by)\n        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[refundId,t,v.branchId,saleId,key,fingerprint,total,v.cashReturnedCents,v.reason,req.actor.userId]"
assert needle in s
s=s.replace(needle,"INSERT INTO sale_refunds(id,tenant_id,branch_id,sale_id,idempotency_key,request_hash,total_cents,cash_returned_cents,reason,created_by,shift_id)\n        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[refundId,t,v.branchId,saleId,key,fingerprint,total,v.cashReturnedCents,v.reason,req.actor.userId,shiftId]")
res.write_text(s)
package=p/'package.json';s=package.read_text();s=s.replace('"version": "1.0.0"','"version": "1.1.0"');s=s.replace('node --check api/src/after-sales.js && node --check web/after-sales-v10.js','node --check api/src/after-sales.js && node --check web/after-sales-v10.js && node --check api/src/operations.js && node --check web/operations-v11.js');package.write_text(s)
html=p/'web/index.html';s=html.read_text();s=s.replace('</head>','  <link rel="stylesheet" href="/operations-v11.css"/>\n  <script defer src="/operations-v11.js"></script>\n</head>');html.write_text(s)
