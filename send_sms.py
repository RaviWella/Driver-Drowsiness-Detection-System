# Import the Twilio library
from twilio.rest import Client

# Directly hard-code your Twilio credentials here
account_sid = "AC7d412bad8e330dc16e33aa986fd4d8cc"  # Replace with your Twilio Account SID
auth_token = "ff3dfd9c9678ce10db016115a1f4b438"    # Replace with your Twilio Auth Token

# Initialize the Twilio Client
client = Client(account_sid, auth_token)

# Create and send the SMS message
message = client.messages.create(
    body="Driver Wasted",  # Message content
    from_="+19475002897",  # Replace with your Twilio number
    to="+94761328236",  # Replace with the recipient's phone number
)

# Print the message body or SID for debugging
print(message.body)
