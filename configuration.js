var fs = require('fs');



module.exports.data = {
  "configurations" :[
    {
      "name" : "host1",
      "hostname" : "nessus-ntp.lab.com",
      "port" : "1241",
      "username" : "toto"
    },
    {
      "name" : "host2",
      "hostname" : "nessus-xml.lab.com",
      "port" : "3384",
      "username" : "admin"
    }
  ]
};


/*
* Opens a json file to retrive configurations from
*/
module.exports.Open = function(inputFilename){

  fs.readFile(inputFilename, 'utf8', function (err, content) {
    if (err) {
      console.log(err);
    }else{
      //read is good
      console.log("JSON read from " + inputFilename);
    }

    //console.log(content);
    module.exports.data = JSON.parse(content);
    //console.log(module.exports.data);
    });

}

/*
* Saves current data set to a json file
*/
module.exports.Save = function(outputFilename){



  var temp = {
    "configurations" : []
  };

  //clean up date for nulls
  module.exports.data.configurations.forEach(function (item) {
    if (item && item.name){
      temp.configurations.push(item);
    }
  });


  // write file if it's missing;
  var opts = {
    flags: 'w+'
  };
  fs.writeFile(outputFilename, JSON.stringify(temp, null, 4),
  opts ,function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
  });

}

// find a configuration
module.exports.Find = function (name){
  return module.exports.data.configurations.filter(function(item) {
    if (item){
      return item.name == name;
    }
  });
}

// delete a configurations
module.exports.Delete = function (name){
  var rv = false; // assume not found
  // loop until I find the configuration, then delete it.
  var index = 0;
  module.exports.data.configurations.forEach(function (item) {

    if (item.name == name){
      module.exports.data.configurations[index] = null;
      delete module.exports.data.configurations[index];
      rv = true;// was found and deleted
      return;
    }
    index ++;
  });
  return rv;
}

// check for configuration name existing, if not, then add
module.exports.Add = function (name, hostname, port, user){

    // make sure the item is unique
    if (module.exports.Find(name).length !=0 )
    {
      return false;
    }

    // add the config
    module.exports.data.configurations.push( {
        "name" : name,
        "hostname" : hostname,
        "port" : port,
        "username" : user
      }
    );
    return true;
}

module.exports.Modify = function (name, hostname, port, user){

    // make sure the item is already there
    if (module.exports.Find(name).length != 1 )
    {
      return false;
    }

    // loop until I find the configuration, then modify it.
    var index = 0;
    //console.log('james' + name);
    module.exports.data.configurations.forEach(function (item) {
      //console.log(name);
      //console.log(item.name);
      if (item.name == name){
        module.exports.data.configurations[index].hostname = hostname;
        module.exports.data.configurations[index].port = port;
        module.exports.data.configurations[index].username = user;
        console.log(module.exports.data.configurations);
        return;
      }
      index ++;
    });


    //return true;
}
