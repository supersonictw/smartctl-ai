#!/bin/sh
# Usage examples:
# source send_to.sh && SEND_SMART_EMAIL recipient@example.com
# source send_to.sh && SEND_SMART_EMAIL -c cc@example.com -b bcc@example.com recipient@example.com
# source send_to.sh && SEND_SMART_EMAIL -s "Custom Subject" recipient@example.com
# source send_to.sh && SEND_SMART_EMAIL -c cc1@example.com -c cc2@example.com -b bcc@example.com recipient1@example.com recipient2@example.com

SEND_SMART_EMAIL() {    
    # If no arguments provided, show the error and return
    if [ $# -eq 0 ]; then
        echo "No email address provided. Please provide at least one recipient email address."
        return
    fi
    
    # If arguments don't contain -s (subject), add default subject
    if ! echo "$*" | grep -q "\-s"; then
        set -- -s "SMARTctl AI - $HOSTNAME" "$@"
    fi
    
    # Execute with all provided arguments
    SEND_EMAIL=1 node app.mjs | mailx "$@"
}
