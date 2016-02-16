
var http = require('http');
var url = require('url')
var routes = require('./routes.js')
var qs = require('querystring');

/*
* Creates a http server to listen for requests on
*/
var server = http.createServer(handleRequests);

// start the server
var port = 8000;
server.listen(port, function(){
  console.log("Server started");
});

/*
*  Handles the incoming requests and routs to functions
*/
function handleRequests(request, response){

  // Parse the request containing file name
  // assuming url.parse sanitized pathname
  var url_parts = url.parse(request.url, true);

  var pathname = url_parts.pathname;
  request.query = url_parts.query;

  //swtich statement to handle simple routes
  switch(pathname){
    case '/':
      routes.index(request, response);
      break;
    case '/logout':
      routes.logout(request, response);
      break;
    case '/login':
      if(request.method == 'POST') {
        processPost(request, response,routes.post_login);
      }else{
        routes.login(request, response);
      }
      break;
      //------------------------------------------------------------------------
      case '/retrieve':
        if(request.method == 'POST') {
          processPost(request, response,routes.post_retrieve);
        }else{
          routes.retrieve(request, response);
        }

        break;

      case '/create':
          if(request.method == 'POST') {
            processPost(request, response,routes.post_create);
          }else{
            routes.create(request, response);
          }
          break;


      case '/delete':
          if(request.method == 'POST') {
            processPost(request, response,routes.post_delete);
          }else{
            routes.modify(request, response);
          }
          break;

      case '/modify':
        if(request.method == 'POST') {
          processPost(request, response,routes.post_modify);
        }else{
          routes.modify(request, response);
        }
        break;


        //------------------------------------------------------------------------

    default:
      routes.fourohfour(request, response);
  }


}
/**
* Process post request to get the incoming data
*/
function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = qs.parse(queryData);
            callback(request, response);
        });

    } else {
        return null;
    }
}
