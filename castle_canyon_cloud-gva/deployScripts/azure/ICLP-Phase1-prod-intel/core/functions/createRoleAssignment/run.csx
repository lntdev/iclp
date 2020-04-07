#load "..\CiqsHelpers\All.csx"
#load "..\helpers\HelperCommon.csx"

#r "System.Net.Primitives"
#r "System.Text.Encoding"
#r "Newtonsoft.Json"

using Microsoft.Azure.Management.Graph.RBAC.Fluent;
using Microsoft.Azure.Management.Graph.RBAC.Fluent.Models;
using Microsoft.Rest;
using Newtonsoft.Json;
using System.Net;

public class ResultContainer<T>
{
    public T Result {get; set;}
    public string Error {get; set;}
}

public static async Task<object> Run(HttpRequestMessage req, TraceWriter log)
{
        // Get parameters from SDS     
        var parametersReader = await CiqsInputParametersReader.FromHttpRequestMessage(req);
        string subscriptionId = parametersReader.GetParameter<string>("subscriptionId");
        string accessToken = parametersReader.GetParameter<string>("accessToken");
        string resourceGroupName = parametersReader.GetParameter<string>("resourceGroupName");
        string servicePrincipalObjectId = parametersReader.GetParameter<string>("servicePrincipalObjectId");

        // Constant GUID representing the Owner role
        string ownerRoleId = "8e3af657-a8ff-443c-a75c-2fe8c4bcb635";
        // Constant GUID representing the Contributor role
        string contributorRoleId = "b24988ac-6180-42a0-ab88-20f7382dd24c";

        // management.azure.com token
        TokenCredentials tokenCredentials = new TokenCredentials(accessToken);

        var managementClient = new AuthorizationManagementClient(tokenCredentials);
        managementClient.SubscriptionId = subscriptionId;

        var roleAssignment = await createRoleAssignment(managementClient, subscriptionId, ownerRoleId, servicePrincipalObjectId, resourceGroupName, log);
        if (roleAssignment.Error != null) {
            log.Info("Failed to assign role", roleAssignment.Error);
            log.Info("Ignoring failure and continuing...");
        } else {
            log.Info("Created Role Assignment");
        }

        return new { };
}

private static async Task<ResultContainer<RoleAssignmentInner>> createRoleAssignment (AuthorizationManagementClient managementClient, string subscriptionId, string roleId, string servicePrincipalId, string resourceGroupName, TraceWriter log) {
    // Assigning role to the service principal over the resource group
    // This can only be done if the user deploying is owner of their subscription,
    // so this will often fail (and raise a CloudException)
    log.Info("Creating Role Assignment...");
    var roleAssignmentParameters = new RoleAssignmentCreateParameters
    {
        RoleDefinitionId = "/subscriptions/{0}/providers/Microsoft.Authorization/roleDefinitions/{1}".FormatInvariant(subscriptionId, roleId),
        PrincipalId = servicePrincipalId,
        CanDelegate = false

    };

    var scope = "subscriptions/{0}/resourceGroups/{1}".FormatInvariant(subscriptionId, resourceGroupName);

    var retry_count = 0;
    var retry_time = 5000; // 5 seconds
    var max_retries = 5;

    var errorText = "";
    do
    {
        if (retry_count > 0) {
            log.Info("Retrying...");
        }
        System.Threading.Thread.Sleep(retry_time * retry_count);
        try 
        {
            var roleAssignment = await managementClient.RoleAssignments.CreateAsync(scope:scope, roleAssignmentName:Guid.NewGuid().ToString(), parameters:roleAssignmentParameters);
            return new ResultContainer<RoleAssignmentInner>{Result = roleAssignment};
        }
        catch (Microsoft.Rest.Azure.CloudException e)
        {
            log.Info("Failed to create Role Assignment: " + e.Message);
            errorText = e.Message;
            if (e.Response.StatusCode == HttpStatusCode.Forbidden) {
                break;
            }
            retry_count++;
        }
    } while (retry_count < max_retries);
    return new ResultContainer<RoleAssignmentInner>{Error = errorText};
}