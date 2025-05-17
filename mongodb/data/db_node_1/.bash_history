mongo --tls --tlsCertificateKeyFile /data/ssl/mdb_nodes_keycert.pem --tlsCAFile /data/ssl/mdb_root_CA.crt --tlsCertificateKeyFilePassword mdb_my_custom_passphrase_security --tlsAllowInvalidHostnames
mongod --tls --tlsCertificateKeyFile /data/ssl/mdb_nodes_keycert.pem --tlsCAFile /data/ssl/mdb_root_CA.crt --tlsCertificateKeyFilePassword mdb_my_custom_passphrase_security --tlsAllowInvalidHostnames
mongosh --tls --tlsCertificateKeyFile /data/ssl/mdb_nodes_keycert.pem --tlsCAFile /data/ssl/mdb_root_CA.crt --tlsCertificateKeyFilePassword mdb_my_custom_passphrase_security --tlsAllowInvalidHostnames
exit
clear
mongosh --tls --tlsCertificateKeyFile /data/ssl/mdb_nodes_keycert.pem --tlsCAFile /data/ssl/mdb_root_CA.crt --tlsCertificateKeyFilePassword mdb_my_custom_passphrase_security -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --sslAllowInvalidHostnames
exit
