
### conteudo do .env
URL_Z_API=URL_Z_API=https://api.z-api.io/instances/{instances}/token/{token}
CLIENT_TOKEN_Z_API={Client_Token}
BASE_URL_ASAAS=https://sandbox.asaas.com/api/v3
API_KEY_ASAAS=

DB_USER=user
DB_HOST=localhost
DB_DATABASE=database
DB_PASSWORD=senha

EMAIL_USER=
EMAIL_PASSWORD=



### para executar usando nodemon
npm run dev

### servidor em producao no aws EC2
ssh -i /home/ana/Documentos/chave.pem ec2-user@ec2-3-16-11-57.us-east-2.compute.amazonaws.com

### acessar o database
psql -h pitelecom.cjkikg8sqnuk.us-east-2.rds.amazonaws.com -U postgres -d pitelecom_db

### no servidor para alterar script de servico do servidor em execucao
para acessar:
sudo vim /etc/systemd/system/server-node.service #para acessar

sudo systemctl daemon-reload
sudo systemctl start server-node
sudo systemctl enable server-node

