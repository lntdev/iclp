using Newtonsoft.Json;
using System.Globalization;
using System.Net;
using System.Net.Http.Headers;

const int HELPER_MAX_REQUEST_RETRIES = 15; // the number of retries a request is allowed
const int HELPER_RETRY_DELAY = 1000; // 1 second

private static HttpClient helperClient = new HttpClient();
helperClient.Timeout = TimeSpan.FromSeconds(60);
helperClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

// This method is used by most other functions to send requests and handle retries
// in the event of failure (when request couldn't complete successfully), it creates a CustomException
// containing an error HttpResponseMessage that it throws, bubbling it up the call stack.
// reduces redundancy and allows for uniform approach to exception handling in SDS
public static async Task<T> SendRequest<T>(HttpRequestMessage request, string errorHead, bool returnContentAsString = false)
{
    // initialize a retry counter
    int retryCounter = 0;

    // set lastResponseStatusCode in case of failure, allows for slightly improved error messages
    HttpStatusCode lastResponseCode = HttpStatusCode.OK;

    // keep retrying to send request until out of 'retries'
    while (retryCounter < HELPER_MAX_REQUEST_RETRIES)
    {
        // generate an identical request to be sent with each attempt
        // the same reference of a request cannot be used more than once
        HttpRequestMessage clone = CloneRequestMessageAsync(request);

        try
        {
            // send request and get response, update lastResponseCode
            HttpResponseMessage response = await helperClient.SendAsync(clone);
            lastResponseCode = response.StatusCode;

            if (response.IsSuccessStatusCode)
            {
                // request completed successfully, read response content as string
                var responseContent = await response.Content.ReadAsStringAsync();

                if (returnContentAsString)
                {
                    // if caller indicates they want response content as a string,
                    // (returnContentAsString set to 'false' by default)
                    return (T)Convert.ChangeType(responseContent, typeof(T));
                }

                // Deserialize the object into the type requested, return
                return JsonConvert.DeserializeObject<T>(responseContent);
            }
        }
        catch (Exception ex)
        {
            // catch any number of exceptions, okay and retry
        }

        // increment retryCounter and delay
        retryCounter++;
        await Task.Delay(HELPER_RETRY_DELAY);
    }

    // being here means success condition was never hit, generate and throw CustomException
    HttpResponseMessage errorResponse = CreateCSharpError(errorHead, "Request URI: " + request.RequestUri.ToString(), lastResponseCode);
    throw new CustomException(errorResponse);
}

// This method is used to 'clone' and return an identical HttpRequestMessage to the one passed in
// Necessary for retries because the same reference of a request can only be used once
public static HttpRequestMessage CloneRequestMessageAsync(HttpRequestMessage req)
{
    // create new 'clone' with same HttpMethod and RequestUri
    HttpRequestMessage clone = new HttpRequestMessage(req.Method, req.RequestUri);

    // add all the headers from original request
    foreach (KeyValuePair<string, IEnumerable<string>> header in req.Headers)
    {
        clone.Headers.TryAddWithoutValidation(header.Key, header.Value);
    }

    // if the request has a payload, copy that too
    if (req.Content != null) {
        clone.Content = req.Content;
    }

    // return clone
    return clone;
}

// This method creates an error HttpResponseMessage that the deployment engine expects. Error message is of the format:
// "  'Error Head: Broad failure description'
//    'Error Detail: Some more detail about the error'
//    'LastStatusCodeString: Most errors stem from HTTP requests, this provides insight into the reason for failure. i.e BadRequest'
public static HttpResponseMessage CreateCSharpError(string errorHead, string errorDetail, HttpStatusCode StatusCode = HttpStatusCode.OK)
{
    // Generate error message
    string errorMessage = errorHead + "\n" +
        errorDetail +
        GetLastStatusCodeString(StatusCode);

    // Generate and return an error HttpResponseMessage object with error message
    return new HttpResponseMessage(HttpStatusCode.BadRequest)
    {
        Content = new StringContent(errorMessage)
    };
}

// This method returns a string indicating the last response Status for a given Status Code (i.e. BadRequest)
public static string GetLastStatusCodeString(HttpStatusCode statusCode)
{
    // HttpStatusCode.OK means don't return anything, likely not applicable to error
    if (statusCode == HttpStatusCode.OK)
    {
        return "";
    }

    // set 'base' statusCodeString
    string statusCodeString = "\nLast response status code: ";

    // switch dependent on the statusCode, append a textual representation
    switch (statusCode)
    {
        case HttpStatusCode.BadRequest:
            statusCodeString += "BadRequest";
            break;

        case HttpStatusCode.Forbidden:
            statusCodeString += "Forbidden";
            break;

        case HttpStatusCode.BadGateway:
            statusCodeString += "BadGateway";
            break;

        case HttpStatusCode.GatewayTimeout:
            statusCodeString += "GatewayTimeout";
            break;

        case HttpStatusCode.InternalServerError:
            statusCodeString += "InternalServerError";
            break;

        case HttpStatusCode.NoContent:
            statusCodeString += "NoContent";
            break;

        case HttpStatusCode.NotFound:
            statusCodeString += "NotFound";
            break;

        case HttpStatusCode.RequestTimeout:
            statusCodeString += "RequestTimeout";
            break;

        case HttpStatusCode.ServiceUnavailable:
            statusCodeString += "ServiceUnavailable";
            break;

        case HttpStatusCode.Unauthorized:
            statusCodeString += "Unauthorized";
            break;

        default:
            // for any other statusCode that has not been made explicit
            statusCodeString = "";
            break;
    }

    // return full string
    return statusCodeString;
}

// This method is used to modify strings by inserting them into a base string
public static string FormatInvariant(this string format, params object[] args)
{
    return string.Format(CultureInfo.InvariantCulture, format, args ?? new object[0]);
}

// A CustomException that the other Azure Functions handle, helps with error handling 'expected' failures
// Also serves as a way to 'bubble' an error HttpResponseMessage back to UI
public class CustomException : Exception
{
    public HttpResponseMessage FailureResponse;

    public CustomException(HttpResponseMessage response)
    {
        FailureResponse = response;
    }

    public CustomException()
    {
    }

    public CustomException(string message)
        : base(message)
    {
    }

    public CustomException(string message, Exception inner)
        : base(message, inner)
    {
    }
}