const expect = require("chai").expect;
const server = require("../bin/www.js");

describe("test", () => {
    it("should return a string", () => {
        expect("Server started on port").to.equal("Server started on port");
    });
});
