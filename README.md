# SMARTctl AI

SMARTctl AI is an AI-powered SMART disk health monitoring tool that automatically analyzes smartctl output, provides AI-driven health insights, and can send results to administrators via email.

## Features

- Automatically analyzes disk SMART data and provides AI insights and suggestions
- Supports email notifications via SMTP
- Supports colored terminal output or plain text output
- Easy integration with crontab for scheduled monitoring
- Simple environment variable configuration

## Installation

1. Clone this repository to your server
2. Make sure you have `node` (v20 or above recommended) and `smartctl` installed
3. Install dependencies:

   ```sh
   npm install
   ```

4. Copy `.env.sample` to `.env` and adjust settings as needed

## Configuration

### AI Chat Configuration

- `CHAT_MODEL`: AI model (default: gemini-2.0-flash)
- `CHAT_LANGUAGE`: AI response language (default: zh-TW)
- `CHAT_MODEL_PARAMS`: Optional JSON object of extra model parameters, e.g. `{"max_tokens":4096}` (default: unset)
- `OPENAI_BASE_URL`: OpenAI API endpoint (default provided)
- `OPENAI_API_KEY`: OpenAI API key (default provided)

### Terminal Display Configuration

- `NO_COLOR`: Disable colored terminal output (default: false)

### Email Configuration

- `SEND_EMAIL`: Enable email sending (default: false)
- `SEND_EMAIL_FROM`: Sender address (default: "SMARTctl-AI <noreply-smartctl-ai@localhost>")
- `SEND_EMAIL_TO`: Recipient address (default: "Administrator <root@localhost>")
- `SEND_EMAIL_CC`: CC recipient address(es), comma-separated (optional)
- `SEND_EMAIL_BCC`: BCC recipient address(es), comma-separated (optional)

### SMTP Configuration

- `SMTP_HOST`: SMTP server host (default: localhost)
- `SMTP_PORT`: SMTP server port (default: 25)
- `SMTP_SECURE`: Use TLS (default: false)
- `SMTP_USER`: SMTP username (optional)
- `SMTP_PASS`: SMTP password (optional)

## Usage

### 1. Direct Execution

```sh
cd /opt/smartctl-ai
node app.ts
```

### 2. Test Email Sending

```sh
SEND_EMAIL=true MAIL_CONTENT="Test email content" node notify.ts
```

### 3. Using Installation Script

Run the installation script to create a system-wide command:

```sh
sudo ./install_smartctl-ai.sh
```

This will create `/usr/local/bin/smartctl-ai` script, which can then be executed directly:

```sh
smartctl-ai
```

### 4. Crontab Integration

Create a crontab entry for scheduled monitoring:

```crontab
# Run SMART check every Monday at 5 AM
0 5 * * 1 /usr/local/bin/smartctl-ai
```

Or create a custom script (e.g., `/usr/local/bin/my_smart_check.sh`):

```sh
#!/bin/sh

# Change to project directory
cd /opt/smartctl-ai

# Run the check
node app.ts
```

Remember to make it executable:

```sh
chmod +x /usr/local/bin/my_smart_check.sh
```

## Main Files

- `app.ts`: Main program, calls smartctl and performs AI analysis
- `notify.ts`: Test email sending functionality
- `src/chat.ts`: AI chat and API integration
- `src/devices.ts`: Detect storage devices
- `src/inspect.ts`: Inspect SMART data
- `src/mailer.ts`: Email sending configuration
- `src/prompts.ts`: AI prompt generator
- `install_smartctl-ai.sh`: Installation script

## License

This project is licensed under the MIT License.
