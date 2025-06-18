using Microsoft.AspNetCore.Mvc;

namespace Pdftron_Example.WebServer
{
    [Area("Service")]
    [Route("[area]/App")]
    [ApiController]
    public class AppController : ControllerBase
    {
        private IWebHostEnvironment Environment;

        public AppController(IWebHostEnvironment environment)
        {
            this.Environment = environment;
        }

        [Route("Document"), HttpGet, HttpHead]
        public FileStreamResult Get()
        {
            string path = Path.Combine(this.Environment.WebRootPath, "Static", "01 - January 2018 (myphotopack.com).jpg");
            return new FileStreamResult(System.IO.File.OpenRead(path), "image/jpg");
        }

    }
}
