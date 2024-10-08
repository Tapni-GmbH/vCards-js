/********************************************************************************
 vCards-js, Eric J Nesser, November 2014,
 ********************************************************************************/
/*jslint node: true */
"use strict";

/**
 * vCard formatter for formatting vCards in VCF format
 */
(function vCardFormatter() {
  var majorVersion = "3";

  /**
   * Encode string
   * @param  {String}     value to encode
   * @return {String}     encoded string
   */
  function e(value) {
    if (value) {
      if (typeof value !== "string") {
        value = "" + value;
      }
      return value
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    }
    return "";
  }

  /**
   * Return new line characters
   * @return {String} new line characters
   */
  function nl() {
    return "\r\n";
  }

  /**
   * Get formatted photo
   * @param  {String} photoType       Photo type (PHOTO, LOGO)
   * @param  {String} url             URL to attach photo from
   * @param  {String} mediaType       Media-type of photo (JPEG, PNG, GIF)
   * @return {String}                 Formatted photo
   */
  function getFormattedPhoto(photoType, url, mediaType, base64) {
    var params;

    if (majorVersion >= 4) {
      params = base64 ? ";ENCODING=b;MEDIATYPE=image/" : ";MEDIATYPE=image/";
    } else if (majorVersion === 3) {
      params = base64 ? ";ENCODING=b;TYPE=" : ";TYPE=";
    } else {
      params = base64 ? ";ENCODING=BASE64;" : ";";
    }

    var formattedPhoto = photoType + params + mediaType + ":" + e(url) + nl();
    return formattedPhoto;
  }

  /**
   * Get formatted address
   * @param  {object}         address
   * @param  {object}         encoding prefix
   * @return {String}         Formatted address
   */
  function getFormattedAddress(encodingPrefix, address) {
    var formattedAddress = "";

    if (
      address.details.label ||
      address.details.street ||
      address.details.city ||
      address.details.stateProvince ||
      address.details.postalCode ||
      address.details.countryRegion
    ) {
      if (majorVersion >= 4) {
        formattedAddress =
          "ADR" +
          encodingPrefix +
          ";TYPE=" +
          address.type +
          (address.details.label
            ? ';LABEL="' + e(address.details.label) + '"'
            : "") +
          ":;;" +
          e(address.details.street) +
          ";" +
          e(address.details.city) +
          ";" +
          e(address.details.stateProvince) +
          ";" +
          e(address.details.postalCode) +
          ";" +
          e(address.details.countryRegion) +
          nl();
      } else {
        if (address.details.label) {
          formattedAddress =
            "LABEL" +
            encodingPrefix +
            ";TYPE=" +
            address.type +
            ":" +
            e(address.details.label) +
            nl();
        }
        formattedAddress +=
          "ADR" +
          encodingPrefix +
          ";TYPE=" +
          address.type +
          ":;;" +
          e(address.details.street) +
          ";" +
          e(address.details.city) +
          ";" +
          e(address.details.stateProvince) +
          ";" +
          e(address.details.postalCode) +
          ";" +
          e(address.details.countryRegion) +
          nl();
      }
    }

    return formattedAddress;
  }

  /**
   * Convert date to YYYYMMDD format
   * @param  {Date}       date to encode
   * @return {String}     encoded date
   */
  function YYYYMMDD(date) {
    return (
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2)
    );
  }

  module.exports = {
    /**
     * Get formatted vCard in VCF format
     * @param  {object}     vCard object
     * @return {String}     Formatted vCard in VCF format
     */
    getFormattedString: function (vCard) {
      majorVersion = vCard.getMajorVersion();

      var formattedVCardString = "";
      formattedVCardString += "BEGIN:VCARD" + nl();
      formattedVCardString += "VERSION:" + vCard.version + nl();

      var encodingPrefix = majorVersion >= 4 ? "" : ";CHARSET=utf-8";
      var formattedName = vCard.formattedName;

      if (!formattedName) {
        formattedName = "";

        [vCard.firstName, vCard.middleName, vCard.lastName].forEach(function (
          name
        ) {
          if (name) {
            if (formattedName) {
              formattedName += " ";
            }
          }
          formattedName += name;
        });
      }

      formattedVCardString +=
        "FN" + encodingPrefix + ":" + e(formattedName) + nl();
      formattedVCardString +=
        "N" +
        encodingPrefix +
        ":" +
        e(vCard.lastName) +
        ";" +
        e(vCard.firstName) +
        ";" +
        e(vCard.middleName) +
        ";" +
        e(vCard.namePrefix) +
        ";" +
        e(vCard.nameSuffix) +
        nl();

      if (vCard.nickname && majorVersion >= 3) {
        formattedVCardString +=
          "NICKNAME" + encodingPrefix + ":" + e(vCard.nickname) + nl();
      }

      if (vCard.gender) {
        formattedVCardString += "GENDER:" + e(vCard.gender) + nl();
      }

      if (vCard.uid) {
        formattedVCardString +=
          "UID" + encodingPrefix + ":" + e(vCard.uid) + nl();
      }

      if (vCard.birthday) {
        formattedVCardString += "BDAY:" + YYYYMMDD(vCard.birthday) + nl();
      }

      if (vCard.anniversary) {
        formattedVCardString +=
          "ANNIVERSARY:" + YYYYMMDD(vCard.anniversary) + nl();
      }

      if (vCard.email) {
        if (!Array.isArray(vCard.email)) {
          vCard.email = [vCard.email];
        }
        vCard.email.forEach(function (address) {
          let label =
            typeof address === "object" ? address.label || "HOME" : "HOME";
          let email = typeof address === "object" ? address.email : address;
          // label = label.toUpperCase();

          if (majorVersion >= 4) {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";type=" +
              label +
              ":" +
              e(email) +
              nl();
          } else if (majorVersion >= 3 && majorVersion < 4) {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";type=" +
              label +
              ",INTERNET:" +
              e(email) +
              nl();
          } else {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";" +
              label +
              ";INTERNET:" +
              e(email) +
              nl();
          }
        });
      }

      if (vCard.workEmail) {
        if (!Array.isArray(vCard.workEmail)) {
          vCard.workEmail = [vCard.workEmail];
        }
        vCard.workEmail.forEach(function (address) {
          let label =
            typeof address === "object" ? address.label || "WORK" : "WORK";
          let email = typeof address === "object" ? address.email : address;
          // label = label.toUpperCase();

          if (majorVersion >= 4) {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";type=" +
              label +
              ":" +
              e(email) +
              nl();
          } else if (majorVersion >= 3 && majorVersion < 4) {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";type=" +
              label +
              ":" +
              e(email) +
              nl();
          } else {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";" +
              label +
              ";INTERNET:" +
              e(email) +
              nl();
          }
        });
      }

      if (vCard.otherEmail) {
        if (!Array.isArray(vCard.otherEmail)) {
          vCard.otherEmail = [vCard.otherEmail];
        }
        vCard.otherEmail.forEach(function (address) {
          let label =
            typeof address === "object" ? address.label || "OTHER" : "OTHER";
          let email = typeof address === "object" ? address.email : address;
          // label = label.toUpperCase();

          if (majorVersion >= 4) {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";type=" +
              label +
              ":" +
              e(email) +
              nl();
          } else if (majorVersion >= 3 && majorVersion < 4) {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";type=" +
              label +
              ",INTERNET:" +
              e(email) +
              nl();
          } else {
            formattedVCardString +=
              "EMAIL" +
              encodingPrefix +
              ";" +
              label +
              ";INTERNET:" +
              e(email) +
              nl();
          }
        });
      }

      if (vCard.logo.url) {
        formattedVCardString += getFormattedPhoto(
          "LOGO",
          vCard.logo.url,
          vCard.logo.mediaType,
          vCard.logo.base64
        );
      }

      if (vCard.photo.url) {
        formattedVCardString += getFormattedPhoto(
          "PHOTO",
          vCard.photo.url,
          vCard.photo.mediaType,
          vCard.photo.base64
        );
      }

      if (vCard.cellPhone) {
        if (!Array.isArray(vCard.cellPhone)) {
          vCard.cellPhone = [vCard.cellPhone];
        }
        vCard.cellPhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,cell":tel:' + e(number) + nl();
          } else {
            formattedVCardString += "TEL;TYPE=CELL:" + e(number) + nl();
          }
        });
      }

      if (vCard.pagerPhone) {
        if (!Array.isArray(vCard.pagerPhone)) {
          vCard.pagerPhone = [vCard.pagerPhone];
        }
        vCard.pagerPhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="pager,cell":tel:' + e(number) + nl();
          } else {
            formattedVCardString += "TEL;TYPE=PAGER:" + e(number) + nl();
          }
        });
      }

      if (vCard.homePhone) {
        if (!Array.isArray(vCard.homePhone)) {
          vCard.homePhone = [vCard.homePhone];
        }
        vCard.homePhone.forEach(function (phone) {
          let label =
            typeof phone === "object" ? phone.label || "home" : "home";
          let number = typeof phone === "object" ? phone.number : phone;

          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,' +
              label +
              '":tel:' +
              e(number) +
              nl();
          } else {
            // label = label.toUpperCase();
            formattedVCardString +=
              "TEL;TYPE=" + label + ",VOICE:" + e(number) + nl();
          }
        });
      }

      if (vCard.workPhone) {
        if (!Array.isArray(vCard.workPhone)) {
          vCard.workPhone = [vCard.workPhone];
        }
        vCard.workPhone.forEach(function (phone) {
          let label =
            typeof phone === "object" ? phone.label || "work" : "work";

          let number = typeof phone === "object" ? phone.number : phone;

          if (majorVersion > 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,' +
              label +
              '":tel:' +
              e(number) +
              nl();
          } else {
            // label = label.toUpperCase();
            formattedVCardString +=
              "TEL;TYPE=" + label + ",VOICE:" + e(number) + nl();
          }
        });
      }

      if (vCard.homeFax) {
        if (!Array.isArray(vCard.homeFax)) {
          vCard.homeFax = [vCard.homeFax];
        }
        vCard.homeFax.forEach(function (fax) {
          let label = typeof fax === "object" ? fax.label || "home" : "home";
          let number = typeof fax === "object" ? fax.number : fax;

          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="fax,' + label + ":tel:" + e(number) + nl();
          } else {
            // label = label.toUpperCase();
            formattedVCardString +=
              "TEL;TYPE=" + label + ",FAX:" + e(number) + nl();
          }
        });
      }

      if (vCard.workFax) {
        if (!Array.isArray(vCard.workFax)) {
          vCard.workFax = [vCard.workFax];
        }
        vCard.workFax.forEach(function (fax) {
          let label = typeof fax === "object" ? fax.label || "work" : "work";
          let number = typeof fax === "object" ? fax.number : fax;

          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="fax,' + label + '":tel:' + e(number) + nl();
          } else {
            // label = label.toUpperCase();
            formattedVCardString +=
              "TEL;TYPE=" + label + ",FAX:" + e(number) + nl();
          }
        });
      }

      if (vCard.otherPhone) {
        if (!Array.isArray(vCard.otherPhone)) {
          vCard.otherPhone = [vCard.otherPhone];
        }
        vCard.otherPhone.forEach(function (phone) {
          let label =
            typeof phone === "object" ? phone.label || "OTHER" : "OTHER";

          let number = typeof phone === "object" ? phone.number : phone;

          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,' +
              label +
              '":tel:' +
              e(number) +
              nl();
          } else {
            // label = label.toUpperCase();
            formattedVCardString +=
              "TEL;TYPE=" + label + ":" + e(number) + nl();
          }
        });
      }

      [
        {
          details: vCard.homeAddress,
          type: "HOME",
        },
        {
          details: vCard.workAddress,
          type: "WORK",
        },
      ].forEach(function (address) {
        formattedVCardString += getFormattedAddress(encodingPrefix, address);
      });

      if (
        vCard.otherAddresses &&
        Array.isArray(vCard.otherAddresses) &&
        vCard.otherAddresses.length
      ) {
        vCard.otherAddresses.forEach(function (address) {
          let type = address.type || "OTHER";
          // type = type.toUpperCase();
          formattedVCardString += getFormattedAddress(encodingPrefix, {
            details: address,
            type,
          });
        });
      }

      if (vCard.title) {
        formattedVCardString +=
          "TITLE" + encodingPrefix + ":" + e(vCard.title) + nl();
      }

      if (vCard.role) {
        formattedVCardString +=
          "ROLE" + encodingPrefix + ":" + e(vCard.role) + nl();
      }

      if (vCard.organization) {
        formattedVCardString +=
          "ORG" + encodingPrefix + ":" + e(vCard.organization) + nl();
      }

      /*
      if (vCard.url) {
        formattedVCardString += "URL;TYPE=website" + ":" + e(vCard.url) + nl();
      }
      */

      if (vCard.url) {
        if (!Array.isArray(vCard.url)) {
          vCard.url = [vCard.url];
        }
        vCard.url.forEach(function (web, i) {
          let label =
            typeof web === "object" ? web.label || "website" : "website";
          let url = typeof web === "object" ? web.url : web;

          formattedVCardString +=
            "URL;type=" + label + encodingPrefix + ":" + e(url) + nl();
        });
      }

      /*
      if (vCard.workUrl) {
        formattedVCardString +=
          "URL;type=WORK" + encodingPrefix + ":" + e(vCard.workUrl) + nl();
      }
      */

      if (vCard.workUrl) {
        if (!Array.isArray(vCard.workUrl)) {
          vCard.workUrl = [vCard.workUrl];
        }
        vCard.workUrl.forEach(function (web) {
          let label = typeof web === "object" ? web.label || "WORK" : "WORK";
          let url = typeof web === "object" ? web.url : web;

          formattedVCardString +=
            "URL;type=" + label + encodingPrefix + ":" + e(url) + nl();
        });
      }

      if (vCard.note) {
        formattedVCardString +=
          "NOTE" + encodingPrefix + ":" + e(vCard.note) + nl();
      }

      if (vCard.socialUrls) {
        for (let [key, data] of Object.entries(vCard.socialUrls)) {
          if ((!Array.isArray(data) && !data) || !data.length) continue;

          if (!Array.isArray(data)) {
            data = [data];
          }
          data.forEach(function (url) {
            formattedVCardString +=
              "URL" + ";TYPE=" + key + ":" + e(url) + nl();
          });
        }
      }

      if (vCard.source) {
        formattedVCardString +=
          "SOURCE" + encodingPrefix + ":" + e(vCard.source) + nl();
      }

      formattedVCardString += "REV:" + new Date().toISOString() + nl();

      if (vCard.isOrganization) {
        formattedVCardString += "X-ABShowAs:COMPANY" + nl();
      }

      formattedVCardString += "END:VCARD" + nl();
      return formattedVCardString;
    },
  };
})();
