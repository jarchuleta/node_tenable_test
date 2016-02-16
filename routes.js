var fs = require('fs');
var util = require('util');


// Read the requested file content from file system and output to response
function readFile(path, response){

  fs.readFile(path, function (err, data) {
     if (err) {
        console.log(err);
        // HTTP Status: 404 : NOT FOUND
        // Content Type: text/plain
        response.writeHead(404, {'Content-Type': 'text/html'});
     }else{
        //Page found
        // HTTP Status: 200 : OK
        // Content Type: text/plain
        response.writeHead(200, {'Content-Type': 'text/html'});

        // Write the content of the file to response body
        response.write(data.toString());
     }
     // Send the response body
     response.end();
   });

}

// Read the requested file content from file system and output to response
function readFileCallback(path, response, callback){

  fs.readFile(path, function (err, data) {
     if (err) {
        console.log(err);
        // HTTP Status: 404 : NOT FOUND
        // Content Type: text/plain
        response.writeHead(404, {'Content-Type': 'text/html'});
     }else{
        //Page found
        // HTTP Status: 200 : OK
        // Content Type: text/plain
        response.writeHead(200, {'Content-Type': 'text/html'});

        callback(data);


     }
     // Send the response body
     response.end();
   });

}

// simple index
module.exports.index =  function (request, response){
  readFile('html/index.html', response);
}

// simple output a string used for scaffolding
module.exports.output =  function (request, response, output){
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(output);
  response.end();
}

// report 404
module.exports.fourohfour =  function (request, response){
  response.writeHead(404, {'Content-Type': 'text/html'});
  response.write("404 Missing page");
  response.end();
}

// renders the login file
module.exports.login =  function (request, response){

  readFile('html/login.html', response);

}

/*
* login state determined by cookie.
* propper username/password sets the cookie.
* cookie storage is not secure, as the user could set the cookie manually
*/
module.exports.post_login =  function (request, response){

  console.log(request.post);
  // replace with real login logic
  if(request.post.username == 'James' && request.post.password == 'James'){
    response.writeHead(200, {'Set-Cookie': 'login=true','Content-Type': 'text/html'});

    response.write("User logged in <p><a href=\"/\">index</a></p>");
  }else{
    response.writeHead(200, {'Content-Type': 'text/html'});

    response.write("Log in failed <p><a href=\"/login\">Try again</a></p>");
  }
  response.end();
}

/*
* log out is simple, it sets the cookie to false
*/
module.exports.logout =  function (request, response){
  response.writeHead(200, {'Set-Cookie': 'login=false','Content-Type': 'text/html'});
  response.write("user logged out <p><a href=\"/\">index</a></p>");
  response.end();
}

//------------------------------------------------------------------------------

//check cookie if logged in
function isLoggedIn(request){

  var rc = request.headers.cookie;
  if (request.headers.cookie === 'login=true'){
    return true;
  }else{
    return false;
  }

}

var config = require('./configuration.js');
config.Open('configuration.json'); // make sure that config is open

module.exports.retrieve =  function (request, response){

  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }
  config.Open('configuration.json');



  response.writeHead(200, {'Content-Type': 'application/json'});
  response.write(JSON.stringify(config.data, 'james', 4));
  response.end();

}

module.exports.post_retrieve =  function (request, response){

  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }
  config.Open('configuration.json');

  var data = config.Find(request.post.name);

  response.writeHead(200, {'Content-Type': 'application/json'});
  response.write(JSON.stringify(data, null, 4));
  response.end();

}

module.exports.create =  function (request, response){
  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }

  readFile('html/create.html', response);
}

module.exports.post_create =  function (request, response){
  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }

  config.Open('configuration.json');
  var addStatus = config.Add(request.post.name,request.post.hostname, request.post.port, request.post.user);
  config.Save('configuration.json');
  var results = {
    "status" : addStatus,
    "configurations" : config.data,
  }

  response.writeHead(200, {'Content-Type': 'application/json'});
  response.write(JSON.stringify(results, null, 4));
  response.end();
}


module.exports.modify =  function (request, response){
  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }

  config.Open('configuration.json');
  if (request.query.name != undefined){

    var item = config.Find(request.query.name);
    console.log(item[0].name);
    readFileCallback('html/modify.html', response, function (data){
      var body = util.format(data.toString(),
        item[0].name,
        item[0].name,
        item[0].hostname,
        item[0].port,
        item[0].username);

      response.write(body);
    });
  }else{


    var table = '<table>';

    config.data.configurations.forEach(function (item) {
      table += '<tr>';
      table += '<td><a href="/modify?name='+item.name+'">'+item.name+'</a> </td>';
      table += '<td><form method="post" action="/delete">';
      table += '<input type="hidden" name="name" value="'+item.name+'">';
      table += '<input type="submit" name="submit" value="Delete">';
      table += '</form></td>';
      table += '</tr>'
    });
    table += '</table>';

    readFileCallback('html/modifyList.html', response, function (data){
      var body = util.format(data.toString(), table);
      response.write(body);
    });
  }


}

module.exports.post_modify =  function (request, response){
  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }

  config.Open('configuration.json');
  //console.log(request.post);
  var sucess = config.Modify(request.post.name,request.post.hostname, request.post.port, request.post.user);
  config.Save('configuration.json');
  var results = {
    "status" : sucess,
    "configurations" : config.data,
  }
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.write(JSON.stringify(results, null, 4));
  response.end();

}


module.exports.post_delete =  function (request, response){

  // redirect if not logged in
  if (isLoggedIn(request) == false){
    response.writeHead(302, {'location': '/login'});
    response.end();
    return;
  }

  config.Open('configuration.json');
  var deletedSucess = config.Delete(request.post.name);
  config.Save('configuration.json');
  var results = {
    "status" : deletedSucess,
    "configurations" : config.data,
  }
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.write(JSON.stringify(results, null, 4));
  response.end();

}
