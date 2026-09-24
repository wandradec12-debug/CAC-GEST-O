# CAC GESTÃO
V1 do sistema de gestão de clientes.

## Estrutura
- web: React + Vite
- server: Node.js + Express + PostgreSQL

## Railway
API: rootDirectory `server`, build `npm install`, preDeploy `npm run migrate && npm run seed`, start `npm start`.
Web: rootDirectory `web`, build `npm install && npm run build`, start `npm start`. Configure `VITE_API_URL` com a URL pública da API antes do build.