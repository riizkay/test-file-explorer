cat > /etc/systemd/system/infokes1.service << EOL
[Unit]
Description=File Explorer Node Application
After=network.target

[Service]
Type=simple
ExecStart=/root/.bun/bin/bun run /home/infokes-test/apps/backend/main.ts --port 4001
EnvironmentFile=/home/infokes-test/apps/backend/.env
WorkingDirectory=/home/infokes-test
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOL

cat > /etc/systemd/system/infokes2.service << EOL
[Unit]
Description=File Explorer Node Application
After=network.target

[Service]
Type=simple
ExecStart=/root/.bun/bin/bun run /home/infokes-test/apps/backend/main.ts --port 4002
EnvironmentFile=/home/infokes-test/apps/backend/.env
WorkingDirectory=/home/infokes-test
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOL
systemctl daemon-reload
systemctl enable infokes1.service
systemctl enable infokes2.service
systemctl restart infokes1.service
systemctl restart infokes2.service
systemctl status infokes1.service
systemctl status infokes2.service


cat > /etc/apache2/sites-enabled/infokes.riizkay.my.id.conf << EOL
<VirtualHost *:80>
    ServerName infokes.api.riizkay.my.id
    ServerAlias infokes.api.riizkay.my.id
    RewriteEngine On
    # Redirect all HTTP requests to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule (.*) https://infokes.api.riizkay.my.id%{REQUEST_URI} [L,R=301]

    # Redirect requests directly to the public IP to the domain
    RewriteCond %{HTTP_HOST} ^103\.196\.154\.39$
    RewriteRule (.*) https://infokes.api.riizkay.my.id%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName infokes.api.riizkay.my.id
    ServerAlias infokes.api.riizkay.my.id
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s, %{X-Forwarded-For}e" env=REMOTE_ADDR
    SSLEngine on
    SSLCertificateFile /home/ssl/my/infokes.api.riizkay.my.id/certificate.crt
    SSLCertificateKeyFile /home/ssl/my/infokes.api.riizkay.my.id/private.key
    SSLCertificateChainFile /home/ssl/my/infokes.api.riizkay.my.id/ca_bundle.crt
    SSLProxyEngine on  
    ProxyPreserveHost on
    # Konfigurasi Load Balancer dengan WebSocket Support
    <Proxy balancer://riizkayClusster>
        BalancerMember http://127.0.0.1:4001 retry=30 connectiontimeout=2 timeout=30 loadfactor=1
        BalancerMember http://127.0.0.1:4002 retry=30 connectiontimeout=2 timeout=30 loadfactor=1
        ProxySet lbmethod=bybusyness
        ProxySet failonstatus=503
        ProxySet nofailover=Off
    </Proxy>

    <Proxy balancer://riizkayClussterWS>
        BalancerMember ws://127.0.0.1:4001 retry=30 connectiontimeout=2 timeout=30 loadfactor=1
        BalancerMember ws://127.0.0.1:4002 retry=30 connectiontimeout=2 timeout=30 loadfactor=1
        ProxySet lbmethod=bybusyness
        ProxySet failonstatus=503
        ProxySet nofailover=Off
    </Proxy>

    # Konfigurasi untuk HTTP
    ProxyPass / balancer://riizkayClusster/
    ProxyPassReverse / balancer://riizkayClusster/

    # Konfigurasi untuk WebSocket di path /wso
    RewriteEngine On
    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /wso/(.*) balancer://riizkayClussterWS/wso/$1 [P,L]

    # Teruskan permintaan WebSocket ke path /wso
    ProxyPass /wso/ balancer://riizkayClussterWS/wso/
    ProxyPassReverse /wso/ balancer://riizkayClussterWS/wso/
    
</VirtualHost>


<VirtualHost *:80>
    ServerName infokes.riizkay.my.id
    ServerAlias infokes.riizkay.my.id
    RewriteEngine On
    # Redirect all HTTP requests to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule (.*) https://infokes.riizkay.my.id%{REQUEST_URI} [L,R=301]

    # Redirect requests directly to the public IP to the domain
    RewriteCond %{HTTP_HOST} ^103\.196\.154\.39$
    RewriteRule (.*) https://infokes.riizkay.my.id%{REQUEST_URI} [L,R=301]
</VirtualHost>
<VirtualHost *:443>
    ServerName infokes.riizkay.my.id
    ServerAlias infokes.riizkay.my.id
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s, %{X-Forwarded-For}e" env=REMOTE_ADDR
    SSLEngine on
    SSLCertificateFile /home/ssl/my/infokes.riizkay.my.id/certificate.crt
    SSLCertificateKeyFile /home/ssl/my/infokes.riizkay.my.id/private.key
    SSLCertificateChainFile /home/ssl/my/infokes.riizkay.my.id/ca_bundle.crt
    SSLProxyEngine on     
    SSLProxyVerify none
    SSLProxyCheckPeerCN off
    SSLProxyCheckPeerName off
    SSLProxyCheckPeerExpire off
    ProxyPreserveHost off  # Ubah ke off

    ProxyPass / https://nos.wjv-1.neo.id/rizkitest1/web/index.html
    ProxyPassReverse / https://nos.wjv-1.neo.id/rizkitest1/web/index.html

    # RewriteEngine On
    # RewriteRule ^/(.*)$ https://nos.wjv-1.neo.id/rizkitest1/web/$1 [P,L]
</VirtualHost>
EOL

systemctl restart apache2