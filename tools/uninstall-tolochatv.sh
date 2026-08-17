#!/bin/bash
# Uninstall tolochatv systemd service
#
# Usage: sudo ./uninstall-tolochatv.sh
set -e

if [ "$EUID" -ne 0 ]; then
    echo "Error: Run with sudo"
    echo "Usage: sudo $0"
    exit 1
fi

echo "=== Uninstalling tolochatv ==="

if systemctl is-active --quiet tolochatv 2>/dev/null; then
    echo "Stopping tolochatv service..."
    systemctl stop tolochatv
fi

if systemctl is-enabled --quiet tolochatv 2>/dev/null; then
    echo "Disabling tolochatv service..."
    systemctl disable tolochatv
fi

if [ -f /etc/systemd/system/tolochatv.service ]; then
    echo "Removing service file..."
    rm /etc/systemd/system/tolochatv.service
    systemctl daemon-reload
fi

if [ -f /etc/letsencrypt/renewal-hooks/deploy/tolochatv ]; then
    echo "Removing certbot hook..."
    rm /etc/letsencrypt/renewal-hooks/deploy/tolochatv
fi

echo ""
echo "=== Done ==="
echo ""
echo "The tolochatv service has been removed."
echo "Project files and cache remain in place - delete manually if desired."
