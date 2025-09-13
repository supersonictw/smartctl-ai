# SMARTctl AI

```sh
#!/bin/sh

# Source the send_to.sh
. /opt/smartctl-ai/send_to.sh

# Change working directory
cd /opt/smartctl-ai

# Start the task
SEND_SMART_EMAIL \
  "recipient@example.com"
```

```crontab
0 5 * * 1 /usr/local/bin/send_smart_email.sh
```
