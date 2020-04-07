# How enable Cellular and Wifi Based Geolocationing in GVA (Google Location APIs)

The ICLP GW only has the ability to use GPS & AGPS to acertain its position. This is sometimes restrictive, as it is not very affective inside buildings, tunnels, cargo holds, etc. To over come this limitation, we can improve the location estimation of the GW, by using the cellular and wifi information to identify its location. Along with most telemerty messages, the GW sends a field containing the Cellular Tower serving it, surrounding towers and Wifi Access Points (if Wifi is enabled). We can use this informaiton in the GVA to establish the locaiton of the GW. We subscribe to the Google Geolocation API service, that uses this cellular and WiFi information to provide the GWs location. This location is typically of lesser accuracy compared to the GPS.. So we only perform this method, if the GW was unable to find its own GPS location. 

The Google Location APIs are a paid service, and is charged per call. When the GVA deployment is complete, this service is not enabled 'out of the box'. It will need to be manually enabled. To enable this service a Google API location **_KEY_** will be required. Use the below link to generate the key.

Further reading: [Google Geolocation APIs](https://developers.google.com/maps/documentation/geolocation/intro)

Generating the API Key: [Pay as you go](https://developers.google.com/maps/documentation/geolocation/usage-and-billing)


## Steps to enable the google geolocation api key in GVA
Login to the GVA VM:
> $ ssh \<_VM-URL_>

Update the .profile file with the Google geolocation api key:
> $ sudo vim private/gva.env

Find and add the following line to the gva.env file, following which you can save and exit:
> gva_geolocation_api_key=\<your Google Geolocation API Key>

Stop the exiting docker container:
> $ ./stopgva.sh

Start the GVA Docker for new changes to take affect:
> $ ./rungva.sh \<docker image ID>
