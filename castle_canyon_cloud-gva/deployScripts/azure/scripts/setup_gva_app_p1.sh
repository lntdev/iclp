#!/bin/bash

# Variables to update
# Repo="Replace with the URL of the docker repository"
# Username="Replace with the username of the docker repo"
# Password="Replace with the Password of the docker repo"
# IMAGE_ID="Replace with the docker image - url/name:tag"
RepoUrl="ccreleases.azurecr.io"
Username="ccreleases"
Password="yPQ4QDiH1cZsP4k9nepKa/9Wi53P9v5U"
IMAGE_ID="ccreleases.azurecr.io/gva:GVA_CT_19.12.15_REL"

gva_internaldb_host=$1
gva_internaldb_database=$2
gva_internaldb_username=$3
gva_internaldb_password=$4
gva_logging_env_info=$5
gva_blobstore_connect_str=$6
gva_devicesim_iothub_device_connect_str=$7
gva_gwlistener_event_hub_name=$8
gva_gwlistener_event_hub_compatible_endpoint=$9
gva_gwtagproxy_iothub_registry_rw_connect_str=$10
gva_gwmessenger_service_policy_connect_str=$11
gva_gwmessenger_test_device_id=$12
gva_logging_appinsights_instrumentation_key=$13
gva_pcs2_rest_baseurl=$14
gva_security_base_path=$15
gva_security=$16
gva_externaldb_connection_string=$17
gva_externaldb_username=$18
gva_externaldb_password=$19
gva_sms_alerts=$24
VPUrl=$20
gva_url=$21

aadClientId=$22
gva_source_uri=$23

#reload profile
. /home/ubuntu/.profile

export HOME=/home/ubuntu

cd /home/ubuntu/

mkdir -p /home/ubuntu/private

