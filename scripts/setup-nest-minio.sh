#!/usr/bin/env bash
# ==============================================================================
# Everest School Management System - MinIO S3 Setup on Hack Club Nest
# Run this script inside your Nest container (ssh flames@hackclub.app)
# ==============================================================================
set -euo pipefail

MINIO_DIR="$HOME/minio-bin"
DATA_DIR="$HOME/minio-data"
SERVICE_DIR="$HOME/.config/systemd/user"

# S3 Configuration
MINIO_USER="${MINIO_ROOT_USER:-everest-admin}"
# Generate a secure random password if not supplied
MINIO_PASS="${MINIO_ROOT_PASSWORD:-EverestS3_$(openssl rand -hex 8)}"
S3_PORT="9000"
CONSOLE_PORT="9001"

echo "=========================================================="
echo " Setting up MinIO S3 on Hack Club Nest (flames)"
echo "=========================================================="

# 1. Create directories
mkdir -p "$MINIO_DIR" "$DATA_DIR" "$SERVICE_DIR"

# 2. Download MinIO binary (Linux amd64)
if [ ! -f "$MINIO_DIR/minio" ]; then
    echo "Downloading MinIO server binary..."
    curl -fsSL https://dl.min.io/server/minio/release/linux-amd64/minio -o "$MINIO_DIR/minio"
    chmod +x "$MINIO_DIR/minio"
    echo "✓ MinIO binary installed to $MINIO_DIR/minio"
else
    echo "✓ MinIO binary already present at $MINIO_DIR/minio"
fi

# 3. Create run script
cat << 'EOF' > "$HOME/start-minio.sh"
#!/usr/bin/env bash
MINIO_DIR="$HOME/minio-bin"
DATA_DIR="$HOME/minio-data"
export MINIO_ROOT_USER="__MINIO_USER__"
export MINIO_ROOT_PASSWORD="__MINIO_PASS__"

exec "$MINIO_DIR/minio" server "$DATA_DIR" --address ":9000" --console-address ":9001"
EOF

sed -i "s/__MINIO_USER__/$MINIO_USER/g" "$HOME/start-minio.sh"
sed -i "s/__MINIO_PASS__/$MINIO_PASS/g" "$HOME/start-minio.sh"
chmod +x "$HOME/start-minio.sh"

# 4. Create systemd user service
cat << EOF > "$SERVICE_DIR/minio.service"
[Unit]
Description=MinIO S3 Storage Service
Documentation=https://min.io/docs/minio/linux/index.html
After=network.target

[Service]
Type=simple
Environment="MINIO_ROOT_USER=$MINIO_USER"
Environment="MINIO_ROOT_PASSWORD=$MINIO_PASS"
ExecStart=$MINIO_DIR/minio server $DATA_DIR --address :9000 --console-address :9001
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF

# 5. Enable and start systemd user service (or run in background)
if command -v systemctl &>/dev/null && systemctl --user status &>/dev/null; then
    systemctl --user daemon-reload
    systemctl --user enable minio.service
    systemctl --user restart minio.service
    echo "✓ MinIO systemd user service enabled and started."
else
    # Fallback to nohup if systemd user is not available
    pkill -f "$MINIO_DIR/minio" || true
    nohup "$HOME/start-minio.sh" > "$HOME/minio.log" 2>&1 &
    echo "✓ MinIO started in background (logs: ~/minio.log)."
fi

echo ""
echo "=========================================================="
echo " MinIO S3 Setup Complete!"
echo "=========================================================="
echo "S3 API Port:      $S3_PORT"
echo "Console Port:     $CONSOLE_PORT"
echo "Access Key:       $MINIO_USER"
echo "Secret Key:       $MINIO_PASS"
echo ""
echo "----------------------------------------------------------"
echo " STEP 2: Configure Caddy on Nest (Automatic HTTPS)"
echo " Edit or add to your Caddyfile (~/Caddyfile):"
echo "----------------------------------------------------------"
echo "flames.hackclub.app {"
echo "    reverse_proxy 127.0.0.1:9000"
echo "}"
echo ""
echo "Then reload Caddy: caddy reload"
echo ""
echo "----------------------------------------------------------"
echo " STEP 3: Add to your Everest .env.local on your local app:"
echo "----------------------------------------------------------"
echo "STORAGE_DRIVER=s3"
echo "S3_ENDPOINT=flames.hackclub.app"
echo "S3_PORT=443"
echo "S3_USE_SSL=true"
echo "S3_ACCESS_KEY=$MINIO_USER"
echo "S3_SECRET_KEY=$MINIO_PASS"
echo "S3_BUCKET=scms"
echo "S3_REGION=us-east-1"
echo "=========================================================="
