#load "..\CiqsHelpers\All.csx"
#load "..\helpers\HelperCommon.csx"

#r "System.Net.Primitives"
#r "System.Text.Encoding"

using Microsoft.Azure.Management.Graph.RBAC.Fluent;
using Microsoft.Azure.Management.Graph.RBAC.Fluent.Models;
using Microsoft.Rest;
using System.Text.RegularExpressions;
using System; 
using System.Text;

public class AppRole {
    public string[] allowedMemberTypes { get; set; }
    public string displayName { get; set; }
    public string id { get; set; }
    public bool isEnabled { get; set; }
    public string description { get; set; }
    public string value { get; set; }

}

public class Output
{
    public string oAppId {get; set;}
    public string oDomainName {get; set;}
    public string oObjectId {get; set;}
    public string oServicePrincipalSecret {get; set;}
	public string oSQLDBPassword {get; set;}
	public string oTenantId {get; set;}
	public string oAuthToken {get; set;}
	public string oSolutionUrl {get;set;}
	public string oVMPassword {get; set;}
	public string oVpBootupScriptURL {get; set;}
	public string oGvaBootupScriptURL {get; set;}
	public string oVpSourceCodeURL {get; set;}
	public string oGvaSourceCodeURL {get; set;}
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
        string azureWebsite = parametersReader.GetParameter<string>("solutionName");
		string location = parametersReader.GetParameter<string>("location");
        string tenantId =  parametersReader.GetParameter<string>("tenantId");
        string graphAccessToken =  parametersReader.GetParameter<string>("graphAccessToken");
        string accessToken = parametersReader.GetParameter<string>("accessToken");
		string resourceGroupName = parametersReader.GetParameter<string>("resourceGroupName");
		
        location = Regex.Replace(location, @"\s", "");
        
        //string solutionUrl = "https://" + resourceGroupName + "-vp-webapp.azurewebsites.net";
        string solutionUrl = "http://iclpvp-" + resourceGroupName + "." + location + ".cloudapp.azure.com:3000";
		string domain1 = solutionUrl; 
		string domain2 = "https://iclpvp-" + azureWebsite +"."+location+".cloudapp.azure.com:4000";
		string vmpassword = RandomPassword(true,true,true,true,false,16);
		System.Threading.Thread.Sleep((int)System.TimeSpan.FromSeconds(1).TotalMilliseconds);
		string sqldbpassword = RandomPassword(true,true,true,true,false,16);		
		
        // graph.azure.com token
        TokenCredentials graphTokenCredentials = new TokenCredentials(graphAccessToken);

		System.Threading.Thread.Sleep((int)System.TimeSpan.FromSeconds(1).TotalMilliseconds);
        string servicePrincipalSecret = RandomPassword(true,true,true,true,false,44);;
        string servicePrincipalPasswordKeyId = Guid.NewGuid().ToString();

        var graphClient = new GraphRbacManagementClient(graphTokenCredentials);
        graphClient.TenantID = tenantId;

        // Add random alphanumeric characters to the name of the application to avoid naming conflicts
        string randomName = azureWebsite + "-" + Guid.NewGuid().ToString("n").Substring(0, 10);

        var appResult = await createApplication(graphClient, servicePrincipalSecret, servicePrincipalPasswordKeyId, randomName, domain1, domain2, log);
        if (appResult.Error != null) {
            return CreateCSharpError("Failed to create AAD Application", appResult.Error);
        }
        log.Info("Created AAD Application");
        var app = appResult.Result;

        // Return object
		Output toReturn = new Output
        {
            oAppId = app.AppId,
            oDomainName = domain1,
            oObjectId = app.ObjectId,
            oServicePrincipalSecret = servicePrincipalSecret,			
			oTenantId = tenantId,
			oAuthToken = accessToken,
			oSolutionUrl = solutionUrl,
			oVMPassword = vmpassword,
			oSQLDBPassword = sqldbpassword,
			oVpBootupScriptURL="https://ccreleases.blob.core.windows.net/iclp/setup_vp_app_p1.sh?sp=r&st=2019-08-05T04:53:35Z&se=2020-08-31T12:53:35Z&spr=https&sv=2018-03-28&sig=ycyqvD7Uf4GO14u80rs8xExCIXyYDC8iTJe%2F%2BS8fMYY%3D&sr=b",
			oGvaBootupScriptURL="https://ccreleases.blob.core.windows.net/iclp/setup_gva_app_p1.sh?sp=r&st=2019-08-05T04:54:14Z&se=2020-08-31T12:54:14Z&spr=https&sv=2018-03-28&sig=TN1%2Bb7qzGap0GqpVubwiBGrZxrfOfWY4uDIgLPVBAC0%3D&sr=b",
			oVpSourceCodeURL="",
			oGvaSourceCodeURL=""
        };

        return toReturn;
}

