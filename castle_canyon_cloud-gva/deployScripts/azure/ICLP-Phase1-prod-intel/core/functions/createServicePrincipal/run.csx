#load "..\CiqsHelpers\All.csx"
#load "..\helpers\HelperCommon.csx"

#r "System.Net.Primitives"
#r "System.Text.Encoding"

using Microsoft.Azure.Management.Graph.RBAC.Fluent;
using Microsoft.Azure.Management.Graph.RBAC.Fluent.Models;
using Microsoft.Rest;

public class Output
{
    public string oServicePrincipalId {get; set;}
    public string oServicePrincipalObjectId {get; set;}    
}

public class ResultContainer<T>
{
    public T Result {get; set;}
    public string Error {get; set;}
}

public static async Task<object> Run(HttpRequestMessage req, TraceWriter log)
{
        // Get parameters from SDS     
        var parametersReader = await CiqsInputParametersReader.FromHttpRequestMessage(req);
        string tenantId =  parametersReader.GetParameter<string>("tenantId");
        string graphAccessToken =  parametersReader.GetParameter<string>("graphAccessToken");
        string appId = parametersReader.GetParameter<string>("appId");

        // graph.azure.com token
        TokenCredentials graphTokenCredentials = new TokenCredentials(graphAccessToken);

        var graphClient = new GraphRbacManagementClient(graphTokenCredentials);
        graphClient.TenantID = tenantId;

        var spResult = await createServicePrincipal(graphClient, appId, log);
        if (spResult.Error != null) {
            return CreateCSharpError("Failed to create Service Principal", spResult.Error);
        }
        log.Info("Created Service Principal");
        var sp = spResult.Result;

        // Return object
        Output toReturn = new Output
        {
            oServicePrincipalId = sp.AppId,
            oServicePrincipalObjectId = sp.ObjectId
        };

        return toReturn;
}


private static async Task<ResultContainer<ServicePrincipalInner>> createServicePrincipal (GraphRbacManagementClient graphClient, string appId, TraceWriter log) {
    log.Info("Creating Service Principal...");
    var servicePrincipalParameters = new ServicePrincipalCreateParameters
    {
        AccountEnabled = true,
        AppId = appId
    };

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
            var sp = await graphClient.ServicePrincipals.CreateAsync(servicePrincipalParameters);
            return new ResultContainer<ServicePrincipalInner>{Result = sp};
        }
        catch (GraphErrorException e)
        {
            log.Info("Failed to create Service Principal: " + e.Message);
            errorText = e.Message;
            retry_count++;
        }
    } while (retry_count < max_retries);
    return new ResultContainer<ServicePrincipalInner>{Error = errorText};
}