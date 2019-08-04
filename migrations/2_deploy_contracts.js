const SuperGood = artifacts.require('./SuperGood.sol');

module.exports = function(deployer){
 //deployer.deploy(SuperGood);
   address = deployer.deploy(SuperGood);

   /*var fs = require("fs");

   var data = address;

   fs.writeFile("./contracts/jscontracts/address.txt", data, (err) => {
     if (err) console.log(err);
     console.log("Successfully Written to File.");
   });*/

};
