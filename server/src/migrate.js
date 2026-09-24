import 'dotenv/config';
import fs from 'fs';
import pg from 'pg';
const {Pool}=pg;
if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL.includes('railway')?{rejectUnauthorized:false}:false});
try{
  const sql=fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8');
  await pool.query(sql);
  const col=await pool.query("SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='clientes' AND column_name='nascimento'");
  if(col.rowCount && col.rows[0].data_type!=='text'){
    await pool.query("ALTER TABLE clientes ALTER COLUMN nascimento TYPE TEXT USING CASE WHEN nascimento IS NULL THEN NULL ELSE to_char(nascimento,'DD/MM/YYYY') END");
  }
  await pool.query("UPDATE clientes SET nascimento=CASE WHEN nascimento ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T.*)?$' THEN to_char((substring(nascimento from '^([0-9]{4}-[0-9]{2}-[0-9]{2})'))::date,'DD/MM/YYYY') WHEN nascimento ~ '^[0-9]{2}-[0-9]{2}-[0-9]{4}$' THEN to_char(to_date(nascimento,'DD-MM-YYYY'),'DD/MM/YYYY') WHEN nascimento ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN to_char(to_date(nascimento,'YYYY-MM-DD'),'DD/MM/YYYY') WHEN nascimento ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN nascimento ELSE NULL END WHERE nascimento IS NOT NULL");
  await pool.end();
  console.log('Migration complete');
}catch(err){
  await pool.end();
  throw err;
}