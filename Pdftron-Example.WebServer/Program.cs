using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();


var app = builder.Build();


#region Static files configuration

#region Web client folder configuration

FileServerOptions fileServerOptions = new FileServerOptions();
fileServerOptions.DefaultFilesOptions.DefaultFileNames.Clear();
fileServerOptions.DefaultFilesOptions.DefaultFileNames.Add("webclient/index.html");
app.UseFileServer(fileServerOptions);

Action<StaticFileResponseContext> staticFileOnPrepareResponse = (ctx) =>
{
    ctx.Context.Response.GetTypedHeaders().CacheControl = new CacheControlHeaderValue()
    {
        Public = true,
        MaxAge = TimeSpan.FromMinutes(5)
    };
};

var angularAppStaticFilesFolderPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot/webclient");

if (!Directory.Exists(angularAppStaticFilesFolderPath))
    Directory.CreateDirectory(angularAppStaticFilesFolderPath);

var angularAppStaticFileOptions = new StaticFileOptions()
{
    OnPrepareResponse = staticFileOnPrepareResponse,
    FileProvider = new PhysicalFileProvider(angularAppStaticFilesFolderPath),
    RequestPath = ""
};

app.UseStaticFiles(angularAppStaticFileOptions);

#endregion


#region Static folder configuration

var staticFilesFolderPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot/Static");
if (!Directory.Exists(staticFilesFolderPath))
    Directory.CreateDirectory(staticFilesFolderPath);
app.UseStaticFiles(new StaticFileOptions()
{
    OnPrepareResponse = staticFileOnPrepareResponse,
    FileProvider = new PhysicalFileProvider(staticFilesFolderPath),
    RequestPath = "/Static"
});

#endregion

app.MapFallbackToFile("{*path:nonfile}", "/index.html", angularAppStaticFileOptions);

#endregion


app.MapControllerRoute(
    name: "ServiceRoutes",
    pattern: "{area:exists}/{controller}/{action}"
); 

app.Run();
