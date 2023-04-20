# Bolt Card PoS App (Point of Sale)

A simple Point of Sale (PoS) App with [Bolt Card](https://boltcard.org) support. Built in React Native for iOS and Android.

Connects to an [LNBits](https://lnbits.com/) backend with the LNDHub extension installed.

Polls for successful invoice payments.

## Android Release
[Play Store Listing](https://play.google.com/store/apps/details?id=org.boltcard.boltcardpos)

[Early alpha release.](https://github.com/boltcard/bolt-card-pos/releases) It's safe to use (as long as you scan the Invoice QR code in LNDHub) because all you can do is Pay the pos invoice.

It works, looks a bit janky, some payment errors might not be shown.

Give it a try let us know what you think!


## setup
1. Install [LNBits](https://lnbits.com/) and connect it to your node, or use the LNBits demo server
2. Click extensions and install the LNDHub extension.
3. On the app hit the Scan QR code button and then scan the INVOICE QR code. (Admin QR code should work, but there is no need for the PoS to have this level of permissions)
4. Create invoices to test.

