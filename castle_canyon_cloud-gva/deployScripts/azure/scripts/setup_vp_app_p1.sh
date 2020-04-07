#!/bin/bash

# Variables to update
# Repo="Replace with the URL of the docker repository"
# Username="Replace with the username of the docker repo"
# Password="Replace with the Password of the docker repo"
# IMAGE_ID="Replace with the docker image - url/name:tag"
RepoUrl="ccreleases.azurecr.io"
Username="ccreleases"
Password="yPQ4QDiH1cZsP4k9nepKa/9Wi53P9v5U"
IMAGE_ID="ccreleases.azurecr.io/vp:VP_CT_19.12.15_REL"

mongoConnString=$1
PORT=$2
GVAurl=$3
PCSurl=$4
shipmentgw2cloudinterval=$5
iotHubConnectionString=$6
storageAccConnectionString=$7
#--------------------------
# Send email variables
#--------------------------
vpURL=$8
emailId=$9
solutionName=$10
subscriptionId=$11
spAppId=$12
spObjectId=$13
spSecret=$14
tenantId=$15
email_server_webapp_name=$16
vp_source_uri=$17

aadClientId=$spAppId
aadClientSecret=$spSecret

#reload profile
mkdir -p /home/ubuntu/private
export HOME=/home/ubuntu
. /home/ubuntu/.profile
cd /home/ubuntu/

echo export mongoConnString=\'$mongoConnString\'  >> /home/ubuntu/.profile
echo export PORT=\'$PORT\'  >> /home/ubuntu/.profile
echo export GVAurl=\'$GVAurl\'  >> /home/ubuntu/.profile
echo export PCSurl=\'$PCSurl\'  >> /home/ubuntu/.profile
echo export shipmentgw2cloudinterval=\'$shipmentgw2cloudinterval\'  >> /home/ubuntu/.profile
echo export iotHubConnectionString=\'$iotHubConnectionString\'  >> /home/ubuntu/.profile
echo export storageAccConnectionString=\'$storageAccConnectionString\'  >> /home/ubuntu/.profile
echo export vpURL=\'$vpURL\'  >> /home/ubuntu/.profile
echo export emailId=\'$emailId\'  >> /home/ubuntu/.profile
echo export solutionName=\'$solutionName\'  >> /home/ubuntu/.profile

echo export aadClientId=\'$aadClientId\' >> /home/ubuntu/.profile
echo export aadClientSecret=\'$aadClientSecret\' >> /home/ubuntu/.profile
echo export tenantId=\'$tenantId\' >> /home/ubuntu/.profile

# used by transfer_proxy_files.sh
gvaDNSName=`echo $GVAurl | awk -F":" '{print $2}' | awk -F"\/\/" '{print $2}'`
echo export GVADNSName=\'$gvaDNSName\' >> /home/ubuntu/.profile

# used by  .js files
gvaHostName=`echo $GVAurl | awk -F":" '{print $2}' | awk -F"\/\/" '{print $2}' | awk -F"." '{print $1}'`
echo export GVAHostName=\'$gvaHostName\' >> /home/ubuntu/.profile

echo export vpRedirectURL=\'https://$solutionName-vp-webapp.azurewebsites.net\' >> /home/ubuntu/.profile
echo export GVAShippingUrl=\'https://$solutionName-gva-webapp.azurewebsites.net\' >> /home/ubuntu/.profile
echo export GVADevicesUrl=\'https://$solutionName-gva-webapp.azurewebsites.net\' >> /home/ubuntu/.profile
echo export subscriptionId=\'$subscriptionId\'  >> /home/ubuntu/.profile
echo export spAppId=\'$spAppId\'  >> /home/ubuntu/.profile
echo export spObjectId=\'$spObjectId\'  >> /home/ubuntu/.profile
echo export spSecret=\'$spSecret\'  >> /home/ubuntu/.profile
echo export tenantId=\'$tenantId\'  >> /home/ubuntu/.profile

#echo export blobConnString=\'$blobConnString\'  >> /home/ubuntu/.profile
echo export blobConnString=\'https://ccreleases.blob.core.windows.net/addresses/shipmentCreation.json\' >> /home/ubuntu/.profile


echo  mongoConnString=$mongoConnString  >> /home/ubuntu/private/vp.env
echo  PORT=$PORT  >> /home/ubuntu/private/vp.env
echo  GVAurl=$GVAurl  >> /home/ubuntu/private/vp.env
echo  PCSurl=$PCSurl  >> /home/ubuntu/private/vp.env
echo  shipmentgw2cloudinterval=$shipmentgw2cloudinterval  >> /home/ubuntu/private/vp.env
echo  iotHubConnectionString=$iotHubConnectionString  >> /home/ubuntu/private/vp.env
echo  storageAccConnectionString=$storageAccConnectionString  >> /home/ubuntu/private/vp.env
echo  blobConnString=https://ccreleases.blob.core.windows.net/addresses/shipmentCreation.json >> /home/ubuntu/private/vp.env


apt-get update
apt-get install -y docker.io curl

curl 'https://ccreleases.blob.core.windows.net/iclp/dockerlogin.sh?sp=r&st=2019-09-18T08:31:41Z&se=2021-12-31T16:31:41Z&spr=https&sv=2018-03-28&sig=uOy0pRfm0r%2BrR35EgpQZlQYUMKEbRu%2FvHVCXHOC3bNU%3D&sr=b' >> /home/ubuntu/dockerlogin.sh
curl 'https://ccreleases.blob.core.windows.net/iclp/entervp.sh?sp=r&st=2019-09-19T04:09:46Z&se=2020-12-31T12:09:46Z&spr=https&sv=2018-03-28&sig=d9UL3YcSlDb3oLH2dR9bN%2F5DZ8k3b7SNE4lMwgi02MQ%3D&sr=b' >> /home/ubuntu/entervp.sh
curl 'https://ccreleases.blob.core.windows.net/iclp/runvp.sh?sp=r&st=2019-09-19T04:10:28Z&se=2020-12-31T12:10:28Z&spr=https&sv=2018-03-28&sig=sXXnM2X5VTvQRDzbbRTpdYymjrnL7qGKtvTTNygSLkE%3D&sr=b' >> /home/ubuntu/runvp.sh
curl 'https://ccreleases.blob.core.windows.net/iclp/stopvp.sh?sp=r&st=2019-09-19T04:11:05Z&se=2020-12-31T12:11:05Z&spr=https&sv=2018-03-28&sig=Rph2Io3sVxoySOnmBpkwOflSgAksQsAcdcTP6hZLFyg%3D&sr=b' >> /home/ubuntu/stopvp.sh

chmod +x /home/ubuntu/*.sh

docker login $RepoUrl -u $Username -p $Password
docker pull $IMAGE_ID
docker images

echo IMAGE_ID is $IMAGE_ID

#this runs the container
/home/ubuntu/runvp.sh "$IMAGE_ID"

usermod -a -G docker ubuntu
chown ubuntu:ubuntu /home/ubuntu/.docker -R
chmod g+rwx /home/ubuntu/.docker -R

