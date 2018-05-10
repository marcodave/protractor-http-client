var fs = require("fs");
var products = [
    {
        "id": 1,
        "name": "Product001",
        "cost": 10,
        "quantity": 1000,
        "locationId": 1,
        "familyId": 1
    },
    {
        "id": 2,
        "name": "Product002",
        "cost": 20,
        "quantity": 2000,
        "locationId": 1,
        "familyId": 2
    },
    {
        "id": 3,
        "name": "Product003",
        "cost": 30,
        "quantity": 3000,
        "locationId": 3,
        "familyId": 2
    },
    {
        "id": 4,
        "name": "Product004",
        "cost": 40,
        "quantity": 4000,
        "locationId": 2,
        "familyId": 3
    }
];
var data = {
    products1: products,
    products2: products
};
fs.writeFileSync(__dirname + '/database.json', JSON.stringify(data));