private static async Task<ResultContainer<ApplicationInner>> createApplication (GraphRbacManagementClient graphClient, string servicePrincipalSecret, string servicePrincipalPasswordKeyId, string displayName, string domain1, string domain2, TraceWriter log) {
    log.Info("Creating AAD Application...");
    PasswordCredential pass = new PasswordCredential();
    pass.StartDate = DateTime.Now;
    pass.EndDate = DateTime.Now.AddYears(1);
    pass.Value = servicePrincipalSecret;
    pass.KeyId = servicePrincipalPasswordKeyId;
    var resourceAccess = new ResourceAccess 
    {
        Id = "311a71cc-e848-46a1-bdf8-97ff7156d8e6",
        Type = "Scope"
    };
    var requiredResourceAccess = new RequiredResourceAccess 
    {
        ResourceAccess = new[] {resourceAccess},
        ResourceAppId = "00000002-0000-0000-c000-000000000000"
    };
    var approles = new List<AppRole>(); 
    approles.Add(new AppRole {
        allowedMemberTypes = new string[] {"User"},
        displayName = "Admin",
        id = "a400a00b-f67c-42b7-ba9a-f73d8c67e433",
        isEnabled = true,
        description = "Administrator access to the application",
        value = "Admin"
        });
    approles.Add(new AppRole {
        allowedMemberTypes = new string[] {"User"},
        displayName = "Read Only",
        id = "e5bbd0f5-128e-4362-9dd1-8f253c6082d7",
        isEnabled = true,
        description = "Read only access to device information",
        value = "ReadOnly"
        });
    var additionalProperties = new Dictionary<string, object>();
    additionalProperties.Add("appRoles", approles);
    var replyUrl1 = domain1+"/user/auth/openid/return";
	var replyUrl2 = domain2+"/user/auth/openid/return";
    var applicationParameters = new ApplicationCreateParameters
    {
        AvailableToOtherTenants = false,
        DisplayName = displayName,
        Homepage = domain1,
        ReplyUrls = new[] {replyUrl1, replyUrl2},
        IdentifierUris = new[] {domain1},
        PasswordCredentials = new[] {pass},
        Oauth2AllowImplicitFlow = true,
        RequiredResourceAccess = new [] {requiredResourceAccess},
        AdditionalProperties = additionalProperties
    };

    var retry_count = 0;
    var retry_time = 5000; // 5 seconds
    var max_retries = 5;

    string errorText = "";
    do
    {
        if (retry_count > 0) {
            log.Info("Retrying...");
        }
        System.Threading.Thread.Sleep(retry_time * retry_count);
        try 
        {
            var app = await graphClient.Applications.CreateAsync(applicationParameters);
            return new ResultContainer<ApplicationInner>{Result = app};
        }
        catch (GraphErrorException e)
        {
            log.Info("Failed to create AAD Application: " + e.Message);
            errorText = e.Message;
            retry_count++;
        }
    } while (retry_count < max_retries);
    return new ResultContainer<ApplicationInner>{Error = errorText};
}

    public static string RandomPassword(bool includeLowercase, bool includeUppercase, bool includeNumeric, bool includeSpecial, bool includeSpaces, int lengthOfPassword)
        {
            const int MAXIMUM_IDENTICAL_CONSECUTIVE_CHARS = 1;
            const string LOWERCASE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
            const string UPPERCASE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string NUMERIC_CHARACTERS = "0123456789";
            const string SPECIAL_CHARACTERS = "@#%";
            const string SPACE_CHARACTER = " ";
            const int PASSWORD_LENGTH_MIN = 8;
            const int PASSWORD_LENGTH_MAX = 128;

            if (lengthOfPassword < PASSWORD_LENGTH_MIN || lengthOfPassword > PASSWORD_LENGTH_MAX)
            {
                return "Password length must be between 8 and 128.";
            }

            string characterSet = "";
            
            if (includeLowercase)
            {
                characterSet += LOWERCASE_CHARACTERS;
            }

            if (includeUppercase)
            {
                characterSet += UPPERCASE_CHARACTERS;
            }

            if (includeNumeric)
            {
                characterSet += NUMERIC_CHARACTERS;
            }

            if (includeSpecial)
            {
                characterSet += SPECIAL_CHARACTERS;
            }

            if (includeSpaces)
            {
                characterSet += SPACE_CHARACTER;
            }

            char[] password = new char[lengthOfPassword];
            int characterSetLength = characterSet.Length;

            System.Random random = new System.Random();
            for (int characterPosition = 0; characterPosition < lengthOfPassword; characterPosition++)
            {
                if(characterPosition == 0)
                    password[characterPosition] = UPPERCASE_CHARACTERS[random.Next(25)];
                else if(characterPosition == 1)
                    password[characterPosition] = NUMERIC_CHARACTERS[random.Next(9)];
                else if(characterPosition == 2)
                    password[characterPosition] = SPECIAL_CHARACTERS[random.Next(2)];
                else if(characterPosition == 3)
                    password[characterPosition] = LOWERCASE_CHARACTERS[random.Next(25)];
                else    
                    password[characterPosition] = characterSet[random.Next(characterSetLength - 1)];

                bool moreThanTwoIdenticalInARow = 
                    characterPosition > MAXIMUM_IDENTICAL_CONSECUTIVE_CHARS
                    && password[characterPosition] == password[characterPosition - 1] 
                    && password[characterPosition - 1] == password[characterPosition - 2];

                if (moreThanTwoIdenticalInARow)
                {
                    characterPosition--;
                }
            }

            return string.Join(null, password);
        }
