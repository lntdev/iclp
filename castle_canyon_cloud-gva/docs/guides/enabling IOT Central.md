# How enable GVA to work with IOT Central

From GVA_19.09.18, ICLP GVA also supports Azure IOT Central. This featrue is supported in code, but the deployment files will continue to default to instantiate IOT Hub. In order to configure an existing ICLP instance to work with IoT Central, the following steps will be required:

How to create an IoT Central Application: [Create IoT Central](https://docs.microsoft.com/en-us/azure/iot-central/quick-deploy-iot-central)

You will first need to SSH into the GVA VM. Following which you will need to update the ~/private/gva.env file

## Steps to update gva.env

At a high level, the following section (parameters) need to be updated in the gva.env file for iot central to work:

> \# GW Connection Type  
> \# options (choose one): azure-iothub, azure-iotcentral  
> gva_gw_connection_type='azure-iothub'  
> ..  
> ..  
> ########## IoT Central parameters (optional) ##########
> \### device creation parameters  
> gva_iotc_scope_id=''  
> gva_iotc_sas_master_key=''  
> gva_iotc_device_template_id=''  
> gva_iotc_device_interface_id=''  
>  
> \### Iot Central App Api Token, used to update Device Twins, and send N->S messages  
> gva_iotc_uri=''  
> gva_iotc_app_api_token=''  
>  
> \### To receive GW Data via Event Hub  
> gva_iotc_event_hub_name=''  
> gva_iotc_event_hub_compatible_endpoint=''  
> #######################################################

Firstly, set the *gva_gw_connection_type* variable to *azure-iotcentral*, by default it points to an iothub. This informs the GVA that you intend to use the IOT Central.
> \# GW Connection Type  
> \# options (choose one): azure-iothub, azure-iotcentral  
> gva_gw_connection_type='azure-iotcentral'  

Next, to update the other parameters, you will get all these parameter from the IoT Central App.  
*gva_iotc_scope_id* is available at Administration-> Device Connection -> Scope ID, also ensure 'Auto Approve' is enabled
> gva_iotc_scope_id='XXXXXXXXXX' 

*gva_iotc_sas_master_key* is avaialble at Administration-> Device Connection -> Primary Key
> gva_iotc_sas_master_key='sdfkjhfwdni72389ASDFHA*$YHF#(@NIR@#L!@(YURHOI@H3r2089h023hf2f'  

For ICLP GW, update the following, unless a newer version is available
> gva_iotc_device_template_id='urn:cc:iclpgateway_706:1'  
> gva_iotc_device_interface_id='iclpgateway_228'  

Add the iotc app url for *gva_iotc_uri*
> gva_iotc_uri='https://xxxx.azureiotcentral.com'  

Create a new Application Token at Administration-> API Tokens and add it here:
> gva_iotc_app_api_token='sandifohs2397423h4o2hn3n498n32dh2'  

Create an Event Hub in the azure portal, then in Iot Central create a 'Data Export' rule at Data Export-> New, and use that Event Hubs. Update the Event hub end points with the params below:
> gva_iotc_event_hub_name='EventHubName'  
> gva_iotc_event_hub_compatible_endpoint='Endpoint=xxxx;skdunfoioiwefbwe'  


## Restart the GVA docker

Stop the existing docker
> $ ~/stopgva.sh

Run the GVA docker
> $ ~/rungva.sh \<docker ID>