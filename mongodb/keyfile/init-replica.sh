#!/bin/bash
echo "Waiting for MongoDB to be ready..."
sleep 10  # Wait for MongoDB instances to start

echo "Initializing Replica Set..."
mongosh --host mongo1:27017 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
EOF

echo "Replica Set Initialized!"