echo '# Template for environment variables that are specific to a deployment' >> /home/ubuntu/private/gva.env
echo '# copy this file to ~/private/gva.env, then edit the file with' >> /home/ubuntu/private/gva.env
echo '# your private values.' >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# App Insight' >> /home/ubuntu/private/gva.env
echo gva_logging_env_info=$gva_logging_env_info >> /home/ubuntu/private/gva.env
echo gva_logging_appinsights_instrumentation_key=$gva_logging_appinsights_instrumentation_key >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Setup which processes need to be started,' >> /home/ubuntu/private/gva.env
echo '# - This useful to split the services accross VMs, but still use the same docker.' >> /home/ubuntu/private/gva.env
echo '# - These env variables are consumed by runprocs.sh script inside the docker.' >> /home/ubuntu/private/gva.env
echo gva_gwmessenger=enable >> /home/ubuntu/private/gva.env
echo gva_gwlistener=enable >> /home/ubuntu/private/gva.env
echo gva_shippingapi=enable >> /home/ubuntu/private/gva.env
echo gva_keystore=enable >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Set the IP Port for the Micro Services (gwmessenger is hardcoded to 3000, can be changed in the code)' >> /home/ubuntu/private/gva.env
echo gva_shippingapi_ip_port=3001 >> /home/ubuntu/private/gva.env
echo gva_keystore_ip_port=3002 >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# GW Connection Type' >> /home/ubuntu/private/gva.env
echo '# options (choose one): azure-iothub, azure-iotcentral' >> /home/ubuntu/private/gva.env
echo gva_gw_connection_type=azure-iothub >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Populate one of the following sections based on teh GW Connection Type selection' >> /home/ubuntu/private/gva.env
echo '########## IoT Hub parameters (optional) ##############' >> /home/ubuntu/private/gva.env
echo '### To send C2D messages, and Create Devices' >> /home/ubuntu/private/gva.env
echo gva_iothub_service_policy_connect_str=$gva_gwmessenger_service_policy_connect_str >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '### To receive GW Data via IoT Hubs builtin Event Hub' >> /home/ubuntu/private/gva.env
echo gva_iothub_event_hub_name=$gva_gwlistener_event_hub_name >> /home/ubuntu/private/gva.env
echo gva_iothub_event_hub_compatible_endpoint=$gva_gwlistener_event_hub_compatible_endpoint >> /home/ubuntu/private/gva.env
echo '#######################################################' >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '########## IoT Central parameters (optional) ##########' >> /home/ubuntu/private/gva.env
echo '### device creation parameters' >> /home/ubuntu/private/gva.env
echo gva_iotc_scope_id= >> /home/ubuntu/private/gva.env
echo gva_iotc_sas_master_key= >> /home/ubuntu/private/gva.env
echo gva_iotc_device_template_id=urn:cc:iclpTemplate:1 >> /home/ubuntu/private/gva.env
echo gva_iotc_device_interface_id=iclpGwPropertiesInterface >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '### Iot Central App Api Token, used to update Device Twins, and send N->S messages' >> /home/ubuntu/private/gva.env
echo gva_iotc_uri= >> /home/ubuntu/private/gva.env
echo gva_iotc_app_api_token= >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '### To receive GW Data via Event Hub' >> /home/ubuntu/private/gva.env
echo gva_iotc_event_hub_name= >> /home/ubuntu/private/gva.env
echo gva_iotc_event_hub_compatible_endpoint= >> /home/ubuntu/private/gva.env
echo '#######################################################' >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# (enable) storing of gw data into external db from VM? or (disable) gw data is stored in externalDB by external entity (e.g. Azure Function App)' >> /home/ubuntu/private/gva.env
echo gva_gwlistener_store_data=enable >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# GVA SQL Database (internalDB)' >> /home/ubuntu/private/gva.env
echo gva_internaldb_host=$gva_internaldb_host >> /home/ubuntu/private/gva.env
echo gva_internaldb_database=$gva_internaldb_database >> /home/ubuntu/private/gva.env
echo gva_internaldb_admin_username= >> /home/ubuntu/private/gva.env
echo gva_internaldb_admin_password= >> /home/ubuntu/private/gva.env
echo gva_internaldb_username=$gva_internaldb_username >> /home/ubuntu/private/gva.env
echo gva_internaldb_password=$gva_internaldb_password >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# GVA Cosmo DB (mongo, externalDB)' >> /home/ubuntu/private/gva.env
echo gva_externaldb_username=$gva_externaldb_username >> /home/ubuntu/private/gva.env
echo gva_externaldb_password=$gva_externaldb_password >> /home/ubuntu/private/gva.env
echo gva_externaldb_connection_string=$gva_externaldb_connection_string >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Blob storage for gvaphotos' >> /home/ubuntu/private/gva.env
echo gva_blobstore_connect_str=$gva_blobstore_connect_str >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Use HTTPS for ShippingAPI and Keystore/rendezvous Server' >> /home/ubuntu/private/gva.env
echo gva_https=disable >> /home/ubuntu/private/gva.env
echo gva_https_crt_file=/home/ubuntu/castle_canyon/security/ssl >> /home/ubuntu/private/gva.env
echo gva_https_key_file=/home/ubuntu/castle_canyon/security/ssl >> /home/ubuntu/private/gva.env
echo gva_https_ca_bundle_file=/home/ubuntu/castle_canyon/security/ssl >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Keystore/Rendezvous [required for non-OBT and security flows, in case of https, please give complete domain name]' >> /home/ubuntu/private/gva.env
echo gva_keystore_uri=http://localhost:3002/ >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Google GeoLocation API (for cellular triangulation)'  >> /home/ubuntu/private/gva.env
echo gva_geolocation_api_key= >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# GVA Security flows, path to public private keys of GVA, OBT, GW etc.'  >> /home/ubuntu/private/gva.env
echo gva_security=disable >> /home/ubuntu/private/gva.env
echo gva_security_base_path=/home/ubuntu/castle_canyon/security/gva >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# SMS Gateway for alerts (Twilio)' >> /home/ubuntu/private/gva.env
echo gva_sms_alerts=disable >> /home/ubuntu/private/gva.env
echo gva_sms_alert_account_sid= >> /home/ubuntu/private/gva.env
echo gva_sms_alert_auth_token= >> /home/ubuntu/private/gva.env
echo gva_sms_alert_phone_number= >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '############### Debug / Development ##############################' >> /home/ubuntu/private/gva.env
echo '# GW Device Simulator -- [optional] for use with gw simulator, only for debug/development' >> /home/ubuntu/private/gva.env
echo gva_devicesim_iothub_device_connect_str=$gva_devicesim_iothub_device_connect_str >> /home/ubuntu/private/gva.env
echo gva_gwmessenger_test_device_id=$gva_gwmessenger_test_device_id >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# GVA exporttings,, DO NOT MODIFIY FOR PRODUCTION:: To enable, use #YES_ALLOW_USERS_TO_DELETE_ALL_SHIPMENTS_FOR_DEVELOPMENT_OR_INTEGRATION_TESTING.' >> /home/ubuntu/private/gva.env
echo gva_shippingapi_expose_developer_endpoints=YES_ALLOW_USERS_TO_DELETE_ALL_SHIPMENTS_FOR_DEVELOPMENT_OR_INTEGRATION_TESTING >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '# Azure Active Directory' >> /home/ubuntu/private/gva.env
echo aadClientId=$aadClientId >> /home/ubuntu/private/gva.env
echo  >> /home/ubuntu/private/gva.env
echo '############### Obsolete #########################################' >> /home/ubuntu/private/gva.env
echo '# PCS v2 - only incase of using gwtagproxy'  >> /home/ubuntu/private/gva.env
echo gva_pcs2_rest_baseurl=$gva_pcs2_rest_baseurl >> /home/ubuntu/private/gva.env
echo gva_gwtagproxy_iothub_registry_rw_connect_str=$gva_gwtagproxy_iothub_registry_rw_connect_str >> /home/ubuntu/private/gva.env


