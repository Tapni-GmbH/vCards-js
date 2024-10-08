"use strict";

/* global require, describe, it: true */

const vCard = require("../index");
const assert = require("assert");

/**
 * Test values.
 */
const TEST_VALUE_UID = "69531f4a-c34d-4a1e-8922-bd38a9476a53";
const TEST_FILENAME = "./test/testCard.vcf";

/**
 * Get vCard value by field name.
 * @param  {string} fieldName
 * @param  {Array} lines
 * @return {string}
 */
let getValueByFieldName = (fieldName, lines) => {
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.indexOf(fieldName) === 0) {
      return line.split(":")[1];
    }
  }

  return undefined;
};

/**
 * Test cases.
 */
describe("vCard", function () {
  let testCard = vCard();
  testCard.version = "3.0";
  testCard.uid = TEST_VALUE_UID;
  testCard.lastName = "Doe";
  testCard.middleName = "D";
  testCard.firstName = "John";
  testCard.nameSuffix = "JR";
  testCard.namePrefix = "MR";
  testCard.nickname = "Test User";
  testCard.gender = "M";
  testCard.organization = "ACME Corporation";
  testCard.photo.attachFromUrl("https://testurl", "png");
  testCard.logo.attachFromUrl("https://testurl", "png");
  testCard.workPhone = [
    "312-555-1212",
    {
      label: "CUSTOM WORK LABEL",
      number: "312-555-1212",
    },
  ]; // OR testCard.workPhone = "312-555-1212";

  testCard.homePhone = [
    "312-555-1313",
    {
      label: "CUSTOM HOME LABEL",
      number: "312-555-1313",
    },
  ]; // OR testCard.homePhone = "312-555-1313";
  testCard.cellPhone = "12345678900";
  testCard.pagerPhone = "312-555-1515";
  testCard.homeFax = "312-555-1616";
  testCard.workFax = "312-555-1717";
  testCard.birthday = new Date(2018, 11, 1);
  testCard.anniversary = new Date(2018, 11, 1);
  testCard.title = "Crash Test Dummy";
  testCard.role = "Crash Testing";
  testCard.email = [
    "john.doe@testmail",
    { email: "john.doe@testmail", label: "Custom Private Label" },
  ]; // or testCard.email = "john.doe@testmail";

  testCard.workEmail = [
    "john.doe@workmail",
    { email: "john.doe@workmail", label: "Custom Work Label" },
  ]; // or testCard.workEmail = "john.doe@workmail";

  testCard.url = [
    "http://johndoe",
    { url: "http://johndoeeee", label: "Custom URL Label" },
  ]; // or testCard.url = "http://johndoe";

  testCard.workUrl = [
    "http://acemecompany/johndoe",
    { url: "http://acemecompany/johndoeee", label: "Custom WORK URL Label" },
  ]; // or testCard.workUrl = "http://acemecompany/johndoe";

  testCard.homeAddress.label = "Home Address";
  testCard.homeAddress.street = "123 Main Street";
  testCard.homeAddress.city = "Chicago";
  testCard.homeAddress.stateProvince = "IL";
  testCard.homeAddress.postalCode = "12345";
  testCard.homeAddress.countryRegion = "United States of America";

  testCard.workAddress.label = "Work Address";
  testCard.workAddress.street = "123 Corporate Loop\nSuite 500";
  testCard.workAddress.city = "Los Angeles";
  testCard.workAddress.stateProvince = "CA";
  testCard.workAddress.postalCode = "54321";
  testCard.workAddress.countryRegion = "California Republic";

  testCard.otherAddresses = [
    {
      type: "HOME",
      label: "Home Address",
      street: "124 Main Street",
      city: "Los Angeles",
      stateProvince: "CA",
      postalCode: "54321",
      countryRegion: "California Republic",
    },
    {
      type: "WORK",
      street: "123 Corporate Loop\nSuite 502",
      city: "Los Angeles",
      stateProvince: "CA",
      postalCode: "54321",
      countryRegion: "California Republic",
    },
    {
      type: "work",
      street: "123 Corporate Loop\nSuite 503",
      city: "Los Angeles",
      stateProvince: "CA",
      postalCode: "54321",
      countryRegion: "California Republic",
    },
    {
      street: "Jovana Kursule 2",
      city: "Ćuprija",
      stateProvince: "RS",
      postalCode: "35230",
      countryRegion: "Serbia",
    },
  ];

  testCard.otherPhone = [
    {
      label: "CUSTOM LABEL",
      number: "312-555-1316",
    },
    {
      label: "CUSTOM LABEL",
      number: "312-555-1353",
    },
  ];

  testCard.source = "http://sourceurl";
  testCard.note = "John Doe's \nnotes;,";

  testCard.socialUrls.facebook = "https://facebook/johndoe";
  testCard.socialUrls.linkedIn = "https://linkedin/johndoe";
  testCard.socialUrls.twitter = "https://twitter/johndoe";
  testCard.socialUrls.flickr = "https://flickr/johndoe";
  testCard.socialUrls.custom = "https://custom/johndoe";

  testCard.socialUrls.tapni = "https://my.tapni.co";
  // OR IF YOU HAVE MULTIPLE SOCIAL URLS FROM SAME SOCIAL NETWORK
  testCard.socialUrls.tapni = [
    "https://t.link",
    "https://t.link",
    "https://t.link",
    "https://t.link",
  ];

  var vCardString = testCard.getFormattedString();
  var lines = vCardString.split(/[\n\r]+/);

  describe(".getFormattedString", function () {
    it("should start with BEGIN:VCARD", function (done) {
      assert(lines.length > 0 && lines[0] === "BEGIN:VCARD");
      done();
    });

    it("should be well-formed", function (done) {
      var line = "";
      var segments = "";

      for (var i = 0; i < lines.length; i++) {
        line = lines[i];

        if (line.length > 0) {
          segments = line.split(":");
          assert(segments.length >= 2 || segments[0].indexOf(";") === 0);
        }
      }
      done();
    });

    it("should encode [\\n,',;] properly (3.0+)", function (done) {
      var line = "";

      for (var i = 0; i < lines.length; i++) {
        line = lines[i];

        if (line.indexOf("NOTE") === 0) {
          assert(
            line.indexOf("\\n") !== -1 &&
              line.indexOf("\\") !== -1 &&
              line.indexOf("\\;") !== -1
          );
          done();
        }
      }
    });

    it("should encode numeric input as strings", function (done) {
      testCard.workAddress.postalCode = 12345;
      testCard.getFormattedString();
      done();
    });

    it("should format birthday as 20181201", function (done) {
      let birthdayValue = getValueByFieldName("BDAY", lines);
      assert(birthdayValue === "20181201");
      done();
    });

    it("should format anniversary as 20181201", function (done) {
      let anniversaryValue = getValueByFieldName("ANNIVERSARY", lines);
      assert(anniversaryValue === "20181201");
      done();
    });

    it("should not crash when cellPhone is a large number, using 12345678900", function (done) {
      testCard.cellPhone = 12345678900;
      done();
    });

    it(`should have UID set as test value: ${TEST_VALUE_UID}`, (done) => {
      assert(getValueByFieldName("UID", lines) === TEST_VALUE_UID);
      done();
    });

    it("should end with END:VCARD", function (done) {
      assert(lines.length > 2 && lines[lines.length - 2] === "END:VCARD");
      done();
    });

    it(`should save to ${TEST_FILENAME}`, function (done) {
      testCard.saveToFile(TEST_FILENAME);
      done();
    });

    it("should get address from other addresses", function (done) {
      let stringSplit = lines[30].split(";");
      assert(stringSplit[4] === "124 Main Street");
      done();
    });

    it("should get custom type from other phones - phone 312-555-1316", function (done) {
      assert(
        getValueByFieldName("TEL;TYPE=CUSTOM LABEL", lines) === "312-555-1316"
      );
      done();
    });

    it("should get custom type from phones with custom label - phone 312-555-1212", function (done) {
      assert(
        getValueByFieldName("TEL;TYPE=CUSTOM WORK LABEL", lines) ===
          "312-555-1212"
      );
      done();
    });
  });
});
