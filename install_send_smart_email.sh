#!/bin/sh
# This script creates /usr/local/bin/send_smart_email.sh for crontab use and makes it executable.

cat > /usr/local/bin/send_smart_email.sh <<'EOF'
#!/bin/sh

# Source the send_to.sh
. /opt/smartctl-ai/send_to.sh

# Change working directory
cd /opt/smartctl-ai

# Start the task
SEND_SMART_EMAIL \
  "recipient@example.com"
EOF

chmod +x /usr/local/bin/send_smart_email.sh
echo "Script /usr/local/bin/send_smart_email.sh created and made executable."
