# SMARTctl AI

SMARTctl AI is an AI-powered SMART disk health monitoring tool that automatically analyzes smartctl output, provides AI-driven health insights, and can send results to administrators via email.

## Features
- Automatically analyzes disk SMART data and provides AI insights and suggestions
- Supports multiple recipients, CC, BCC, and custom subject lines
- Easy integration with crontab for scheduled tasks
- Simple shell script integration

## Installation
1. Clone this repository to your server
2. Make sure you have `node`, `mailx`, and `smartctl` installed
3. Set environment variables as needed (for custom AI service, API key, etc.)

## Configuration
- `OPENAI_BASE_URL`: AI service API endpoint (default provided)
- `OPENAI_API_KEY`: AI service API key (default provided)
- `CHAT_MODEL`: AI model (default: gemini-2.0-flash)
- `CHAT_LANGUAGE`: AI response language (default: zh-TW)

## Usage

### 1. Source the script
```sh
source send_to.sh
```

### 2. Call the function to send email
```sh
SEND_SMART_EMAIL recipient@example.com
SEND_SMART_EMAIL -c cc@example.com -b bcc@example.com recipient@example.com
SEND_SMART_EMAIL -s "Custom Subject" recipient1@example.com recipient2@example.com
```
- You can freely pass any parameters supported by mailx
- If `-s` (subject) is not specified, a default subject will be added automatically

### 3. Advanced customization
You can customize AI parameters via environment variables:
```sh
export CHAT_MODEL=gemini-2.0-flash
export CHAT_LANGUAGE=zh-TW
export OPENAI_BASE_URL=...
export OPENAI_API_KEY=...
```

### 4. Example: Full crontab Script

You can create a script (e.g., `/usr/local/bin/send_smart_email.sh`) for use with crontab:

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

Then add to your crontab:

```crontab
0 5 * * 1 /usr/local/bin/send_smart_email.sh
```

> **Note:**
> After creating your script (e.g., `/usr/local/bin/send_smart_email.sh`), don't forget to make it executable:
> ```sh
> chmod +x /usr/local/bin/send_smart_email.sh
> ```

## Main Files
- `app.mjs`: Main program, calls smartctl and AI analysis
- `chat.mjs`: AI chat and API integration
- `send_to.sh`: Shell function for sending emails

## License
This project is licensed under the MIT License.