apt-get update
apt-get install -y docker.io curl

curl 'https://ccreleases.blob.core.windows.net/iclp/dockerlogin.sh?sp=r&st=2019-09-18T08:31:41Z&se=2021-12-31T16:31:41Z&spr=https&sv=2018-03-28&sig=uOy0pRfm0r%2BrR35EgpQZlQYUMKEbRu%2FvHVCXHOC3bNU%3D&sr=b' >> /home/ubuntu/dockerlogin.sh
curl 'https://ccreleases.blob.core.windows.net/iclp/entercontainer.sh?sp=r&st=2019-09-18T08:32:44Z&se=2020-12-31T16:32:44Z&spr=https&sv=2018-03-28&sig=8Nv9vKQ2ua858wtim3Uq3z%2FeyJ1kMW5lH7CPubwrN7E%3D&sr=b' >> /home/ubuntu/entercontainer.sh
curl 'https://ccreleases.blob.core.windows.net/iclp/rungva.sh?sp=r&st=2019-09-18T08:33:11Z&se=2020-12-31T16:33:11Z&spr=https&sv=2018-03-28&sig=Y%2FSapJTkiOHtBv2QotSoIJXBwcp0eRbvWUVkUMDQReM%3D&sr=b' >> /home/ubuntu/rungva.sh
curl 'https://ccreleases.blob.core.windows.net/iclp/stopgva.sh?sp=r&st=2019-09-18T08:33:35Z&se=2020-12-31T16:33:35Z&spr=https&sv=2018-03-28&sig=fUTEFr%2FiKTzug3oJBui%2FEzc3qnpK%2FR3brl4nlOJ3Ku0%3D&sr=b' >> /home/ubuntu/stopgva.sh

chmod +x /home/ubuntu/*.sh

docker login $RepoUrl -u $Username -p $Password
docker pull $IMAGE_ID
docker images

echo IMAGE_ID is $IMAGE_ID

#this runs the container
/home/ubuntu/rungva.sh "$IMAGE_ID"

usermod -a -G docker ubuntu
chown ubuntu:ubuntu /home/ubuntu/.docker -R
chmod g+rwx /home/ubuntu/.docker -R

