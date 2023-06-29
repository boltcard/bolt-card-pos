# Bolt Card PoS App (Point of Sale)

A simple Point of Sale (PoS) App with [Bolt Card](https://boltcard.org) support. Built in React Native for iOS and Android.

Connects to an [LNBits](https://lnbits.com/) backend with the LNDHub extension installed.

Polls for successful invoice payments.

[![Playstore](https://bluewallet.io/uploads/play-store-badge-blue.svg)](https://play.google.com/store/apps/details?id=org.boltcard.boltcardpos)

[![AppleStore]([https://github.com/boltcard/bolt-card-pos/assets/3826238/9899981c-da95-4798-9aa2-d4cf8aa9a23f](https://camo.githubusercontent.com/c7140fdffb62f2be8dfc5f895a93f16df04696441cf473cbab01f670915cc828/68747470733a2f2f626c756577616c6c65742e696f2f75706c6f6164732f6170702d73746f72652d62616467652d626c75652e737667))](https://apps.apple.com/us/app/bolt-card-pos/id6448741630)


## APK files
[Latest Android Release.](https://github.com/boltcard/bolt-card-pos/releases) It's safe to use (as long as you scan the Invoice QR code in LNDHub) because all you can do is Pay the pos invoice.

It works, some payment errors might not be shown. Give it a try let us know what you think!


## setup
1. Install [LNBits](https://lnbits.com/) and connect it to your node, or use the LNBits demo server
2. Click extensions and install the LNDHub extension.
3. On the app hit the Scan QR code button and then scan the INVOICE QR code. (Admin QR code should work, but there is no need for the PoS to have this level of permissions)
4. Create invoices to test.
