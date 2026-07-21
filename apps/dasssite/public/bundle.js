var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/qrcode-generator/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode-generator/qrcode.js"(exports, module) {
    var qrcode2 = (function() {
      var qrcode3 = function(typeNumber, errorCorrectionLevel) {
        var PAD0 = 236;
        var PAD1 = 17;
        var _typeNumber = typeNumber;
        var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
        var _modules = null;
        var _moduleCount = 0;
        var _dataCache = null;
        var _dataList = [];
        var _this = {};
        var makeImpl = function(test, maskPattern) {
          _moduleCount = _typeNumber * 4 + 17;
          _modules = (function(moduleCount) {
            var modules = new Array(moduleCount);
            for (var row = 0; row < moduleCount; row += 1) {
              modules[row] = new Array(moduleCount);
              for (var col = 0; col < moduleCount; col += 1) {
                modules[row][col] = null;
              }
            }
            return modules;
          })(_moduleCount);
          setupPositionProbePattern(0, 0);
          setupPositionProbePattern(_moduleCount - 7, 0);
          setupPositionProbePattern(0, _moduleCount - 7);
          setupPositionAdjustPattern();
          setupTimingPattern();
          setupTypeInfo(test, maskPattern);
          if (_typeNumber >= 7) {
            setupTypeNumber(test);
          }
          if (_dataCache == null) {
            _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
          }
          mapData(_dataCache, maskPattern);
        };
        var setupPositionProbePattern = function(row, col) {
          for (var r = -1; r <= 7; r += 1) {
            if (row + r <= -1 || _moduleCount <= row + r) continue;
            for (var c = -1; c <= 7; c += 1) {
              if (col + c <= -1 || _moduleCount <= col + c) continue;
              if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        };
        var getBestMaskPattern = function() {
          var minLostPoint = 0;
          var pattern = 0;
          for (var i = 0; i < 8; i += 1) {
            makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(_this);
            if (i == 0 || minLostPoint > lostPoint) {
              minLostPoint = lostPoint;
              pattern = i;
            }
          }
          return pattern;
        };
        var setupTimingPattern = function() {
          for (var r = 8; r < _moduleCount - 8; r += 1) {
            if (_modules[r][6] != null) {
              continue;
            }
            _modules[r][6] = r % 2 == 0;
          }
          for (var c = 8; c < _moduleCount - 8; c += 1) {
            if (_modules[6][c] != null) {
              continue;
            }
            _modules[6][c] = c % 2 == 0;
          }
        };
        var setupPositionAdjustPattern = function() {
          var pos = QRUtil.getPatternPosition(_typeNumber);
          for (var i = 0; i < pos.length; i += 1) {
            for (var j = 0; j < pos.length; j += 1) {
              var row = pos[i];
              var col = pos[j];
              if (_modules[row][col] != null) {
                continue;
              }
              for (var r = -2; r <= 2; r += 1) {
                for (var c = -2; c <= 2; c += 1) {
                  if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                    _modules[row + r][col + c] = true;
                  } else {
                    _modules[row + r][col + c] = false;
                  }
                }
              }
            }
          }
        };
        var setupTypeNumber = function(test) {
          var bits = QRUtil.getBCHTypeNumber(_typeNumber);
          for (var i = 0; i < 18; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
          }
          for (var i = 0; i < 18; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
          }
        };
        var setupTypeInfo = function(test, maskPattern) {
          var data = _errorCorrectionLevel << 3 | maskPattern;
          var bits = QRUtil.getBCHTypeInfo(data);
          for (var i = 0; i < 15; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            if (i < 6) {
              _modules[i][8] = mod;
            } else if (i < 8) {
              _modules[i + 1][8] = mod;
            } else {
              _modules[_moduleCount - 15 + i][8] = mod;
            }
          }
          for (var i = 0; i < 15; i += 1) {
            var mod = !test && (bits >> i & 1) == 1;
            if (i < 8) {
              _modules[8][_moduleCount - i - 1] = mod;
            } else if (i < 9) {
              _modules[8][15 - i - 1 + 1] = mod;
            } else {
              _modules[8][15 - i - 1] = mod;
            }
          }
          _modules[_moduleCount - 8][8] = !test;
        };
        var mapData = function(data, maskPattern) {
          var inc = -1;
          var row = _moduleCount - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          var maskFunc = QRUtil.getMaskFunction(maskPattern);
          for (var col = _moduleCount - 1; col > 0; col -= 2) {
            if (col == 6) col -= 1;
            while (true) {
              for (var c = 0; c < 2; c += 1) {
                if (_modules[row][col - c] == null) {
                  var dark = false;
                  if (byteIndex < data.length) {
                    dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                  }
                  var mask = maskFunc(row, col - c);
                  if (mask) {
                    dark = !dark;
                  }
                  _modules[row][col - c] = dark;
                  bitIndex -= 1;
                  if (bitIndex == -1) {
                    byteIndex += 1;
                    bitIndex = 7;
                  }
                }
              }
              row += inc;
              if (row < 0 || _moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        };
        var createBytes = function(buffer, rsBlocks) {
          var offset = 0;
          var maxDcCount = 0;
          var maxEcCount = 0;
          var dcdata = new Array(rsBlocks.length);
          var ecdata = new Array(rsBlocks.length);
          for (var r = 0; r < rsBlocks.length; r += 1) {
            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i = 0; i < dcdata[r].length; i += 1) {
              dcdata[r][i] = 255 & buffer.getBuffer()[i + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i += 1) {
              var modIndex = i + modPoly.getLength() - ecdata[r].length;
              ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
          }
          var totalCodeCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalCodeCount += rsBlocks[i].totalCount;
          }
          var data = new Array(totalCodeCount);
          var index = 0;
          for (var i = 0; i < maxDcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < dcdata[r].length) {
                data[index] = dcdata[r][i];
                index += 1;
              }
            }
          }
          for (var i = 0; i < maxEcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < ecdata[r].length) {
                data[index] = ecdata[r][i];
                index += 1;
              }
            }
          }
          return data;
        };
        var createData = function(typeNumber2, errorCorrectionLevel2, dataList) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, errorCorrectionLevel2);
          var buffer = qrBitBuffer();
          for (var i = 0; i < dataList.length; i += 1) {
            var data = dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
            data.write(buffer);
          }
          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalDataCount += rsBlocks[i].dataCount;
          }
          if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
          }
          if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
          }
          while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
          }
          while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD1, 8);
          }
          return createBytes(buffer, rsBlocks);
        };
        _this.addData = function(data, mode) {
          mode = mode || "Byte";
          var newData = null;
          switch (mode) {
            case "Numeric":
              newData = qrNumber(data);
              break;
            case "Alphanumeric":
              newData = qrAlphaNum(data);
              break;
            case "Byte":
              newData = qr8BitByte(data);
              break;
            case "Kanji":
              newData = qrKanji(data);
              break;
            default:
              throw "mode:" + mode;
          }
          _dataList.push(newData);
          _dataCache = null;
        };
        _this.isDark = function(row, col) {
          if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
            throw row + "," + col;
          }
          return _modules[row][col];
        };
        _this.getModuleCount = function() {
          return _moduleCount;
        };
        _this.make = function() {
          if (_typeNumber < 1) {
            var typeNumber2 = 1;
            for (; typeNumber2 < 40; typeNumber2++) {
              var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, _errorCorrectionLevel);
              var buffer = qrBitBuffer();
              for (var i = 0; i < _dataList.length; i++) {
                var data = _dataList[i];
                buffer.put(data.getMode(), 4);
                buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
                data.write(buffer);
              }
              var totalDataCount = 0;
              for (var i = 0; i < rsBlocks.length; i++) {
                totalDataCount += rsBlocks[i].dataCount;
              }
              if (buffer.getLengthInBits() <= totalDataCount * 8) {
                break;
              }
            }
            _typeNumber = typeNumber2;
          }
          makeImpl(false, getBestMaskPattern());
        };
        _this.createTableTag = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var qrHtml = "";
          qrHtml += '<table style="';
          qrHtml += " border-width: 0px; border-style: none;";
          qrHtml += " border-collapse: collapse;";
          qrHtml += " padding: 0px; margin: " + margin + "px;";
          qrHtml += '">';
          qrHtml += "<tbody>";
          for (var r = 0; r < _this.getModuleCount(); r += 1) {
            qrHtml += "<tr>";
            for (var c = 0; c < _this.getModuleCount(); c += 1) {
              qrHtml += '<td style="';
              qrHtml += " border-width: 0px; border-style: none;";
              qrHtml += " border-collapse: collapse;";
              qrHtml += " padding: 0px; margin: 0px;";
              qrHtml += " width: " + cellSize + "px;";
              qrHtml += " height: " + cellSize + "px;";
              qrHtml += " background-color: ";
              qrHtml += _this.isDark(r, c) ? "#000000" : "#ffffff";
              qrHtml += ";";
              qrHtml += '"/>';
            }
            qrHtml += "</tr>";
          }
          qrHtml += "</tbody>";
          qrHtml += "</table>";
          return qrHtml;
        };
        _this.createSvgTag = function(cellSize, margin, alt, title) {
          var opts = {};
          if (typeof arguments[0] == "object") {
            opts = arguments[0];
            cellSize = opts.cellSize;
            margin = opts.margin;
            alt = opts.alt;
            title = opts.title;
          }
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          alt = typeof alt === "string" ? { text: alt } : alt || {};
          alt.text = alt.text || null;
          alt.id = alt.text ? alt.id || "qrcode-description" : null;
          title = typeof title === "string" ? { text: title } : title || {};
          title.text = title.text || null;
          title.id = title.text ? title.id || "qrcode-title" : null;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var c, mc, r, mr, qrSvg2 = "", rect2;
          rect2 = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";
          qrSvg2 += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
          qrSvg2 += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : "";
          qrSvg2 += ' viewBox="0 0 ' + size + " " + size + '" ';
          qrSvg2 += ' preserveAspectRatio="xMinYMin meet"';
          qrSvg2 += title.text || alt.text ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(" ").trim()) + '"' : "";
          qrSvg2 += ">";
          qrSvg2 += title.text ? '<title id="' + escapeXml(title.id) + '">' + escapeXml(title.text) + "</title>" : "";
          qrSvg2 += alt.text ? '<description id="' + escapeXml(alt.id) + '">' + escapeXml(alt.text) + "</description>" : "";
          qrSvg2 += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
          qrSvg2 += '<path d="';
          for (r = 0; r < _this.getModuleCount(); r += 1) {
            mr = r * cellSize + margin;
            for (c = 0; c < _this.getModuleCount(); c += 1) {
              if (_this.isDark(r, c)) {
                mc = c * cellSize + margin;
                qrSvg2 += "M" + mc + "," + mr + rect2;
              }
            }
          }
          qrSvg2 += '" stroke="transparent" fill="black"/>';
          qrSvg2 += "</svg>";
          return qrSvg2;
        };
        _this.createDataURL = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          return createDataURL(size, size, function(x, y) {
            if (min <= x && x < max && min <= y && y < max) {
              var c = Math.floor((x - min) / cellSize);
              var r = Math.floor((y - min) / cellSize);
              return _this.isDark(r, c) ? 0 : 1;
            } else {
              return 1;
            }
          });
        };
        _this.createImgTag = function(cellSize, margin, alt) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var img = "";
          img += "<img";
          img += ' src="';
          img += _this.createDataURL(cellSize, margin);
          img += '"';
          img += ' width="';
          img += size;
          img += '"';
          img += ' height="';
          img += size;
          img += '"';
          if (alt) {
            img += ' alt="';
            img += escapeXml(alt);
            img += '"';
          }
          img += "/>";
          return img;
        };
        var escapeXml = function(s) {
          var escaped = "";
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charAt(i);
            switch (c) {
              case "<":
                escaped += "&lt;";
                break;
              case ">":
                escaped += "&gt;";
                break;
              case "&":
                escaped += "&amp;";
                break;
              case '"':
                escaped += "&quot;";
                break;
              default:
                escaped += c;
                break;
            }
          }
          return escaped;
        };
        var _createHalfASCII = function(margin) {
          var cellSize = 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          var y, x, r1, r2, p;
          var blocks = {
            "██": "█",
            "█ ": "▀",
            " █": "▄",
            "  ": " "
          };
          var blocksLastLineNoMargin = {
            "██": "▀",
            "█ ": "▀",
            " █": " ",
            "  ": " "
          };
          var ascii = "";
          for (y = 0; y < size; y += 2) {
            r1 = Math.floor((y - min) / cellSize);
            r2 = Math.floor((y + 1 - min) / cellSize);
            for (x = 0; x < size; x += 1) {
              p = "█";
              if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
                p = " ";
              }
              if (min <= x && x < max && min <= y + 1 && y + 1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
                p += " ";
              } else {
                p += "█";
              }
              ascii += margin < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
            }
            ascii += "\n";
          }
          if (size % 2 && margin > 0) {
            return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("▀");
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.createASCII = function(cellSize, margin) {
          cellSize = cellSize || 1;
          if (cellSize < 2) {
            return _createHalfASCII(margin);
          }
          cellSize -= 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;
          var y, x, r, p;
          var white = Array(cellSize + 1).join("██");
          var black = Array(cellSize + 1).join("  ");
          var ascii = "";
          var line = "";
          for (y = 0; y < size; y += 1) {
            r = Math.floor((y - min) / cellSize);
            line = "";
            for (x = 0; x < size; x += 1) {
              p = 1;
              if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
                p = 0;
              }
              line += p ? white : black;
            }
            for (r = 0; r < cellSize; r += 1) {
              ascii += line + "\n";
            }
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.renderTo2dContext = function(context, cellSize) {
          cellSize = cellSize || 2;
          var length = _this.getModuleCount();
          for (var row = 0; row < length; row++) {
            for (var col = 0; col < length; col++) {
              context.fillStyle = _this.isDark(row, col) ? "black" : "white";
              context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
            }
          }
        };
        return _this;
      };
      qrcode3.stringToBytesFuncs = {
        "default": function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            bytes.push(c & 255);
          }
          return bytes;
        }
      };
      qrcode3.stringToBytes = qrcode3.stringToBytesFuncs["default"];
      qrcode3.createStringToBytes = function(unicodeData, numChars) {
        var unicodeMap = (function() {
          var bin = base64DecodeInputStream(unicodeData);
          var read = function() {
            var b = bin.read();
            if (b == -1) throw "eof";
            return b;
          };
          var count = 0;
          var unicodeMap2 = {};
          while (true) {
            var b0 = bin.read();
            if (b0 == -1) break;
            var b1 = read();
            var b2 = read();
            var b3 = read();
            var k = String.fromCharCode(b0 << 8 | b1);
            var v = b2 << 8 | b3;
            unicodeMap2[k] = v;
            count += 1;
          }
          if (count != numChars) {
            throw count + " != " + numChars;
          }
          return unicodeMap2;
        })();
        var unknownChar = "?".charCodeAt(0);
        return function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            if (c < 128) {
              bytes.push(c);
            } else {
              var b = unicodeMap[s.charAt(i)];
              if (typeof b == "number") {
                if ((b & 255) == b) {
                  bytes.push(b);
                } else {
                  bytes.push(b >>> 8);
                  bytes.push(b & 255);
                }
              } else {
                bytes.push(unknownChar);
              }
            }
          }
          return bytes;
        };
      };
      var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
      };
      var QRErrorCorrectionLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
      };
      var QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var QRUtil = (function() {
        var PATTERN_POSITION_TABLE = [
          [],
          [6, 18],
          [6, 22],
          [6, 26],
          [6, 30],
          [6, 34],
          [6, 22, 38],
          [6, 24, 42],
          [6, 26, 46],
          [6, 28, 50],
          [6, 30, 54],
          [6, 32, 58],
          [6, 34, 62],
          [6, 26, 46, 66],
          [6, 26, 48, 70],
          [6, 26, 50, 74],
          [6, 30, 54, 78],
          [6, 30, 56, 82],
          [6, 30, 58, 86],
          [6, 34, 62, 90],
          [6, 28, 50, 72, 94],
          [6, 26, 50, 74, 98],
          [6, 30, 54, 78, 102],
          [6, 28, 54, 80, 106],
          [6, 32, 58, 84, 110],
          [6, 30, 58, 86, 114],
          [6, 34, 62, 90, 118],
          [6, 26, 50, 74, 98, 122],
          [6, 30, 54, 78, 102, 126],
          [6, 26, 52, 78, 104, 130],
          [6, 30, 56, 82, 108, 134],
          [6, 34, 60, 86, 112, 138],
          [6, 30, 58, 86, 114, 142],
          [6, 34, 62, 90, 118, 146],
          [6, 30, 54, 78, 102, 126, 150],
          [6, 24, 50, 76, 102, 128, 154],
          [6, 28, 54, 80, 106, 132, 158],
          [6, 32, 58, 84, 110, 136, 162],
          [6, 26, 54, 82, 110, 138, 166],
          [6, 30, 58, 86, 114, 142, 170]
        ];
        var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
        var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
        var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
        var _this = {};
        var getBCHDigit = function(data) {
          var digit = 0;
          while (data != 0) {
            digit += 1;
            data >>>= 1;
          }
          return digit;
        };
        _this.getBCHTypeInfo = function(data) {
          var d = data << 10;
          while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
            d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
          }
          return (data << 10 | d) ^ G15_MASK;
        };
        _this.getBCHTypeNumber = function(data) {
          var d = data << 12;
          while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
            d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
          }
          return data << 12 | d;
        };
        _this.getPatternPosition = function(typeNumber) {
          return PATTERN_POSITION_TABLE[typeNumber - 1];
        };
        _this.getMaskFunction = function(maskPattern) {
          switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
              return function(i, j) {
                return (i + j) % 2 == 0;
              };
            case QRMaskPattern.PATTERN001:
              return function(i, j) {
                return i % 2 == 0;
              };
            case QRMaskPattern.PATTERN010:
              return function(i, j) {
                return j % 3 == 0;
              };
            case QRMaskPattern.PATTERN011:
              return function(i, j) {
                return (i + j) % 3 == 0;
              };
            case QRMaskPattern.PATTERN100:
              return function(i, j) {
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
              };
            case QRMaskPattern.PATTERN101:
              return function(i, j) {
                return i * j % 2 + i * j % 3 == 0;
              };
            case QRMaskPattern.PATTERN110:
              return function(i, j) {
                return (i * j % 2 + i * j % 3) % 2 == 0;
              };
            case QRMaskPattern.PATTERN111:
              return function(i, j) {
                return (i * j % 3 + (i + j) % 2) % 2 == 0;
              };
            default:
              throw "bad maskPattern:" + maskPattern;
          }
        };
        _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
          var a = qrPolynomial([1], 0);
          for (var i = 0; i < errorCorrectLength; i += 1) {
            a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
          }
          return a;
        };
        _this.getLengthInBits = function(mode, type) {
          if (1 <= type && type < 10) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 10;
              case QRMode.MODE_ALPHA_NUM:
                return 9;
              case QRMode.MODE_8BIT_BYTE:
                return 8;
              case QRMode.MODE_KANJI:
                return 8;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 27) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 12;
              case QRMode.MODE_ALPHA_NUM:
                return 11;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 10;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 41) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 14;
              case QRMode.MODE_ALPHA_NUM:
                return 13;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 12;
              default:
                throw "mode:" + mode;
            }
          } else {
            throw "type:" + type;
          }
        };
        _this.getLostPoint = function(qrcode4) {
          var moduleCount = qrcode4.getModuleCount();
          var lostPoint = 0;
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount; col += 1) {
              var sameCount = 0;
              var dark = qrcode4.isDark(row, col);
              for (var r = -1; r <= 1; r += 1) {
                if (row + r < 0 || moduleCount <= row + r) {
                  continue;
                }
                for (var c = -1; c <= 1; c += 1) {
                  if (col + c < 0 || moduleCount <= col + c) {
                    continue;
                  }
                  if (r == 0 && c == 0) {
                    continue;
                  }
                  if (dark == qrcode4.isDark(row + r, col + c)) {
                    sameCount += 1;
                  }
                }
              }
              if (sameCount > 5) {
                lostPoint += 3 + sameCount - 5;
              }
            }
          }
          ;
          for (var row = 0; row < moduleCount - 1; row += 1) {
            for (var col = 0; col < moduleCount - 1; col += 1) {
              var count = 0;
              if (qrcode4.isDark(row, col)) count += 1;
              if (qrcode4.isDark(row + 1, col)) count += 1;
              if (qrcode4.isDark(row, col + 1)) count += 1;
              if (qrcode4.isDark(row + 1, col + 1)) count += 1;
              if (count == 0 || count == 4) {
                lostPoint += 3;
              }
            }
          }
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount - 6; col += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row, col + 1) && qrcode4.isDark(row, col + 2) && qrcode4.isDark(row, col + 3) && qrcode4.isDark(row, col + 4) && !qrcode4.isDark(row, col + 5) && qrcode4.isDark(row, col + 6)) {
                lostPoint += 40;
              }
            }
          }
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount - 6; row += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row + 1, col) && qrcode4.isDark(row + 2, col) && qrcode4.isDark(row + 3, col) && qrcode4.isDark(row + 4, col) && !qrcode4.isDark(row + 5, col) && qrcode4.isDark(row + 6, col)) {
                lostPoint += 40;
              }
            }
          }
          var darkCount = 0;
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount; row += 1) {
              if (qrcode4.isDark(row, col)) {
                darkCount += 1;
              }
            }
          }
          var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
          lostPoint += ratio * 10;
          return lostPoint;
        };
        return _this;
      })();
      var QRMath = (function() {
        var EXP_TABLE = new Array(256);
        var LOG_TABLE = new Array(256);
        for (var i = 0; i < 8; i += 1) {
          EXP_TABLE[i] = 1 << i;
        }
        for (var i = 8; i < 256; i += 1) {
          EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
        }
        for (var i = 0; i < 255; i += 1) {
          LOG_TABLE[EXP_TABLE[i]] = i;
        }
        var _this = {};
        _this.glog = function(n) {
          if (n < 1) {
            throw "glog(" + n + ")";
          }
          return LOG_TABLE[n];
        };
        _this.gexp = function(n) {
          while (n < 0) {
            n += 255;
          }
          while (n >= 256) {
            n -= 255;
          }
          return EXP_TABLE[n];
        };
        return _this;
      })();
      function qrPolynomial(num, shift) {
        if (typeof num.length == "undefined") {
          throw num.length + "/" + shift;
        }
        var _num = (function() {
          var offset = 0;
          while (offset < num.length && num[offset] == 0) {
            offset += 1;
          }
          var _num2 = new Array(num.length - offset + shift);
          for (var i = 0; i < num.length - offset; i += 1) {
            _num2[i] = num[i + offset];
          }
          return _num2;
        })();
        var _this = {};
        _this.getAt = function(index) {
          return _num[index];
        };
        _this.getLength = function() {
          return _num.length;
        };
        _this.multiply = function(e) {
          var num2 = new Array(_this.getLength() + e.getLength() - 1);
          for (var i = 0; i < _this.getLength(); i += 1) {
            for (var j = 0; j < e.getLength(); j += 1) {
              num2[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
            }
          }
          return qrPolynomial(num2, 0);
        };
        _this.mod = function(e) {
          if (_this.getLength() - e.getLength() < 0) {
            return _this;
          }
          var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));
          var num2 = new Array(_this.getLength());
          for (var i = 0; i < _this.getLength(); i += 1) {
            num2[i] = _this.getAt(i);
          }
          for (var i = 0; i < e.getLength(); i += 1) {
            num2[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
          }
          return qrPolynomial(num2, 0).mod(e);
        };
        return _this;
      }
      ;
      var QRRSBlock = (function() {
        var RS_BLOCK_TABLE = [
          // L
          // M
          // Q
          // H
          // 1
          [1, 26, 19],
          [1, 26, 16],
          [1, 26, 13],
          [1, 26, 9],
          // 2
          [1, 44, 34],
          [1, 44, 28],
          [1, 44, 22],
          [1, 44, 16],
          // 3
          [1, 70, 55],
          [1, 70, 44],
          [2, 35, 17],
          [2, 35, 13],
          // 4
          [1, 100, 80],
          [2, 50, 32],
          [2, 50, 24],
          [4, 25, 9],
          // 5
          [1, 134, 108],
          [2, 67, 43],
          [2, 33, 15, 2, 34, 16],
          [2, 33, 11, 2, 34, 12],
          // 6
          [2, 86, 68],
          [4, 43, 27],
          [4, 43, 19],
          [4, 43, 15],
          // 7
          [2, 98, 78],
          [4, 49, 31],
          [2, 32, 14, 4, 33, 15],
          [4, 39, 13, 1, 40, 14],
          // 8
          [2, 121, 97],
          [2, 60, 38, 2, 61, 39],
          [4, 40, 18, 2, 41, 19],
          [4, 40, 14, 2, 41, 15],
          // 9
          [2, 146, 116],
          [3, 58, 36, 2, 59, 37],
          [4, 36, 16, 4, 37, 17],
          [4, 36, 12, 4, 37, 13],
          // 10
          [2, 86, 68, 2, 87, 69],
          [4, 69, 43, 1, 70, 44],
          [6, 43, 19, 2, 44, 20],
          [6, 43, 15, 2, 44, 16],
          // 11
          [4, 101, 81],
          [1, 80, 50, 4, 81, 51],
          [4, 50, 22, 4, 51, 23],
          [3, 36, 12, 8, 37, 13],
          // 12
          [2, 116, 92, 2, 117, 93],
          [6, 58, 36, 2, 59, 37],
          [4, 46, 20, 6, 47, 21],
          [7, 42, 14, 4, 43, 15],
          // 13
          [4, 133, 107],
          [8, 59, 37, 1, 60, 38],
          [8, 44, 20, 4, 45, 21],
          [12, 33, 11, 4, 34, 12],
          // 14
          [3, 145, 115, 1, 146, 116],
          [4, 64, 40, 5, 65, 41],
          [11, 36, 16, 5, 37, 17],
          [11, 36, 12, 5, 37, 13],
          // 15
          [5, 109, 87, 1, 110, 88],
          [5, 65, 41, 5, 66, 42],
          [5, 54, 24, 7, 55, 25],
          [11, 36, 12, 7, 37, 13],
          // 16
          [5, 122, 98, 1, 123, 99],
          [7, 73, 45, 3, 74, 46],
          [15, 43, 19, 2, 44, 20],
          [3, 45, 15, 13, 46, 16],
          // 17
          [1, 135, 107, 5, 136, 108],
          [10, 74, 46, 1, 75, 47],
          [1, 50, 22, 15, 51, 23],
          [2, 42, 14, 17, 43, 15],
          // 18
          [5, 150, 120, 1, 151, 121],
          [9, 69, 43, 4, 70, 44],
          [17, 50, 22, 1, 51, 23],
          [2, 42, 14, 19, 43, 15],
          // 19
          [3, 141, 113, 4, 142, 114],
          [3, 70, 44, 11, 71, 45],
          [17, 47, 21, 4, 48, 22],
          [9, 39, 13, 16, 40, 14],
          // 20
          [3, 135, 107, 5, 136, 108],
          [3, 67, 41, 13, 68, 42],
          [15, 54, 24, 5, 55, 25],
          [15, 43, 15, 10, 44, 16],
          // 21
          [4, 144, 116, 4, 145, 117],
          [17, 68, 42],
          [17, 50, 22, 6, 51, 23],
          [19, 46, 16, 6, 47, 17],
          // 22
          [2, 139, 111, 7, 140, 112],
          [17, 74, 46],
          [7, 54, 24, 16, 55, 25],
          [34, 37, 13],
          // 23
          [4, 151, 121, 5, 152, 122],
          [4, 75, 47, 14, 76, 48],
          [11, 54, 24, 14, 55, 25],
          [16, 45, 15, 14, 46, 16],
          // 24
          [6, 147, 117, 4, 148, 118],
          [6, 73, 45, 14, 74, 46],
          [11, 54, 24, 16, 55, 25],
          [30, 46, 16, 2, 47, 17],
          // 25
          [8, 132, 106, 4, 133, 107],
          [8, 75, 47, 13, 76, 48],
          [7, 54, 24, 22, 55, 25],
          [22, 45, 15, 13, 46, 16],
          // 26
          [10, 142, 114, 2, 143, 115],
          [19, 74, 46, 4, 75, 47],
          [28, 50, 22, 6, 51, 23],
          [33, 46, 16, 4, 47, 17],
          // 27
          [8, 152, 122, 4, 153, 123],
          [22, 73, 45, 3, 74, 46],
          [8, 53, 23, 26, 54, 24],
          [12, 45, 15, 28, 46, 16],
          // 28
          [3, 147, 117, 10, 148, 118],
          [3, 73, 45, 23, 74, 46],
          [4, 54, 24, 31, 55, 25],
          [11, 45, 15, 31, 46, 16],
          // 29
          [7, 146, 116, 7, 147, 117],
          [21, 73, 45, 7, 74, 46],
          [1, 53, 23, 37, 54, 24],
          [19, 45, 15, 26, 46, 16],
          // 30
          [5, 145, 115, 10, 146, 116],
          [19, 75, 47, 10, 76, 48],
          [15, 54, 24, 25, 55, 25],
          [23, 45, 15, 25, 46, 16],
          // 31
          [13, 145, 115, 3, 146, 116],
          [2, 74, 46, 29, 75, 47],
          [42, 54, 24, 1, 55, 25],
          [23, 45, 15, 28, 46, 16],
          // 32
          [17, 145, 115],
          [10, 74, 46, 23, 75, 47],
          [10, 54, 24, 35, 55, 25],
          [19, 45, 15, 35, 46, 16],
          // 33
          [17, 145, 115, 1, 146, 116],
          [14, 74, 46, 21, 75, 47],
          [29, 54, 24, 19, 55, 25],
          [11, 45, 15, 46, 46, 16],
          // 34
          [13, 145, 115, 6, 146, 116],
          [14, 74, 46, 23, 75, 47],
          [44, 54, 24, 7, 55, 25],
          [59, 46, 16, 1, 47, 17],
          // 35
          [12, 151, 121, 7, 152, 122],
          [12, 75, 47, 26, 76, 48],
          [39, 54, 24, 14, 55, 25],
          [22, 45, 15, 41, 46, 16],
          // 36
          [6, 151, 121, 14, 152, 122],
          [6, 75, 47, 34, 76, 48],
          [46, 54, 24, 10, 55, 25],
          [2, 45, 15, 64, 46, 16],
          // 37
          [17, 152, 122, 4, 153, 123],
          [29, 74, 46, 14, 75, 47],
          [49, 54, 24, 10, 55, 25],
          [24, 45, 15, 46, 46, 16],
          // 38
          [4, 152, 122, 18, 153, 123],
          [13, 74, 46, 32, 75, 47],
          [48, 54, 24, 14, 55, 25],
          [42, 45, 15, 32, 46, 16],
          // 39
          [20, 147, 117, 4, 148, 118],
          [40, 75, 47, 7, 76, 48],
          [43, 54, 24, 22, 55, 25],
          [10, 45, 15, 67, 46, 16],
          // 40
          [19, 148, 118, 6, 149, 119],
          [18, 75, 47, 31, 76, 48],
          [34, 54, 24, 34, 55, 25],
          [20, 45, 15, 61, 46, 16]
        ];
        var qrRSBlock = function(totalCount, dataCount) {
          var _this2 = {};
          _this2.totalCount = totalCount;
          _this2.dataCount = dataCount;
          return _this2;
        };
        var _this = {};
        var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case QRErrorCorrectionLevel.L:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectionLevel.M:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectionLevel.Q:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectionLevel.H:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
              return void 0;
          }
        };
        _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {
          var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
          if (typeof rsBlock == "undefined") {
            throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel;
          }
          var length = rsBlock.length / 3;
          var list = [];
          for (var i = 0; i < length; i += 1) {
            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];
            for (var j = 0; j < count; j += 1) {
              list.push(qrRSBlock(totalCount, dataCount));
            }
          }
          return list;
        };
        return _this;
      })();
      var qrBitBuffer = function() {
        var _buffer = [];
        var _length = 0;
        var _this = {};
        _this.getBuffer = function() {
          return _buffer;
        };
        _this.getAt = function(index) {
          var bufIndex = Math.floor(index / 8);
          return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
        };
        _this.put = function(num, length) {
          for (var i = 0; i < length; i += 1) {
            _this.putBit((num >>> length - i - 1 & 1) == 1);
          }
        };
        _this.getLengthInBits = function() {
          return _length;
        };
        _this.putBit = function(bit) {
          var bufIndex = Math.floor(_length / 8);
          if (_buffer.length <= bufIndex) {
            _buffer.push(0);
          }
          if (bit) {
            _buffer[bufIndex] |= 128 >>> _length % 8;
          }
          _length += 1;
        };
        return _this;
      };
      var qrNumber = function(data) {
        var _mode = QRMode.MODE_NUMBER;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var data2 = _data;
          var i = 0;
          while (i + 2 < data2.length) {
            buffer.put(strToNum(data2.substring(i, i + 3)), 10);
            i += 3;
          }
          if (i < data2.length) {
            if (data2.length - i == 1) {
              buffer.put(strToNum(data2.substring(i, i + 1)), 4);
            } else if (data2.length - i == 2) {
              buffer.put(strToNum(data2.substring(i, i + 2)), 7);
            }
          }
        };
        var strToNum = function(s) {
          var num = 0;
          for (var i = 0; i < s.length; i += 1) {
            num = num * 10 + chatToNum(s.charAt(i));
          }
          return num;
        };
        var chatToNum = function(c) {
          if ("0" <= c && c <= "9") {
            return c.charCodeAt(0) - "0".charCodeAt(0);
          }
          throw "illegal char :" + c;
        };
        return _this;
      };
      var qrAlphaNum = function(data) {
        var _mode = QRMode.MODE_ALPHA_NUM;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var s = _data;
          var i = 0;
          while (i + 1 < s.length) {
            buffer.put(
              getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)),
              11
            );
            i += 2;
          }
          if (i < s.length) {
            buffer.put(getCode(s.charAt(i)), 6);
          }
        };
        var getCode = function(c) {
          if ("0" <= c && c <= "9") {
            return c.charCodeAt(0) - "0".charCodeAt(0);
          } else if ("A" <= c && c <= "Z") {
            return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
          } else {
            switch (c) {
              case " ":
                return 36;
              case "$":
                return 37;
              case "%":
                return 38;
              case "*":
                return 39;
              case "+":
                return 40;
              case "-":
                return 41;
              case ".":
                return 42;
              case "/":
                return 43;
              case ":":
                return 44;
              default:
                throw "illegal char :" + c;
            }
          }
        };
        return _this;
      };
      var qr8BitByte = function(data) {
        var _mode = QRMode.MODE_8BIT_BYTE;
        var _data = data;
        var _bytes = qrcode3.stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _bytes.length;
        };
        _this.write = function(buffer) {
          for (var i = 0; i < _bytes.length; i += 1) {
            buffer.put(_bytes[i], 8);
          }
        };
        return _this;
      };
      var qrKanji = function(data) {
        var _mode = QRMode.MODE_KANJI;
        var _data = data;
        var stringToBytes = qrcode3.stringToBytesFuncs["SJIS"];
        if (!stringToBytes) {
          throw "sjis not supported.";
        }
        !(function(c, code) {
          var test = stringToBytes(c);
          if (test.length != 2 || (test[0] << 8 | test[1]) != code) {
            throw "sjis not supported.";
          }
        })("友", 38726);
        var _bytes = stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return ~~(_bytes.length / 2);
        };
        _this.write = function(buffer) {
          var data2 = _bytes;
          var i = 0;
          while (i + 1 < data2.length) {
            var c = (255 & data2[i]) << 8 | 255 & data2[i + 1];
            if (33088 <= c && c <= 40956) {
              c -= 33088;
            } else if (57408 <= c && c <= 60351) {
              c -= 49472;
            } else {
              throw "illegal char at " + (i + 1) + "/" + c;
            }
            c = (c >>> 8 & 255) * 192 + (c & 255);
            buffer.put(c, 13);
            i += 2;
          }
          if (i < data2.length) {
            throw "illegal char at " + (i + 1);
          }
        };
        return _this;
      };
      var byteArrayOutputStream = function() {
        var _bytes = [];
        var _this = {};
        _this.writeByte = function(b) {
          _bytes.push(b & 255);
        };
        _this.writeShort = function(i) {
          _this.writeByte(i);
          _this.writeByte(i >>> 8);
        };
        _this.writeBytes = function(b, off, len) {
          off = off || 0;
          len = len || b.length;
          for (var i = 0; i < len; i += 1) {
            _this.writeByte(b[i + off]);
          }
        };
        _this.writeString = function(s) {
          for (var i = 0; i < s.length; i += 1) {
            _this.writeByte(s.charCodeAt(i));
          }
        };
        _this.toByteArray = function() {
          return _bytes;
        };
        _this.toString = function() {
          var s = "";
          s += "[";
          for (var i = 0; i < _bytes.length; i += 1) {
            if (i > 0) {
              s += ",";
            }
            s += _bytes[i];
          }
          s += "]";
          return s;
        };
        return _this;
      };
      var base64EncodeOutputStream = function() {
        var _buffer = 0;
        var _buflen = 0;
        var _length = 0;
        var _base64 = "";
        var _this = {};
        var writeEncoded = function(b) {
          _base64 += String.fromCharCode(encode(b & 63));
        };
        var encode = function(n) {
          if (n < 0) {
          } else if (n < 26) {
            return 65 + n;
          } else if (n < 52) {
            return 97 + (n - 26);
          } else if (n < 62) {
            return 48 + (n - 52);
          } else if (n == 62) {
            return 43;
          } else if (n == 63) {
            return 47;
          }
          throw "n:" + n;
        };
        _this.writeByte = function(n) {
          _buffer = _buffer << 8 | n & 255;
          _buflen += 8;
          _length += 1;
          while (_buflen >= 6) {
            writeEncoded(_buffer >>> _buflen - 6);
            _buflen -= 6;
          }
        };
        _this.flush = function() {
          if (_buflen > 0) {
            writeEncoded(_buffer << 6 - _buflen);
            _buffer = 0;
            _buflen = 0;
          }
          if (_length % 3 != 0) {
            var padlen = 3 - _length % 3;
            for (var i = 0; i < padlen; i += 1) {
              _base64 += "=";
            }
          }
        };
        _this.toString = function() {
          return _base64;
        };
        return _this;
      };
      var base64DecodeInputStream = function(str) {
        var _str = str;
        var _pos = 0;
        var _buffer = 0;
        var _buflen = 0;
        var _this = {};
        _this.read = function() {
          while (_buflen < 8) {
            if (_pos >= _str.length) {
              if (_buflen == 0) {
                return -1;
              }
              throw "unexpected end of file./" + _buflen;
            }
            var c = _str.charAt(_pos);
            _pos += 1;
            if (c == "=") {
              _buflen = 0;
              return -1;
            } else if (c.match(/^\s$/)) {
              continue;
            }
            _buffer = _buffer << 6 | decode(c.charCodeAt(0));
            _buflen += 6;
          }
          var n = _buffer >>> _buflen - 8 & 255;
          _buflen -= 8;
          return n;
        };
        var decode = function(c) {
          if (65 <= c && c <= 90) {
            return c - 65;
          } else if (97 <= c && c <= 122) {
            return c - 97 + 26;
          } else if (48 <= c && c <= 57) {
            return c - 48 + 52;
          } else if (c == 43) {
            return 62;
          } else if (c == 47) {
            return 63;
          } else {
            throw "c:" + c;
          }
        };
        return _this;
      };
      var gifImage = function(width, height) {
        var _width = width;
        var _height = height;
        var _data = new Array(width * height);
        var _this = {};
        _this.setPixel = function(x, y, pixel) {
          _data[y * _width + x] = pixel;
        };
        _this.write = function(out) {
          out.writeString("GIF87a");
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(128);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(255);
          out.writeByte(255);
          out.writeByte(255);
          out.writeString(",");
          out.writeShort(0);
          out.writeShort(0);
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(0);
          var lzwMinCodeSize = 2;
          var raster = getLZWRaster(lzwMinCodeSize);
          out.writeByte(lzwMinCodeSize);
          var offset = 0;
          while (raster.length - offset > 255) {
            out.writeByte(255);
            out.writeBytes(raster, offset, 255);
            offset += 255;
          }
          out.writeByte(raster.length - offset);
          out.writeBytes(raster, offset, raster.length - offset);
          out.writeByte(0);
          out.writeString(";");
        };
        var bitOutputStream = function(out) {
          var _out = out;
          var _bitLength = 0;
          var _bitBuffer = 0;
          var _this2 = {};
          _this2.write = function(data, length) {
            if (data >>> length != 0) {
              throw "length over";
            }
            while (_bitLength + length >= 8) {
              _out.writeByte(255 & (data << _bitLength | _bitBuffer));
              length -= 8 - _bitLength;
              data >>>= 8 - _bitLength;
              _bitBuffer = 0;
              _bitLength = 0;
            }
            _bitBuffer = data << _bitLength | _bitBuffer;
            _bitLength = _bitLength + length;
          };
          _this2.flush = function() {
            if (_bitLength > 0) {
              _out.writeByte(_bitBuffer);
            }
          };
          return _this2;
        };
        var getLZWRaster = function(lzwMinCodeSize) {
          var clearCode = 1 << lzwMinCodeSize;
          var endCode = (1 << lzwMinCodeSize) + 1;
          var bitLength = lzwMinCodeSize + 1;
          var table = lzwTable();
          for (var i = 0; i < clearCode; i += 1) {
            table.add(String.fromCharCode(i));
          }
          table.add(String.fromCharCode(clearCode));
          table.add(String.fromCharCode(endCode));
          var byteOut = byteArrayOutputStream();
          var bitOut = bitOutputStream(byteOut);
          bitOut.write(clearCode, bitLength);
          var dataIndex = 0;
          var s = String.fromCharCode(_data[dataIndex]);
          dataIndex += 1;
          while (dataIndex < _data.length) {
            var c = String.fromCharCode(_data[dataIndex]);
            dataIndex += 1;
            if (table.contains(s + c)) {
              s = s + c;
            } else {
              bitOut.write(table.indexOf(s), bitLength);
              if (table.size() < 4095) {
                if (table.size() == 1 << bitLength) {
                  bitLength += 1;
                }
                table.add(s + c);
              }
              s = c;
            }
          }
          bitOut.write(table.indexOf(s), bitLength);
          bitOut.write(endCode, bitLength);
          bitOut.flush();
          return byteOut.toByteArray();
        };
        var lzwTable = function() {
          var _map = {};
          var _size = 0;
          var _this2 = {};
          _this2.add = function(key) {
            if (_this2.contains(key)) {
              throw "dup key:" + key;
            }
            _map[key] = _size;
            _size += 1;
          };
          _this2.size = function() {
            return _size;
          };
          _this2.indexOf = function(key) {
            return _map[key];
          };
          _this2.contains = function(key) {
            return typeof _map[key] != "undefined";
          };
          return _this2;
        };
        return _this;
      };
      var createDataURL = function(width, height, getPixel) {
        var gif = gifImage(width, height);
        for (var y = 0; y < height; y += 1) {
          for (var x = 0; x < width; x += 1) {
            gif.setPixel(x, y, getPixel(x, y));
          }
        }
        var b = byteArrayOutputStream();
        gif.write(b);
        var base64 = base64EncodeOutputStream();
        var bytes = b.toByteArray();
        for (var i = 0; i < bytes.length; i += 1) {
          base64.writeByte(bytes[i]);
        }
        base64.flush();
        return "data:image/gif;base64," + base64;
      };
      return qrcode3;
    })();
    !(function() {
      qrcode2.stringToBytesFuncs["UTF-8"] = function(s) {
        function toUTF8Array(str) {
          var utf8 = [];
          for (var i = 0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 128) utf8.push(charcode);
            else if (charcode < 2048) {
              utf8.push(
                192 | charcode >> 6,
                128 | charcode & 63
              );
            } else if (charcode < 55296 || charcode >= 57344) {
              utf8.push(
                224 | charcode >> 12,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            } else {
              i++;
              charcode = 65536 + ((charcode & 1023) << 10 | str.charCodeAt(i) & 1023);
              utf8.push(
                240 | charcode >> 18,
                128 | charcode >> 12 & 63,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            }
          }
          return utf8;
        }
        return toUTF8Array(s);
      };
    })();
    (function(factory) {
      if (typeof define === "function" && define.amd) {
        define([], factory);
      } else if (typeof exports === "object") {
        module.exports = factory();
      }
    })(function() {
      return qrcode2;
    });
  }
});

// packages/dass-ui/src/dom.ts
var qs = (sel, root = document) => root.querySelector(sel);
var qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function addStyle(css) {
  const s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
  return s;
}

// packages/dass-ui/src/motion.ts
var M = {
  // durations (ms), layered per the brief
  instant: 110,
  micro: 190,
  comp: 340,
  scene: 680,
  cine: 1600,
  // easing curves (original, consistent)
  out: "cubic-bezier(.2,.85,.25,1)",
  inOut: "cubic-bezier(.65,0,.35,1)",
  sharp: "cubic-bezier(.9,.03,.2,1)",
  // ضربة
  pull: "cubic-bezier(.16,1,.3,1)",
  // كشف
  spring: "cubic-bezier(.34,1.56,.64,1)"
  // RESERVED: reveal + win
};
var reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function anim(node, frames, opts) {
  if (reduced()) {
    return node.animate({ opacity: [1e-3, 1] }, {
      duration: 1,
      fill: "both"
    });
  }
  return node.animate(frames, { fill: "both", ...opts });
}
function press(node) {
  return anim(node, { transform: ["scale(1)", "scale(.955)", "scale(1)"] }, { duration: M.instant, easing: M.out });
}

// packages/dass-ui/src/tokens.ts
var baseCss = `
:root{
  /* ground & surfaces (warm-cool near-black, layered depth) */
  --bg:#08070C; --bg-1:#0D0A13; --bg-2:#120E1B;
  --surface:#171122; --surface-2:#1F1830; --surface-3:#2A2140;
  --line:rgba(245,239,228,.07); --line-2:rgba(245,239,228,.14); --line-3:rgba(245,239,228,.22);
  /* functional colors (max 4 over bg+text) */
  --gold:#EBB24C; --gold-2:#F7CE72; --gold-deep:#A9762A;   /* primary + Vault (locked) */
  --green:#35D6A0;                                          /* support / live up */
  --red:#FF4D5E;                                            /* attack / betray / live down */
  --violet:#8B79F2;                                         /* secret / focus accent */
  /* text */
  --text:#F5EFE4; --text-2:#CFC7DA; --muted:#948CA6;
  /* elevation / glow / blur */
  --sh-1:0 2px 10px rgba(0,0,0,.35);
  --sh-2:0 10px 34px rgba(0,0,0,.5);
  --sh-card:0 18px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
  --glow-gold:0 0 42px rgba(235,178,76,.28);
  --glow-green:0 0 34px rgba(53,214,160,.3);
  --glow-red:0 0 34px rgba(255,77,94,.32);
  --blur-1:8px; --blur-2:18px;
  /* radius / spacing / type */
  --r-1:8px; --r-2:14px; --r-3:22px; --r-pill:999px;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:72px;
  --fs-display:clamp(44px,9vw,132px); --fs-h1:clamp(28px,5vw,64px); --fs-h2:clamp(22px,3.4vw,40px);
  --fs-h3:clamp(18px,2.4vw,26px); --fs-body:clamp(15px,1.6vw,19px); --fs-label:13px; --fs-cap:12px;
  --fs-vault:clamp(30px,4.4vw,72px); --fs-code:clamp(40px,7vw,96px);
  /* motion (mirror motion.ts) */
  --t-instant:110ms; --t-micro:190ms; --t-comp:340ms; --t-scene:680ms;
  --e-out:cubic-bezier(.2,.85,.25,1); --e-inout:cubic-bezier(.65,0,.35,1);
  --e-sharp:cubic-bezier(.9,.03,.2,1); --e-pull:cubic-bezier(.16,1,.3,1); --e-spring:cubic-bezier(.34,1.56,.64,1);
  /* z-layers */
  --z-bg:0; --z-content:10; --z-hud:20; --z-overlay:30; --z-toast:40; --z-modal:50;
  /* safe areas */
  --safe-t:env(safe-area-inset-top,0px); --safe-b:env(safe-area-inset-bottom,0px);
  --safe-l:env(safe-area-inset-left,0px); --safe-r:env(safe-area-inset-right,0px);
  --font:'Tajawal','Segoe UI','Tahoma',system-ui,sans-serif;
}
*{box-sizing:border-box}
html{overflow-x:hidden}
html,body{margin:0;min-height:100%}
body{
  background:var(--bg); color:var(--text); font-family:var(--font); font-weight:500;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  overscroll-behavior-y:none; -webkit-tap-highlight-color:transparent;
}
button{font-family:inherit;color:inherit;background:none;border:0;cursor:pointer}
input{font-family:inherit}
:focus{outline:none}
:focus-visible{outline:2px solid var(--violet);outline-offset:3px;border-radius:6px}
.mono{font-variant-numeric:tabular-nums;letter-spacing:.02em}
.muted{color:var(--muted)}
.dim{color:var(--text-2)}
.up{color:var(--green)} .dn{color:var(--red)} .gold{color:var(--gold)}
.center{display:flex;align-items:center;justify-content:center}
.col{display:flex;flex-direction:column}
.hide{display:none!important}

/* --- wordmark --- */
.wordmark{font-weight:900;letter-spacing:-.02em;line-height:.9;
  background:linear-gradient(180deg,var(--text),#d9cdb6);-webkit-background-clip:text;background-clip:text;color:transparent}
.wordmark.g{background:linear-gradient(120deg,var(--gold-2),var(--gold),var(--gold-deep));-webkit-background-clip:text;background-clip:text;color:transparent}

/* --- buttons --- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);
  padding:15px 26px;font-size:var(--fs-body);font-weight:700;border-radius:var(--r-2);
  background:var(--surface-2);color:var(--text);border:1px solid var(--line-2);
  transition:transform var(--t-instant) var(--e-out),background var(--t-micro) var(--e-out),border-color var(--t-micro) var(--e-out),box-shadow var(--t-micro) var(--e-out);
  min-height:52px}
.btn:hover{background:var(--surface-3);border-color:var(--line-3)}
.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(180deg,var(--gold-2),var(--gold));color:#241704;border-color:transparent;box-shadow:var(--glow-gold)}
.btn.primary:hover{filter:brightness(1.06)}
.btn.ghost{background:transparent}
.btn.danger{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.btn.wide{width:100%}
.btn[disabled]{opacity:.4;pointer-events:none;box-shadow:none}
.icon-btn{width:46px;height:46px;border-radius:var(--r-pill);display:grid;place-items:center;
  background:var(--surface-2);border:1px solid var(--line-2);color:var(--text-2);
  transition:transform var(--t-instant) var(--e-out),color var(--t-micro),border-color var(--t-micro)}
.icon-btn:hover{color:var(--text);border-color:var(--line-3)}
.icon-btn:active{transform:scale(.92)}

/* --- input --- */
.input{width:100%;padding:17px 18px;font-size:clamp(18px,4.5vw,22px);font-weight:700;text-align:center;
  color:var(--text);background:var(--surface-2);border:1.6px solid var(--line-3);border-radius:var(--r-2);
  box-shadow:inset 0 2px 10px rgba(0,0,0,.4);
  transition:border-color var(--t-micro) var(--e-out),box-shadow var(--t-micro) var(--e-out),background var(--t-micro) var(--e-out)}
.input:hover{background:var(--surface-3);border-color:var(--line-3)}
.input::placeholder{color:var(--text-2);font-weight:600;opacity:.85}
.input:focus{border-color:var(--violet);box-shadow:0 0 0 4px color-mix(in srgb,var(--violet) 18%,transparent)}
.input.err{border-color:var(--red);box-shadow:0 0 0 4px color-mix(in srgb,var(--red) 18%,transparent)}

/* --- panel / card --- */
.panel{background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);
  border-radius:var(--r-3);box-shadow:var(--sh-card);position:relative;overflow:hidden}
.panel::before{content:'';position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,var(--line-3),transparent)}

/* --- player card + avatar --- */
.pcard{display:flex;align-items:center;gap:var(--s3);padding:12px 14px;border-radius:var(--r-2);
  background:var(--surface);border:1px solid var(--line-2);transition:border-color var(--t-micro) var(--e-out),opacity var(--t-micro),transform var(--t-micro) var(--e-out)}
.pcard.is-ready{border-color:color-mix(in srgb,var(--green) 55%,transparent)}
.pcard.is-you{background:linear-gradient(180deg,var(--surface-2),var(--surface));border-color:var(--line-3)}
.pcard.is-off{opacity:.45}
.pcard .nm{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avatar{width:38px;height:38px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;
  color:#0c0a12;font-size:17px}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-cap);font-weight:800;padding:4px 9px;border-radius:var(--r-pill);
  background:var(--surface-3);color:var(--text-2);border:1px solid var(--line-2)}
.badge.ok{color:var(--green);border-color:color-mix(in srgb,var(--green) 40%,transparent)}
.badge.host{color:var(--gold);border-color:color-mix(in srgb,var(--gold) 40%,transparent)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--muted)}
.dot.on{background:var(--green);box-shadow:0 0 8px var(--green)}
.dot.off{background:var(--red)}

/* --- timer ring --- */
.ring{--p:1;position:relative;width:var(--rs,56px);height:var(--rs,56px);border-radius:50%;
  background:conic-gradient(var(--gold) calc(var(--p)*360deg),var(--surface-3) 0);
  -webkit-mask:radial-gradient(closest-side,transparent 70%,#000 72%);mask:radial-gradient(closest-side,transparent 70%,#000 72%);
  transition:background .25s linear}
.ring.urgent{background:conic-gradient(var(--red) calc(var(--p)*360deg),var(--surface-3) 0)}

/* --- live bar + vault --- */
.bar{width:100%;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,var(--green),color-mix(in srgb,var(--green) 30%,#0a1a12));
  transition:height var(--t-scene) var(--e-out),background var(--t-scene) var(--e-out),box-shadow var(--t-micro)}
.bar.falling{background:linear-gradient(180deg,color-mix(in srgb,var(--red) 60%,#180a0d),var(--red))}
.vaultnum{font-weight:900;color:var(--gold);font-variant-numeric:tabular-nums;letter-spacing:-.02em;text-shadow:0 0 22px rgba(235,178,76,.35)}
.vaultnum.snap{animation:vaultSnap var(--t-scene) var(--e-spring)}

/* --- الوسيط --- */
.waseet{display:inline-flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--surface-2) 88%,transparent);
  backdrop-filter:blur(var(--blur-1));border:1px solid var(--line-2);border-radius:var(--r-pill);padding:9px 16px;
  font-weight:700;box-shadow:var(--sh-1)}
.waseet .wm{flex:0 0 auto}

/* --- toast --- */
.toast{position:fixed;left:50%;top:calc(var(--safe-t) + 12px);transform:translateX(-50%);z-index:var(--z-toast);
  background:var(--surface-3);border:1px solid var(--line-2);border-radius:var(--r-pill);padding:10px 18px;font-weight:800;
  box-shadow:var(--sh-2);animation:toastIn var(--t-comp) var(--e-spring)}
.toast.err{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.toast.ok{color:var(--green)}

/* --- scene container --- */
.scene{position:relative;z-index:var(--z-content);width:100%;min-height:100dvh;
  padding:calc(var(--safe-t) + var(--s5)) calc(var(--safe-r) + var(--s5)) calc(var(--safe-b) + var(--s5)) calc(var(--safe-l) + var(--s5))}

/* keyframes */
@keyframes vaultSnap{0%{transform:scale(.55);opacity:0}55%{transform:scale(1.14)}100%{transform:scale(1);opacity:1}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:.9}}
@keyframes sealSweep{from{transform:translateX(-120%)}to{transform:translateX(120%)}}
@keyframes crackDraw{to{stroke-dashoffset:0}}
@keyframes floatUp{to{transform:translateY(-14vh);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:34px;height:34px;border-radius:50%;border:3px solid var(--line-2);border-top-color:var(--gold);animation:spin .8s linear infinite}

/* scroll reveal */
[data-reveal]{opacity:0;transform:translateY(30px);transition:opacity .8s var(--e-pull),transform .8s var(--e-pull)}
[data-reveal].in{opacity:1;transform:none}
[data-reveal] [data-rc]{opacity:0;transform:translateY(18px);transition:opacity .7s var(--e-pull),transform .7s var(--e-pull)}
[data-reveal].in [data-rc]{opacity:1;transform:none}
[data-reveal].in [data-rc]:nth-child(2){transition-delay:.08s}
[data-reveal].in [data-rc]:nth-child(3){transition-delay:.16s}
[data-reveal].in [data-rc]:nth-child(4){transition-delay:.24s}
[data-reveal].in [data-rc]:nth-child(5){transition-delay:.32s}
[data-px]{will-change:transform;transition:transform .25s var(--e-out)}
@media (prefers-reduced-motion: reduce){[data-reveal],[data-reveal] [data-rc]{opacity:1;transform:none;transition:none}}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;
function injectBase() {
  const s = document.createElement("style");
  s.id = "dass-base";
  s.textContent = baseCss;
  document.head.appendChild(s);
}

// packages/dass-ui/src/audio.ts
var muted = false;
try {
  muted = typeof localStorage !== "undefined" && localStorage.getItem("dass_muted") === "1";
} catch {
  muted = false;
}

// packages/dass-ui/src/qr.ts
var import_qrcode_generator = __toESM(require_qrcode(), 1);
function qrSvg(text, fg = "#0b0a0f", bg = "#f4eee3", margin = 2) {
  const qr = (0, import_qrcode_generator.default)(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const size = n + margin * 2;
  let path = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${bg}"/><path d="${path}" fill="${fg}"/></svg>`;
}

// packages/dass-ui/src/scroll.ts
function observeReveal(root = document) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  for (const el2 of Array.from(root.querySelectorAll("[data-reveal]"))) {
    if (reduced()) el2.classList.add("in");
    else io.observe(el2);
  }
  return io;
}

// apps/dasssite/src/backfire-audio.ts
var STORAGE_KEY = "backfire_sound_enabled";
var BackfireAudio = class {
  context = null;
  ambient = null;
  enabled = false;
  constructor() {
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      this.enabled = false;
    }
    document.addEventListener("visibilitychange", () => {
      if (!this.context || !this.enabled) return;
      if (document.hidden) void this.context.suspend();
      else {
        void this.context.resume();
        this.ensureAmbient();
      }
    });
  }
  isEnabled() {
    return this.enabled;
  }
  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }
  setEnabled(value) {
    this.enabled = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
    }
    if (value) {
      this.getContext();
      this.ensureAmbient();
      this.tone(196, 294, 0.11, "triangle", 0.038);
    } else {
      this.stopAmbient();
      if (this.context?.state === "running") void this.context.suspend();
    }
  }
  tick() {
    this.tone(410, 455, 0.032, "triangle", 0.021);
  }
  reveal() {
    this.tone(147, 392, 0.23, "triangle", 0.048);
    this.tone(220, 523, 0.16, "sine", 0.027, 0.09);
  }
  transfer() {
    this.tone(523, 165, 0.19, "triangle", 0.035);
  }
  impact() {
    this.tone(147, 49, 0.22, "sawtooth", 0.055);
  }
  cta() {
    this.tone(196, 392, 0.15, "triangle", 0.042);
  }
  error() {
    this.tone(210, 130, 0.13, "sawtooth", 0.055);
  }
  getContext() {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.context) {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.context = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.context.state === "suspended" && !document.hidden) void this.context.resume();
    return this.context;
  }
  tone(from, to, duration, type, peak, delay = 0) {
    const context = this.getContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    gain.gain.setValueAtTime(1e-4, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 8e-3);
    gain.gain.exponentialRampToValueAtTime(1e-4, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }
  ensureAmbient() {
    const context = this.getContext();
    if (!context || this.ambient || document.hidden) return;
    const gain = context.createGain();
    gain.gain.value = 0.012;
    const low = context.createOscillator();
    const air = context.createOscillator();
    const filter = context.createBiquadFilter();
    low.type = "sine";
    low.frequency.value = 44;
    air.type = "sine";
    air.frequency.value = 66;
    filter.type = "lowpass";
    filter.frequency.value = 150;
    low.connect(filter);
    air.connect(filter);
    filter.connect(gain).connect(context.destination);
    low.start();
    air.start();
    this.ambient = { gain, sources: [low, air] };
  }
  stopAmbient() {
    if (!this.ambient) return;
    const now = this.context?.currentTime ?? 0;
    this.ambient.gain.gain.cancelScheduledValues(now);
    this.ambient.gain.gain.setTargetAtTime(1e-4, now, 0.025);
    for (const source of this.ambient.sources) source.stop(now + 0.15);
    this.ambient = null;
  }
};
var backfireAudio = new BackfireAudio();

// apps/dasssite/src/product/config.ts
var configuredPublicOrigin = (false ? "" : "").replace(/\/$/, "");

// apps/dasssite/src/product/catalog.ts
var sar = (amountMinor, interval = "one-time") => ({
  amountMinor,
  currency: "SAR",
  interval,
  taxInclusive: true
});
var PRODUCTS = [
  { id: "theme-original", category: "theme", name: "الرجعة الأصلية", description: "هوية BACKFIRE الأساسية: أسود عميق، قرمزي، وجمر دافئ.", price: sar(0), accent: "#E23A4F", glyph: "BF", includedIn: "free" },
  { id: "theme-sadu", category: "theme", name: "نسيج الأثر", description: "تأويل بصري هادئ مستلهم من السدو لجلسات اللعب الطويلة.", price: sar(1900), accent: "#B51F36", glyph: "◆", includedIn: "majlis-plus" },
  { id: "bg-desert", category: "background", name: "آخر الإرسال", description: "خلفية تلفاز داكنة توحي بأثر بعيد من دون تشتيت.", price: sar(1200), accent: "#E85B3F", glyph: "☾" },
  { id: "avatar-falcon", category: "avatar", name: "الصقر", description: "صورة رمزية حادة وواضحة داخل جلسة اللعب.", price: sar(700), accent: "#FAF6F7", glyph: "♢" },
  { id: "frame-gold", category: "frame", name: "إطار الارتداد", description: "إطار قرمزي يبرز الملف من غير مبالغة.", price: sar(900), accent: "#B51F36", glyph: "◇", includedIn: "majlis-plus" },
  { id: "winner-spark", category: "winner", name: "نبضة الفوز", description: "لحظة فوز قصيرة ومضبوطة على الشاشة الكبيرة.", price: sar(1500), accent: "#E85B3F", glyph: "✦" },
  { id: "reveal-crack", category: "reveal", name: "ارتداد الأثر", description: "مؤثر كشف يبرز عودة العاقبة إلى المشهد العام.", price: sar(1400), accent: "#E23A4F", glyph: "╱" },
  { id: "season-eid", category: "seasonal", name: "حزمة العيد", description: "حزمة موسمية قيد التجهيز — لا يمكن شراؤها الآن.", price: sar(2900), accent: "#4A0B18", glyph: "✺", comingSoon: true }
];
var PLANS = [
  {
    id: "free",
    name: "الأساسية",
    description: "اللعبة الأساسية كاملة لكل شلة.",
    features: ["إنشاء الغرف والانضمام بلا حد مدفوع", "اللعبة الكاملة من ٤ إلى ٨ لاعبين", "الإعدادات وميزات الوصول الأساسية"]
  },
  {
    id: "majlis-plus",
    name: "Backfire Plus",
    description: "تخصيص أعمق للمضيف والملف الشخصي.",
    monthly: sar(1900, "month"),
    yearly: sar(19e3, "year"),
    recommended: true,
    features: ["ثيمات وإطارات مختارة", "حفظ إعدادات الجلسة", "سجل مباريات ممتد مستقبلًا", "مؤثرات تقديم إضافية بلا أفضلية لعب"]
  },
  {
    id: "events",
    name: "باقة مناسبات",
    description: "تقديم مخصص للفعاليات والجلسات الكبيرة.",
    monthly: sar(5900, "month"),
    yearly: sar(59e3, "year"),
    features: ["هوية غرفة قابلة للتخصيص", "قوالب عرض للمناسبات", "إعدادات مضيف متقدمة مستقبلًا", "لا تتضمن أي عنصر ادفع لتفوز"]
  }
];
function productById(id2) {
  return PRODUCTS.find((product) => product.id === id2);
}
function planById(id2) {
  return PLANS.find((plan) => plan.id === id2);
}
function formatPrice(price) {
  if (price.amountMinor === 0) return "مجاني";
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: price.currency, maximumFractionDigits: 2 }).format(price.amountMinor / 100);
}

// apps/dasssite/src/product/validation.ts
function validateDisplayName(raw) {
  const value = raw.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!value) return { ok: false, message: "اكتب الاسم الظاهر." };
  if ([...value].length > 24) return { ok: false, message: "الاسم الظاهر بحد أقصى ٢٤ حرفًا." };
  if (/[<>&\u0000-\u001f\u007f-\u009f\u202a-\u202e]/u.test(value)) return { ok: false, message: "الاسم يحتوي رموزًا غير مدعومة." };
  return { ok: true, value };
}
function validateUsername(raw) {
  const value = raw.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(value)) return { ok: false, message: "اسم المستخدم من ٣–٢٠: حروف إنجليزية وأرقام وشرطة سفلية." };
  return { ok: true, value };
}
function validateEmail(raw) {
  const value = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { ok: false, message: "اكتب بريدًا إلكترونيًا صحيحًا." };
  return { ok: true, value };
}
function validatePassword(raw) {
  if (raw.length < 8 || !/[A-Za-z]/.test(raw) || !/\d/.test(raw)) return { ok: false, message: "كلمة المرور ٨ خانات على الأقل وتحتوي حرفًا ورقمًا." };
  return { ok: true, value: raw };
}

// apps/dasssite/src/product/demo-platform.ts
var PREFIX = "dass.product.v1.";
var DEFAULT_SETTINGS = {
  language: "ar",
  appearance: "dass",
  effectsVolume: 70,
  musicVolume: 45,
  muted: false,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  textScale: "normal",
  haptics: true,
  confirmCritical: true,
  autoReady: false,
  productUpdates: true,
  matchInvites: true,
  friendInvites: false,
  purchaseReceipts: true,
  subscriptionReminders: true,
  marketing: false,
  profileVisibility: "players",
  activityVisibility: false,
  recentPlayerVisibility: false,
  analytics: false,
  functionalCookies: true
};
var DEFAULT_PROFILE = {
  displayName: "ضيف المجلس",
  username: "guest",
  avatar: "theme-original",
  frame: "theme-original"
};
var DEFAULT_INVENTORY = {
  ownedProductIds: ["theme-original"],
  equipped: { theme: "theme-original" }
};
var DEMO_IDENTITY = {
  id: "demo_user_seed",
  displayName: "لاعب تجريبي",
  username: "demo_player",
  email: "demo@backfire.local",
  createdAt: "2026-01-01T00:00:00.000Z",
  plan: "free"
};
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function id(prefix) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}
function parse(storage2, key, fallback) {
  try {
    const raw = storage2.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}
function save(storage2, key, value) {
  storage2.setItem(PREFIX + key, JSON.stringify(value));
}
function requireValue(result) {
  if (!result.ok) throw new Error(result.message);
  return result.value;
}
function scoped(key, session) {
  return `${key}.${session?.id ?? "anonymous"}`;
}
function createDemoPlatform(storage2) {
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    const session = api.getSession();
    for (const listener of listeners) listener(session);
  };
  const requireSession = () => {
    const session = api.getSession();
    if (!session) throw new Error("سجّل الدخول أو تابع كضيف أولًا.");
    return session;
  };
  const api = {
    mode: "demo",
    getSession: () => parse(storage2, "session", null),
    subscribeToSessionChanges(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async signIn(email, password) {
      const cleanEmail = requireValue(validateEmail(email));
      requireValue(validatePassword(password));
      const identity = parse(storage2, "identities", []).find((candidate) => candidate.email === cleanEmail) ?? (cleanEmail === DEMO_IDENTITY.email ? DEMO_IDENTITY : void 0);
      if (!identity) throw new Error("بيانات الدخول غير صحيحة في وضع العرض. أنشئ حسابًا محليًا أولًا.");
      const session = {
        id: identity.id,
        mode: "demo",
        displayName: identity.displayName,
        username: identity.username,
        email: cleanEmail,
        verified: false,
        plan: identity.plan,
        createdAt: identity.createdAt
      };
      save(storage2, "session", session);
      const existingProfile = parse(storage2, scoped("profile", session), null);
      if (!existingProfile) save(storage2, scoped("profile", session), { ...DEFAULT_PROFILE, displayName: session.displayName, username: session.username });
      notify();
      return clone(session);
    },
    async signUp(input) {
      if (!input.acceptedTerms) throw new Error("وافق على الشروط وسياسة الخصوصية للمتابعة.");
      const displayName = requireValue(validateDisplayName(input.displayName));
      const username = requireValue(validateUsername(input.username));
      const email = requireValue(validateEmail(input.email));
      requireValue(validatePassword(input.password));
      const identities = parse(storage2, "identities", []);
      if (identities.some((identity) => identity.email === email) || email === DEMO_IDENTITY.email) throw new Error("البريد مستخدم مسبقًا في هذا المتصفح.");
      if (identities.some((identity) => identity.username === username) || username === DEMO_IDENTITY.username) throw new Error("اسم المستخدم مستخدم مسبقًا في هذا المتصفح.");
      const createdAt = (/* @__PURE__ */ new Date()).toISOString();
      const userId = id("demo_user");
      const session = {
        id: userId,
        mode: "demo",
        displayName,
        username,
        email,
        verified: false,
        plan: "free",
        createdAt
      };
      identities.push({ id: userId, displayName, username, email, createdAt, plan: "free" });
      save(storage2, "identities", identities);
      save(storage2, "session", session);
      save(storage2, scoped("profile", session), { ...DEFAULT_PROFILE, displayName, username });
      save(storage2, scoped("settings", session), DEFAULT_SETTINGS);
      save(storage2, scoped("inventory", session), DEFAULT_INVENTORY);
      notify();
      return clone(session);
    },
    async continueAsGuest(displayName = DEFAULT_PROFILE.displayName) {
      const cleanName = requireValue(validateDisplayName(displayName));
      const suffix = Math.random().toString(36).slice(2, 7);
      const session = {
        id: id("guest"),
        mode: "guest",
        displayName: cleanName,
        username: `guest_${suffix}`,
        verified: false,
        plan: "free",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      save(storage2, "session", session);
      save(storage2, scoped("profile", session), { ...DEFAULT_PROFILE, displayName: cleanName, username: session.username });
      notify();
      return clone(session);
    },
    async signOut() {
      storage2.removeItem(PREFIX + "session");
      notify();
    },
    async requestPasswordReset(email) {
      requireValue(validateEmail(email));
      return { delivered: false, demo: true };
    },
    getProfile() {
      const session = api.getSession();
      return parse(storage2, scoped("profile", session), session ? { ...DEFAULT_PROFILE, displayName: session.displayName, username: session.username } : DEFAULT_PROFILE);
    },
    async updateProfile(update) {
      const session = requireSession();
      const profile = api.getProfile();
      const next = { ...profile, ...update };
      if (update.displayName !== void 0) next.displayName = requireValue(validateDisplayName(update.displayName));
      if (update.username !== void 0) next.username = requireValue(validateUsername(update.username));
      const identities = parse(storage2, "identities", []);
      if (identities.some((candidate) => candidate.id !== session.id && candidate.username === next.username) || session.id !== DEMO_IDENTITY.id && next.username === DEMO_IDENTITY.username) {
        throw new Error("اسم المستخدم مستخدم مسبقًا في هذا المتصفح.");
      }
      save(storage2, scoped("profile", session), next);
      const nextSession = { ...session, displayName: next.displayName, username: next.username };
      save(storage2, "session", nextSession);
      const identity = identities.find((candidate) => candidate.id === session.id);
      if (identity) {
        identity.displayName = next.displayName;
        identity.username = next.username;
        save(storage2, "identities", identities);
      }
      notify();
      return clone(next);
    },
    getSettings: () => {
      const session = api.getSession();
      return { ...DEFAULT_SETTINGS, ...parse(storage2, scoped("settings", session), {}) };
    },
    updateSettings(update) {
      requireSession();
      const next = { ...api.getSettings(), ...update };
      next.effectsVolume = Math.min(100, Math.max(0, Number(next.effectsVolume)));
      next.musicVolume = Math.min(100, Math.max(0, Number(next.musicVolume)));
      save(storage2, scoped("settings", api.getSession()), next);
      return clone(next);
    },
    getInventory: () => parse(storage2, scoped("inventory", api.getSession()), DEFAULT_INVENTORY),
    async equipProduct(productId) {
      requireSession();
      const product = productById(productId);
      if (!product) throw new Error("العنصر غير موجود.");
      const inventory = api.getInventory();
      if (!inventory.ownedProductIds.includes(productId)) throw new Error("العنصر غير مملوك.");
      inventory.equipped[product.category] = productId;
      save(storage2, scoped("inventory", api.getSession()), inventory);
      return clone(inventory);
    },
    async unequipProduct(productId) {
      requireSession();
      const product = productById(productId);
      if (!product) throw new Error("العنصر غير موجود.");
      const inventory = api.getInventory();
      if (inventory.equipped[product.category] !== productId) return inventory;
      if (product.category === "theme") inventory.equipped.theme = "theme-original";
      else delete inventory.equipped[product.category];
      save(storage2, scoped("inventory", api.getSession()), inventory);
      return clone(inventory);
    },
    async createCheckout(kind, referenceId, interval = "month") {
      const session = requireSession();
      const product = kind === "product" ? productById(referenceId) : void 0;
      const plan = kind === "plan" ? planById(referenceId) : void 0;
      if (kind === "product" && (!product || product.comingSoon)) throw new Error("هذا العنصر غير متاح للشراء.");
      if (kind === "plan" && (!plan || plan.id === "free")) throw new Error("هذه الباقة لا تحتاج إلى دفع.");
      const price = product?.price ?? (interval === "year" ? plan?.yearly : plan?.monthly);
      if (!price) throw new Error("سعر الاختيار غير متاح.");
      const checkout = {
        id: id("demo_checkout"),
        ownerId: session.id,
        kind,
        referenceId,
        label: product?.name ?? plan.name,
        price,
        status: "pending",
        demo: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      save(storage2, `checkout.${checkout.id}`, checkout);
      return clone(checkout);
    },
    getCheckout(checkoutId) {
      return parse(storage2, `checkout.${checkoutId}`, null);
    },
    async completeDemoCheckout(checkoutId, outcome) {
      const currentSession = requireSession();
      const checkout = api.getCheckout(checkoutId);
      if (!checkout) throw new Error("جلسة الدفع غير موجودة.");
      if (checkout.ownerId !== currentSession.id) throw new Error("جلسة الدفع لا تخص هذا الحساب.");
      if (checkout.status !== "pending") return checkout;
      checkout.status = outcome;
      save(storage2, `checkout.${checkout.id}`, checkout);
      if (outcome === "succeeded") {
        if (checkout.kind === "product") {
          const inventory = api.getInventory();
          if (!inventory.ownedProductIds.includes(checkout.referenceId)) inventory.ownedProductIds.push(checkout.referenceId);
          save(storage2, scoped("inventory", api.getSession()), inventory);
        } else {
          const session = requireSession();
          save(storage2, "session", { ...session, plan: checkout.referenceId });
          const identities = parse(storage2, "identities", []);
          const identity = identities.find((candidate) => candidate.id === session.id);
          if (identity) {
            identity.plan = checkout.referenceId;
            save(storage2, "identities", identities);
          }
          notify();
        }
        const receipts = api.getPurchaseHistory();
        const receipt = {
          id: id("demo_receipt"),
          checkoutId: checkout.id,
          label: checkout.label,
          totalMinor: checkout.price.amountMinor,
          currency: checkout.price.currency,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          demo: true
        };
        receipts.unshift(receipt);
        save(storage2, scoped("receipts", api.getSession()), receipts);
      }
      return clone(checkout);
    },
    getPurchaseHistory: () => parse(storage2, scoped("receipts", api.getSession()), []),
    async cancelSubscription() {
      const session = requireSession();
      const next = { ...session, plan: "free" };
      save(storage2, "session", next);
      const identities = parse(storage2, "identities", []);
      const identity = identities.find((candidate) => candidate.id === session.id);
      if (identity) {
        identity.plan = "free";
        save(storage2, "identities", identities);
      }
      notify();
      return clone(next);
    },
    getMatchHistory: () => parse(storage2, scoped("matches", api.getSession()), []),
    async saveSupportRequest(request) {
      const subject = request.subject.trim();
      const message = request.message.trim();
      if (subject.length < 3 || subject.length > 100) throw new Error("عنوان الطلب من ٣ إلى ١٠٠ حرف.");
      if (message.length < 10 || message.length > 2e3) throw new Error("التفاصيل من ١٠ إلى ٢٠٠٠ حرف.");
      if (request.email) requireValue(validateEmail(request.email));
      const entry = {
        ...request,
        subject,
        message,
        id: id("demo_support"),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        delivery: "local-only"
      };
      const requests = parse(storage2, "support", []);
      requests.unshift(entry);
      save(storage2, "support", requests);
      return clone(entry);
    },
    async deleteLocalAccount(confirmation) {
      if (confirmation.trim() !== "احذف حسابي") throw new Error("اكتب «احذف حسابي» للتأكيد.");
      const session = requireSession();
      for (const key of ["profile", "settings", "inventory", "receipts", "matches"]) {
        storage2.removeItem(PREFIX + scoped(key, session));
      }
      const identities = parse(storage2, "identities", []).filter((identity) => identity.id !== session.id);
      save(storage2, "identities", identities);
      storage2.removeItem(PREFIX + "support");
      storage2.removeItem(PREFIX + "session");
      notify();
    }
  };
  return api;
}
function createUnavailablePlatform() {
  const unavailable = () => {
    throw new Error("خدمات الحساب والدفع غير موصولة في هذا الإصدار.");
  };
  return {
    mode: "unavailable",
    getSession: () => null,
    subscribeToSessionChanges: () => () => void 0,
    signIn: async () => unavailable(),
    signUp: async () => unavailable(),
    continueAsGuest: async () => unavailable(),
    signOut: async () => void 0,
    requestPasswordReset: async () => unavailable(),
    getProfile: unavailable,
    updateProfile: async () => unavailable(),
    getSettings: unavailable,
    updateSettings: unavailable,
    getInventory: unavailable,
    equipProduct: async () => unavailable(),
    unequipProduct: async () => unavailable(),
    createCheckout: async () => unavailable(),
    getCheckout: () => null,
    completeDemoCheckout: async () => unavailable(),
    getPurchaseHistory: () => [],
    cancelSubscription: async () => unavailable(),
    getMatchHistory: () => [],
    saveSupportRequest: async () => unavailable(),
    deleteLocalAccount: async () => unavailable()
  };
}

// apps/dasssite/src/product/platform.ts
var memory = /* @__PURE__ */ new Map();
var fallbackStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  }
};
var storage = typeof localStorage === "undefined" ? fallbackStorage : localStorage;
var configuredDemoMode = false ? true : true;
var platform = configuredDemoMode ? createDemoPlatform(storage) : createUnavailablePlatform();
var demoMode = configuredDemoMode;

// packages/dass/src/join.ts
var ROOM_CODE_LENGTH = 8;
var ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
var EASTERN_ARABIC = "۰۱۲۳۴۵۶۷۸۹";
function normalizeRoomCode(value) {
  return String(value ?? "").trim().replace(/[\s-]+/g, "").replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC.indexOf(digit))).replace(/[۰-۹]/g, (digit) => String(EASTERN_ARABIC.indexOf(digit))).toUpperCase();
}
function isRoomCode(value) {
  const code = normalizeRoomCode(value);
  return code.length === ROOM_CODE_LENGTH && [...code].every((char) => ROOM_CODE_ALPHABET.includes(char));
}

// apps/dasssite/src/product/pages.ts
var PRODUCT_PATHS = /* @__PURE__ */ new Set([
  "/store",
  "/pricing",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/session-ended",
  "/store/product",
  "/checkout/result",
  "/account",
  "/account/profile",
  "/account/settings",
  "/account/inventory",
  "/account/history",
  "/account/history/match",
  "/account/achievements",
  "/account/billing",
  "/checkout",
  "/support",
  "/faq",
  "/contact",
  "/report-player",
  "/about",
  "/credits",
  "/status",
  "/changelog",
  "/invite",
  "/legal/privacy",
  "/legal/terms",
  "/legal/refunds",
  "/legal/cookies"
]);
var h = escapeHtml;
var $ = (selector) => document.querySelector(selector);
function shell(kicker, title, copy, content, aside = "") {
  return `<main id="main-content" class="product-page" tabindex="-1">
    <header class="product-hero"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${copy}</p></div>${aside}</header>
    ${demoMode ? demoBanner() : unavailableBanner()}
    ${content}
  </main>`;
}
function demoBanner() {
  return `<aside class="demo-banner" role="note"><span class="demo-dot"></span><div><b>وضع العرض المحلي</b><span>الحسابات والمشتريات محفوظة على هذا المتصفح فقط. لا يوجد دفع أو إرسال بريد حقيقي.</span></div></aside>`;
}
function unavailableBanner() {
  return `<aside class="demo-banner unavailable" role="alert"><span class="demo-dot"></span><div><b>الخدمات التجارية غير متصلة</b><span>التصفح متاح، لكن الحساب والدفع يحتاجان مزود إنتاج.</span></div></aside>`;
}
function notice(message, kind = "ok") {
  const box = $("#product-notice");
  if (!box) return;
  box.className = `product-notice ${kind}`;
  box.textContent = message;
  box.removeAttribute("hidden");
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function errorMessage(error) {
  return error instanceof Error ? error.message : "تعذر إكمال العملية.";
}
function setFormBusy(form, busy) {
  form.setAttribute("aria-busy", String(busy));
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent ?? "";
    button.textContent = "جاري التنفيذ…";
  } else if (button.dataset.label) button.textContent = button.dataset.label;
  button.disabled = busy;
}
function requireAccount(session, next = "") {
  if (session) return null;
  const login = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  return `<section class="empty-state panel"><span class="empty-glyph">◇</span><h2>تحتاج حسابًا محليًا</h2><p>سجّل دخولك في وضع العرض أو تابع كضيف للوصول لهذه الصفحة.</p><a class="btn primary" data-link="${login}">دخول أو متابعة كضيف</a></section>`;
}
function loginNext() {
  const requested = new URLSearchParams(location.search).get("next") ?? "";
  const path = requested.split("?")[0] ?? "";
  return path.startsWith("/") && PRODUCT_PATHS.has(path) ? requested : "/account/profile";
}
function accountTabs(active) {
  const tabs = [
    ["profile", "/account/profile", "الملف"],
    ["inventory", "/account/inventory", "المقتنيات"],
    ["history", "/account/history", "المباريات"],
    ["achievements", "/account/achievements", "الإنجازات"],
    ["billing", "/account/billing", "الفوترة"],
    ["settings", "/account/settings", "الإعدادات"]
  ];
  return `<nav class="account-tabs" aria-label="صفحات الحساب">${tabs.map(([id2, path, label]) => `<a data-link="${path}" class="${active === id2 ? "on" : ""}">${label}</a>`).join("")}</nav>`;
}
function field(name, label, type = "text", value = "", attrs = "") {
  return `<label class="field"><span>${label}</span><input class="input" name="${name}" type="${type}" value="${h(value)}" ${attrs}></label>`;
}
function loginPage() {
  const session = platform.getSession();
  const html = session ? shell("الحساب", "أهلًا " + h(session.displayName), "جلستك المحلية جاهزة.", `<section class="auth-card panel"><div id="product-notice" hidden></div><p class="muted">${session.mode === "guest" ? "أنت داخل كضيف." : `الحساب التجريبي: ${h(session.email ?? "")}`}</p><a class="btn primary wide" data-link="/account/profile">افتح حسابي</a><button class="btn wide" id="logout">تسجيل الخروج</button></section>`) : shell("الحساب", "ارجع للعبة", "دخول تجريبي محلي لا يرسل بيانات إلى خادم.", `<section class="auth-layout"><form id="login-form" class="auth-card panel"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field("email", "البريد الإلكتروني", "email", "", 'autocomplete="email" required')}${field("password", "كلمة المرور", "password", "", 'data-secret autocomplete="current-password" minlength="8" required')}<div class="demo-credential"><span>حساب العرض الجاهز</span><code dir="ltr">demo@backfire.local · demoPass8</code></div><div class="form-options"><label class="check-row"><input name="remember" type="checkbox" checked><span>تذكر الجلسة على هذا الجهاز</span></label><button class="secret-toggle" type="button">إظهار كلمة المرور</button></div><button class="btn primary wide" type="submit">دخول تجريبي</button><a data-link="/forgot-password" class="text-link">نسيت كلمة المرور؟</a></form><aside class="auth-side"><span class="auth-seal">BF</span><h2>ما عندك حساب؟</h2><p>أنشئ ملفًا محليًا، أو ادخل كضيف من دون بريد.</p><a class="btn" data-link="/signup">إنشاء حساب تجريبي</a><button id="guest-login" class="btn ghost">المتابعة كضيف</button></aside></section>`);
  return {
    active: "account",
    title: "تسجيل الدخول",
    description: "الدخول إلى حساب BACKFIRE التجريبي.",
    html,
    bind(navigate) {
      bindSecretToggle();
      $("#logout")?.addEventListener("click", async () => {
        await platform.signOut();
        navigate("/");
      });
      $("#guest-login")?.addEventListener("click", async (event) => {
        event.currentTarget.disabled = true;
        try {
          await platform.continueAsGuest();
          navigate(loginNext());
        } catch (error) {
          notice(errorMessage(error), "error");
          event.currentTarget.disabled = false;
        }
      });
      $("#login-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setFormBusy(form, true);
        const data = new FormData(form);
        try {
          await platform.signIn(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
          navigate(loginNext());
        } catch (error) {
          notice(errorMessage(error), "error");
        } finally {
          setFormBusy(form, false);
        }
      });
    }
  };
}
function signupPage() {
  return {
    active: "account",
    title: "إنشاء حساب",
    description: "إنشاء حساب BACKFIRE تجريبي محلي.",
    html: shell("حساب جديد", "سمّ نفسك", "البيانات تبقى على هذا الجهاز في وضع العرض.", `<form id="signup-form" class="auth-card panel form-grid"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field("displayName", "الاسم الظاهر", "text", "", 'maxlength="24" autocomplete="name" required aria-describedby="name-help"')}<small id="name-help" class="field-help">حتى ٢٤ حرفًا. لا نسمح بالترميز أو محارف التحكم.</small>${field("username", "اسم المستخدم", "text", "", 'maxlength="20" pattern="[a-zA-Z0-9_]{3,20}" dir="ltr" required aria-describedby="username-help"')}<small id="username-help" class="field-help">٣–٢٠ من الحروف الإنجليزية والأرقام والشرطة السفلية.</small>${field("email", "البريد الإلكتروني", "email", "", 'autocomplete="email" required')}${field("password", "كلمة المرور", "password", "", 'data-secret minlength="8" autocomplete="new-password" required aria-describedby="password-help"')}${field("confirmPassword", "تأكيد كلمة المرور", "password", "", 'data-secret minlength="8" autocomplete="new-password" required')}<small id="password-help" class="field-help">٨ خانات على الأقل، وتتضمن حرفًا ورقمًا.</small><button class="secret-toggle" type="button">إظهار كلمتي المرور</button><label class="check-row"><input name="terms" type="checkbox" required><span>أوافق على <a data-link="/legal/terms">الشروط</a> و<a data-link="/legal/privacy">الخصوصية</a>.</span></label><button class="btn primary wide" type="submit">أنشئ الحساب التجريبي</button><p class="form-foot">عندك حساب؟ <a data-link="/login">سجّل الدخول</a></p></form>`),
    bind(navigate) {
      bindSecretToggle();
      $("#signup-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setFormBusy(form, true);
        const data = new FormData(form);
        try {
          if (String(data.get("password") ?? "") !== String(data.get("confirmPassword") ?? "")) throw new Error("كلمتا المرور غير متطابقتين.");
          await platform.signUp({
            displayName: String(data.get("displayName") ?? ""),
            username: String(data.get("username") ?? ""),
            email: String(data.get("email") ?? ""),
            password: String(data.get("password") ?? ""),
            acceptedTerms: data.get("terms") === "on"
          });
          navigate("/account/profile");
        } catch (error) {
          notice(errorMessage(error), "error");
        } finally {
          setFormBusy(form, false);
        }
      });
    }
  };
}
function bindSecretToggle() {
  $(".secret-toggle")?.addEventListener("click", (event) => {
    const secrets = document.querySelectorAll("[data-secret]");
    const show = [...secrets].some((input) => input.type === "password");
    secrets.forEach((input) => {
      input.type = show ? "text" : "password";
    });
    event.currentTarget.textContent = show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور";
  });
}
function forgotPage() {
  return {
    active: "account",
    title: "استعادة كلمة المرور",
    description: "توضيح استعادة كلمة المرور في النسخة التجريبية.",
    html: shell("استعادة الحساب", "نسيت كلمة المرور؟", "لن نرسل بريدًا وهميًا. مزود البريد غير موصول في وضع العرض.", `<form id="reset-form" class="auth-card panel"><div id="product-notice" hidden></div>${field("email", "البريد الإلكتروني", "email", "", 'required autocomplete="email"')}<button class="btn primary wide" type="submit">تحقق من الطلب</button><a class="text-link" data-link="/login">العودة للدخول</a></form>`),
    bind() {
      $("#reset-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setFormBusy(form, true);
        const data = new FormData(form);
        try {
          await platform.requestPasswordReset(String(data.get("email") ?? ""));
          notice("البريد صحيح، لكن لم يُرسل شيء لأن مزود البريد غير موصول في وضع العرض.");
        } catch (error) {
          notice(errorMessage(error), "error");
        } finally {
          setFormBusy(form, false);
        }
      });
    }
  };
}
function authStatePage(path) {
  if (path === "/session-ended") return {
    active: "account",
    title: "انتهت الجلسة",
    description: "انتهت جلسة حساب BACKFIRE.",
    html: shell("أمان الحساب", "انتهت الجلسة", "لم نحتفظ بعملية معلّقة. ادخل مرة ثانية للمتابعة.", `<section class="empty-state panel"><span class="empty-glyph">⌁</span><h2>سجّل دخولك من جديد</h2><p>في مزود الإنتاج ستنتهي الجلسة عند الإلغاء أو انتهاء صلاحية الرمز. وضع العرض المحلي لا يدّعي دورة رموز خادم.</p><a class="btn primary" data-link="/login">تسجيل الدخول</a></section>`)
  };
  if (path === "/verify-email") return {
    active: "account",
    title: "تأكيد البريد",
    description: "حالة تأكيد بريد حساب BACKFIRE.",
    html: shell("تأكيد البريد", "البريد غير موثّق", "مزود البريد غير موصول، لذلك لن نرسل رسالة وهمية.", `<section class="empty-state panel"><span class="empty-glyph">✉</span><h2>التأكيد غير متاح في وضع العرض</h2><p>الحساب المحلي يبقى بعلامة «غير موثّق». عند توصيل مزود الهوية ستُرسل الروابط وتُتحقق على الخادم.</p><a class="btn" data-link="/account/profile">العودة للملف</a></section>`)
  };
  return {
    active: "account",
    title: "إعادة تعيين كلمة المرور",
    description: "إعادة تعيين كلمة مرور BACKFIRE.",
    html: shell("استعادة الحساب", "رابط إعادة التعيين غير نشط", "هذه الشاشة موجودة لحالة الرابط، لكنها لن تغير كلمة مرور من دون مزود هوية.", `<section class="empty-state panel"><span class="empty-glyph">◇</span><h2>لا يوجد رمز استعادة صالح</h2><p>اطلب رابطًا بعد توصيل خدمة البريد والهوية. لم نقرأ أو نقبل أي رمز من الرابط في وضع العرض.</p><a class="btn primary" data-link="/forgot-password">العودة للاستعادة</a></section>`)
  };
}
function productCard(product, owned) {
  const primaryAction2 = product.comingSoon ? '<button class="btn sm" disabled>قريبًا</button>' : owned.has(product.id) ? `<a class="btn sm" data-link="/account/inventory">${product.price.amountMinor === 0 ? "ضمن حسابك" : "مملوك"}</a>` : `<a class="btn primary sm" data-link="/checkout?kind=product&id=${product.id}">اقتناء</a>`;
  return `<article class="product-card" data-category="${product.category}" data-name="${h(product.name.toLowerCase())}" data-price="${product.price.amountMinor}"><a class="product-art" style="--accent:${product.accent}" data-link="/store/product?id=${product.id}" aria-label="معاينة ${h(product.name)}"><span>${h(product.glyph)}</span></a><div class="product-card-copy"><span class="product-type">${categoryLabel(product.category)}</span><h2><a data-link="/store/product?id=${product.id}">${h(product.name)}</a></h2><p>${h(product.description)}</p><div class="product-card-foot"><b>${formatPrice(product.price)}</b><div><a class="btn sm ghost" data-link="/store/product?id=${product.id}">معاينة</a>${primaryAction2}</div></div></div></article>`;
}
function categoryLabel(category) {
  return { theme: "ثيم", background: "خلفية", avatar: "صورة", frame: "إطار", winner: "فوز", reveal: "كشف", seasonal: "موسمي" }[category];
}
function storePage() {
  const owned = new Set(platform.getSession() ? platform.getInventory().ownedProductIds : ["theme-original"]);
  return {
    active: "store",
    title: "المتجر",
    description: "مظاهر وتجارب بصرية اختيارية للعبة BACKFIRE.",
    html: shell("متجر BACKFIRE", "خلّ الجلسة تشبهكم", "مظاهر ومؤثرات اختيارية فقط — لا أفضلية لعب ولا صناديق عشوائية.", `<section class="catalog-tools"><div class="filter-pills" role="group" aria-label="تصفية المتجر"><button class="on" data-filter="all">الكل</button><button data-filter="theme">الثيمات</button><button data-filter="avatar">الملف</button><button data-filter="winner">المؤثرات</button></div><div class="catalog-inputs"><label><span class="sr-only">ابحث في المتجر</span><input id="store-search" class="input" type="search" placeholder="ابحث بالاسم"></label><label><span class="sr-only">ترتيب المتجر</span><select id="store-sort" class="input"><option value="featured">الترتيب المقترح</option><option value="low">السعر: الأقل</option><option value="high">السعر: الأعلى</option></select></label></div><p class="catalog-note">الأسعار تشمل الضريبة · الدفع الحقيقي غير مفعّل</p></section><div id="store-empty" class="empty-state panel compact" hidden><h2>ما لقينا هذا العنصر</h2><p>غيّر البحث أو افتح فئة ثانية.</p></div><section class="product-grid" id="product-grid">${PRODUCTS.map((product) => productCard(product, owned)).join("")}</section>`),
    bind() {
      let category = "all";
      const apply = () => {
        const query = ($("#store-search")?.value ?? "").trim().toLowerCase();
        let visible = 0;
        document.querySelectorAll("[data-category]").forEach((card) => {
          card.hidden = category !== "all" && card.dataset.category !== category || !(card.dataset.name ?? "").includes(query);
          if (!card.hidden) visible += 1;
        });
        const empty = $("#store-empty");
        if (empty) empty.toggleAttribute("hidden", visible !== 0);
      };
      document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("on", item === button));
        category = button.dataset.filter ?? "all";
        apply();
      }));
      $("#store-search")?.addEventListener("input", apply);
      $("#store-sort")?.addEventListener("change", (event) => {
        const grid = $("#product-grid");
        if (!grid) return;
        const cards = [...grid.querySelectorAll("[data-price]")];
        const mode = event.currentTarget.value;
        if (mode !== "featured") cards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price) || (a.dataset.name ?? "").localeCompare(b.dataset.name ?? "", "ar"));
        if (mode === "high") cards.reverse();
        cards.forEach((card) => grid.append(card));
      });
    }
  };
}
function productDetailPage(params) {
  const product = productById(params.get("id") ?? "");
  if (!product) return notFoundPage("العنصر غير موجود", "ارجع للمتجر واختر عنصرًا من الكتالوج.");
  const inventory = platform.getSession() ? platform.getInventory() : null;
  const owned = inventory?.ownedProductIds.includes(product.id) ?? product.price.amountMinor === 0;
  const equipped = inventory?.equipped[product.category] === product.id;
  const action = product.comingSoon ? '<button class="btn primary" disabled>قريبًا</button>' : owned ? `<button id="detail-equip" class="btn primary" ${equipped ? "disabled" : ""}>${equipped ? "مفعّل الآن" : "تفعيل العنصر"}</button>` : `<a class="btn primary" data-link="/checkout?kind=product&id=${product.id}">اقتناء تجريبي</a>`;
  return {
    active: "store",
    title: product.name,
    description: product.description,
    html: shell("تفاصيل العنصر", h(product.name), h(product.description), `<section class="product-detail"><div class="product-detail-art panel" style="--accent:${product.accent}"><span>${h(product.glyph)}</span><i>معاينة بصرية تمثيلية</i></div><div class="product-detail-copy panel"><span class="product-type">${categoryLabel(product.category)}</span><h2>${formatPrice(product.price)}</h2><dl><div><dt>الحالة</dt><dd>${product.comingSoon ? "قيد التجهيز" : owned ? "مملوك" : "متاح"}</dd></div><div><dt>الفئة</dt><dd>${categoryLabel(product.category)}</dd></div><div><dt>الأثر على اللعب</dt><dd>تجميلي فقط</dd></div></dl>${action}<p>لا يمنح العنصر نقاطًا أو قرارات أو فرصة فوز إضافية.</p><a class="text-link" data-link="/store">العودة للمتجر</a></div></section>`),
    bind(_navigate, refresh) {
      $("#detail-equip")?.addEventListener("click", async () => {
        try {
          await platform.equipProduct(product.id);
          refresh();
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
    }
  };
}
function planCard(plan) {
  const current = platform.getSession()?.plan === plan.id;
  const monthly = plan.monthly ? formatPrice(plan.monthly) : "مجاني";
  const yearly = plan.yearly ? formatPrice(plan.yearly) : "مجاني";
  const action = current ? '<button class="btn wide" disabled>باقتك الحالية</button>' : plan.id === "free" ? '<a class="btn wide" data-link="/create">ابدأ الآن</a>' : `<a class="btn ${plan.recommended ? "primary" : ""} wide price-action" data-plan="${plan.id}" data-link="/checkout?kind=plan&id=${plan.id}&interval=month">اختر الباقة</a>`;
  return `<article class="plan-card ${plan.recommended ? "recommended" : ""} ${current ? "current" : ""}">${current ? '<span class="plan-badge current">الحالية</span>' : plan.recommended ? '<span class="plan-badge">الأوضح للمجالس</span>' : ""}<div><span class="product-type">${plan.id === "free" ? "الأساسي" : "اشتراك"}</span><h2>${h(plan.name)}</h2><p>${h(plan.description)}</p></div><div class="plan-price"><b data-month="${monthly}" data-year="${yearly}">${monthly}</b><span class="plan-cycle">${plan.id === "free" ? "دائمًا" : "شهريًا"}</span></div><ul>${plan.features.map((feature) => `<li>${h(feature)}</li>`).join("")}</ul>${action}</article>`;
}
function pricingPage() {
  return {
    active: "pricing",
    title: "الأسعار",
    description: "باقات BACKFIRE الشفافة من دون أفضلية لعب.",
    html: shell("العضوية", "اللعبة كاملة… والتخصيص اختياري", "النسخة المجانية تشمل اللعب الأساسي كاملًا. العضوية تضيف مظهرًا وتنظيمًا فقط.", `<div class="billing-toggle" role="group" aria-label="دورة الفوترة"><button class="on" data-cycle="month">شهري</button><button data-cycle="year">سنوي <span>وفر شهرين</span></button></div><section class="plans-grid">${PLANS.map(planCard).join("")}</section><section class="pricing-trust"><h2>وعدنا التجاري</h2><div><p><b>لا ادفع لتفوز</b><span>كل القرارات والنتائج متساوية.</span></p><p><b>لا تجديد مخفي</b><span>السعر والدورة ظاهران قبل التأكيد.</span></p><p><b>لا شراء عشوائي</b><span>تعرف بالضبط وش تقتني.</span></p></div></section><section class="plan-compare panel"><h2>مقارنة سريعة</h2><div><span>اللعبة الأساسية</span><b>كل الباقات</b></div><div><span>ميزات الوصول</span><b>كل الباقات</b></div><div><span>الثيمات والإطارات</span><b>بلس والمناسبات</b></div><div><span>هوية مناسبة مخصصة</span><b>المناسبات</b></div></section><section class="faq-list"><h2>أسئلة الفوترة</h2><details><summary>هل يتم الخصم الآن؟</summary><p>لا. المزود الحالي محلي وتجريبي، ولا يطلب بطاقة أو يخصم مبلغًا.</p></details><details><summary>كيف ألغي أو أخفّض الباقة؟</summary><p>تظهر واجهة الإدارة في صفحة الفوترة، لكن الإلغاء والتجديد الحقيقيين يحتاجان بوابة مزود الدفع.</p></details><details><summary>هل السعر شامل الضريبة؟</summary><p>بيانات الكتالوج الحالية معنونة بأنها شاملة الضريبة. يجب تأكيد الفواتير والسياسة مع مزود الدفع قبل البيع.</p></details></section>`),
    bind() {
      document.querySelectorAll("[data-cycle]").forEach((button) => button.addEventListener("click", () => {
        const cycle = button.dataset.cycle;
        document.querySelectorAll("[data-cycle]").forEach((item) => item.classList.toggle("on", item === button));
        document.querySelectorAll(".plan-price b").forEach((price) => {
          price.textContent = price.dataset[cycle] ?? "";
        });
        document.querySelectorAll(".plan-cycle").forEach((label) => {
          if (label.textContent !== "دائمًا") label.textContent = cycle === "year" ? "سنويًا" : "شهريًا";
        });
        document.querySelectorAll(".price-action").forEach((link) => {
          link.dataset.link = `/checkout?kind=plan&id=${link.dataset.plan}&interval=${cycle}`;
        });
      }));
    }
  };
}
function profilePage() {
  const session = platform.getSession();
  const gate = requireAccount(session);
  if (gate) return { active: "account", title: "الملف الشخصي", description: "ملف حساب BACKFIRE.", html: shell("حسابي", "الملف الشخصي", "إدارة هويتك داخل BACKFIRE.", gate) };
  const profile = platform.getProfile();
  const joined = new Date(session.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  return {
    active: "account",
    title: "الملف الشخصي",
    description: "إدارة ملف حساب BACKFIRE.",
    html: shell("حسابي", "الملف الشخصي", "اسمك وهويتك أمام لاعبي المجلس.", `${accountTabs("profile")}<section class="account-grid"><aside class="profile-preview panel"><div class="profile-avatar">${h(profile.displayName.slice(0, 1))}</div><h2>${h(profile.displayName)}</h2><span>@${h(profile.username)}</span><div class="profile-badges"><i>${session.mode === "guest" ? "ضيف محلي" : "حساب تجريبي"}</i><i>${session.plan === "free" ? "مجلس" : h(planById(session.plan)?.name ?? "")}</i>${session.verified ? '<i class="verified">موثّق</i>' : '<a data-link="/verify-email">غير موثّق</a>'}</div><small>منضم منذ ${joined}</small></aside><form id="profile-form" class="account-form panel"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field("displayName", "الاسم الظاهر", "text", profile.displayName, 'maxlength="24" required')}${field("username", "اسم المستخدم", "text", profile.username, 'maxlength="20" dir="ltr" required')}<p class="field-help">وضع العرض يفحص التكرار داخل هذا المتصفح. الإنتاج يحتاج فحصًا مركزيًا وطبقة إشراف على الأسماء.</p><button class="btn primary" type="submit">حفظ التغييرات</button><a class="btn" data-link="/account/inventory">اختيار الصورة والإطار والمظهر</a><button class="btn danger-outline" id="logout" type="button">تسجيل الخروج</button></form></section><section class="profile-stats panel"><header><div><h2>الإحصاءات</h2><p>لا توجد مزامنة مباريات لهذا الحساب بعد.</p></div><a data-link="/account/history">سجل المباريات</a></header><div>${[["المباريات", "٠"], ["الفوز", "٠"], ["الخسارة", "٠"], ["نسبة الفوز", "—"], ["السلسلة الحالية", "٠"], ["أفضل سلسلة", "٠"]].map(([label, value]) => `<p><b>${value}</b><span>${label}</span></p>`).join("")}</div><footer>هذه أصفار حقيقية لحساب بلا سجل، وليست بيانات عيّنة.</footer></section>`),
    bind(navigate, refresh) {
      $("#profile-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setFormBusy(form, true);
        const data = new FormData(form);
        try {
          await platform.updateProfile({ displayName: String(data.get("displayName") ?? ""), username: String(data.get("username") ?? "") });
          notice("تم حفظ الملف.");
          setTimeout(refresh, 350);
        } catch (error) {
          notice(errorMessage(error), "error");
        } finally {
          setFormBusy(form, false);
        }
      });
      $("#logout")?.addEventListener("click", async () => {
        await platform.signOut();
        navigate("/");
      });
    }
  };
}
function inventoryPage() {
  const session = platform.getSession();
  const gate = requireAccount(session);
  if (gate) return { active: "account", title: "المقتنيات", description: "مقتنيات حساب BACKFIRE.", html: shell("حسابي", "المقتنيات", "العناصر المملوكة والمفعّلة.", gate) };
  const inventory = platform.getInventory();
  const owned = PRODUCTS.filter((product) => inventory.ownedProductIds.includes(product.id));
  return {
    active: "account",
    title: "المقتنيات",
    description: "إدارة مقتنيات BACKFIRE.",
    html: shell("حسابي", "المقتنيات", "فعّل مظهرًا واحدًا من كل فئة.", `${accountTabs("inventory")}<div id="product-notice" role="status" aria-live="polite" hidden></div><section class="inventory-grid">${owned.map((product) => {
      const active = inventory.equipped[product.category] === product.id;
      return `<article class="inventory-item panel"><div class="inventory-glyph" style="--accent:${product.accent}">${h(product.glyph)}</div><div><span>${categoryLabel(product.category)}</span><h2>${h(product.name)}</h2></div><button class="btn sm ${active ? "unequip" : "equip"}" data-product="${product.id}" ${product.id === "theme-original" && active ? "disabled" : ""}>${active ? product.id === "theme-original" ? "الأساسي" : "إلغاء التفعيل" : "تفعيل"}</button></article>`;
    }).join("")}</section>${owned.length < PRODUCTS.length ? '<div class="account-nudge"><p>تبغى خيارات أكثر للمجلس؟</p><a class="btn" data-link="/store">تصفح المتجر</a></div>' : ""}`),
    bind(_navigate, refresh) {
      document.querySelectorAll(".equip").forEach((button) => button.addEventListener("click", async () => {
        try {
          await platform.equipProduct(button.dataset.product);
          notice("تم تفعيل العنصر.");
          setTimeout(refresh, 300);
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      }));
      document.querySelectorAll(".unequip").forEach((button) => button.addEventListener("click", async () => {
        try {
          await platform.unequipProduct(button.dataset.product);
          notice("تم إلغاء تفعيل العنصر.");
          setTimeout(refresh, 300);
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      }));
    }
  };
}
function settingsPage() {
  const session = platform.getSession();
  const gate = requireAccount(session);
  if (gate) return { active: "account", title: "الإعدادات", description: "إعدادات حساب BACKFIRE.", html: shell("حسابي", "الإعدادات", "التحكم بالتجربة والخصوصية.", gate) };
  const settings = platform.getSettings();
  const toggle = (name, label, description) => `<label class="setting-row"><span><b>${label}</b><small>${description}</small></span><input type="checkbox" name="${name}" ${settings[name] === true || name === "textScale" && settings.textScale === "large" ? "checked" : ""}></label>`;
  return {
    active: "account",
    title: "الإعدادات",
    description: "إعدادات تجربة وخصوصية BACKFIRE.",
    html: shell("حسابي", "الإعدادات", "كل إعداد واضح ويُحفظ على هذا الجهاز.", `${accountTabs("settings")}<form id="settings-form"><div id="product-notice" role="status" aria-live="polite" hidden></div><section class="settings-section panel"><h2>عام</h2><label class="select-row"><span><b>اللغة</b><small>واجهة عربية كاملة حاليًا.</small></span><select class="input" disabled><option>العربية</option></select></label><label class="select-row"><span><b>المظهر</b><small>هوية دسّ الليلية هي المظهر المصمم بالكامل.</small></span><select class="input" disabled><option>دسّ الأصلي</option></select></label>${toggle("highContrast", "تباين مرتفع", "زيادة وضوح الحدود والنصوص.")}${toggle("textScale", "نص أكبر", "تكبير نصوص صفحات المنتج.")}</section><section class="settings-section panel"><h2>الصوت والحركة</h2>${toggle("muted", "كتم الصوت", "إيقاف مؤثرات الموقع.")}${toggle("animations", "الحركات", "تشغيل انتقالات الواجهة.")}${toggle("reducedMotion", "تقليل الحركة", "تخفيف المؤثرات المستمرة.")}${toggle("haptics", "الاهتزاز", "ردود فعل لمسية على الجوال عند دعمها.")}<label class="range-row"><span>صوت المؤثرات <output>${settings.effectsVolume}%</output></span><input name="effectsVolume" type="range" min="0" max="100" value="${settings.effectsVolume}"></label><label class="range-row"><span>صوت الموسيقى <output>${settings.musicVolume}%</output></span><input name="musicVolume" type="range" min="0" max="100" value="${settings.musicVolume}"></label></section><section class="settings-section panel"><h2>اللعب</h2>${toggle("confirmCritical", "تأكيد القرارات الحرجة", "خطوة تأكيد قبل البيع أو القرار النهائي.")}${toggle("autoReady", "استعداد تلقائي", "غير مفعّل افتراضيًا حتى لا تبدأ بالغلط.")}<p class="field-help">تفضيلات المضيف والغرفة تحتاج ربط الحساب بالمضيف قبل تفعيلها.</p></section><section class="settings-section panel"><h2>التنبيهات</h2>${toggle("productUpdates", "تحديثات المنتج", "إشعارات محلية عن النسخ الجديدة.")}${toggle("matchInvites", "دعوات المباريات", "جاهزة لخدمة الدعوات المستقبلية.")}${toggle("friendInvites", "دعوات اللاعبين السابقين", "لا يوجد إرسال خارجي في وضع العرض.")}${toggle("purchaseReceipts", "إيصالات الشراء", "إيصالات العرض تظهر محليًا.")}${toggle("subscriptionReminders", "تذكير الاشتراك", "يتطلب خدمة اشتراك وتنبيهات.")}${toggle("marketing", "رسائل تسويقية", "غير مفعّلة افتراضيًا.")}</section><section class="settings-section panel"><h2>الخصوصية وملفات الارتباط</h2><label class="select-row"><span><b>ظهور الملف</b><small>اختيار محلي حتى تتوفر خدمة الملفات.</small></span><select class="input" name="profileVisibility"><option value="private" ${settings.profileVisibility === "private" ? "selected" : ""}>خاص</option><option value="players" ${settings.profileVisibility === "players" ? "selected" : ""}>لاعبو المجلس</option><option value="public" ${settings.profileVisibility === "public" ? "selected" : ""}>عام</option></select></label>${toggle("activityVisibility", "إظهار النشاط", "غير مفعّل افتراضيًا.")}${toggle("recentPlayerVisibility", "الظهور للاعبين السابقين", "جاهز لخدمة الدعوات المستقبلية.")}${toggle("analytics", "تحليلات الاستخدام", "غير مفعّلة في وضع العرض.")}${toggle("functionalCookies", "تخزين وظيفي", "يستخدم الموقع التخزين المحلي لتفضيلات العرض.")}</section><button class="btn primary" type="submit">حفظ الإعدادات</button></form><section class="settings-section account-actions panel"><h2>الحساب والبيانات</h2><div><span><b>تغيير البريد أو كلمة المرور</b><small>يتطلب مزود هوية موصولًا.</small></span><button class="btn sm" disabled>غير متاح</button></div><div><span><b>الحسابات المتصلة</b><small>لا توجد موفّرات خارجية.</small></span><button class="btn sm" disabled>لا يوجد</button></div><div><span><b>تصدير البيانات</b><small>البيانات التجريبية موجودة في المتصفح فقط.</small></span><button id="export-local" class="btn sm">تنزيل نسخة محلية</button></div><div><span><b>الخروج من كل الجلسات</b><small>لا توجد جلسات خادم في وضع العرض.</small></span><button class="btn sm" disabled>غير متاح</button></div></section><section class="danger-zone panel"><h2>حذف البيانات المحلية</h2><p>يمسح الحساب والمقتنيات والإعدادات التجريبية من هذا المتصفح فقط.</p>${field("delete-confirm", "اكتب: احذف حسابي")}<div class="danger-actions"><button id="delete-account" class="btn danger-outline">حذف البيانات</button><button id="cancel-delete" class="btn ghost">إلغاء</button></div></section>`),
    bind(navigate) {
      document.querySelectorAll('input[type="range"]').forEach((range) => range.addEventListener("input", () => {
        const output = range.closest("label")?.querySelector("output");
        if (output) output.textContent = `${range.value}%`;
      }));
      $("#settings-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        try {
          platform.updateSettings({
            muted: data.get("muted") === "on",
            animations: data.get("animations") === "on",
            reducedMotion: data.get("reducedMotion") === "on",
            haptics: data.get("haptics") === "on",
            confirmCritical: data.get("confirmCritical") === "on",
            autoReady: data.get("autoReady") === "on",
            productUpdates: data.get("productUpdates") === "on",
            matchInvites: data.get("matchInvites") === "on",
            friendInvites: data.get("friendInvites") === "on",
            purchaseReceipts: data.get("purchaseReceipts") === "on",
            subscriptionReminders: data.get("subscriptionReminders") === "on",
            marketing: data.get("marketing") === "on",
            activityVisibility: data.get("activityVisibility") === "on",
            recentPlayerVisibility: data.get("recentPlayerVisibility") === "on",
            analytics: data.get("analytics") === "on",
            functionalCookies: data.get("functionalCookies") === "on",
            effectsVolume: Number(data.get("effectsVolume")),
            musicVolume: Number(data.get("musicVolume")),
            highContrast: data.get("highContrast") === "on",
            textScale: data.get("textScale") === "on" ? "large" : "normal",
            profileVisibility: data.get("profileVisibility")
          });
          notice("تم حفظ الإعدادات.");
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
      $("#export-local")?.addEventListener("click", () => {
        const payload = JSON.stringify({ exportedAt: (/* @__PURE__ */ new Date()).toISOString(), demo: true, session: platform.getSession(), profile: platform.getProfile(), settings: platform.getSettings(), inventory: platform.getInventory(), receipts: platform.getPurchaseHistory() }, null, 2);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
        link.download = "backfire-demo-data.json";
        link.click();
        URL.revokeObjectURL(link.href);
      });
      $("#delete-account")?.addEventListener("click", async () => {
        try {
          await platform.deleteLocalAccount($('[name="delete-confirm"]')?.value ?? "");
          navigate("/");
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
      $("#cancel-delete")?.addEventListener("click", () => {
        const input = $('[name="delete-confirm"]');
        if (input) input.value = "";
        notice("أُلغي الحذف ولم تتغير البيانات.");
      });
    }
  };
}
function historyPage() {
  const session = platform.getSession();
  const gate = requireAccount(session);
  const matches = session ? platform.getMatchHistory() : [];
  const content = gate ?? `${accountTabs("history")}${matches.length ? `<section class="history-list">${matches.map((match) => `<a class="panel" data-link="/account/history/match?id=${encodeURIComponent(match.id)}"><b>${h(match.roomLabel)}</b><span>${new Date(match.playedAt).toLocaleDateString("ar-SA")}</span></a>`).join("")}</section>` : '<section class="empty-state panel"><span class="empty-glyph">↗</span><h2>ما فيه مباريات محفوظة</h2><p>المباريات الحالية لا تُنسب إلى الحساب بعد. لن نعرض سجلًا مختلقًا.</p><a class="btn primary" data-link="/create">ابدأ مباراة</a></section><section class="history-empty-grid"><article class="panel"><h2>اللاعبون السابقون</h2><p>لا توجد بيانات موثوقة للدعوة أو الحظر. ستظهر هنا بعد ربط هوية اللاعب بالمباراة.</p></article><article class="panel"><h2>الغرف السابقة</h2><p>لا نحفظ أكواد الغرف المنتهية في المتصفح، ولا نعيد فتح غرفة مدمرة.</p></article></section>'}`;
  return { active: "account", title: "سجل المباريات", description: "سجل مباريات حساب BACKFIRE.", html: shell("حسابي", "سجل المباريات", "نتائجك عندما تتوفر مزامنة الحساب.", content) };
}
function matchDetailPage(params) {
  const session = platform.getSession();
  const gate = requireAccount(session);
  if (gate) return { active: "account", title: "تفاصيل المباراة", description: "تفاصيل مباراة BACKFIRE.", html: shell("حسابي", "تفاصيل المباراة", "ملخص آمن بعد نهاية اللعبة.", gate) };
  const id2 = params.get("id") ?? "";
  const match = platform.getMatchHistory().find((candidate) => candidate.id === id2);
  if (!match) return { active: "account", title: "المباراة غير موجودة", description: "لم نجد مباراة محفوظة.", html: shell("سجل المباريات", "المباراة غير موجودة", "لم نجد سجلًا موثوقًا بهذا المعرّف.", `<section class="empty-state panel"><span class="empty-glyph">؟</span><h2>لا نعرض تفاصيل مختلقة</h2><p>قد يكون السجل حُذف أو لم يُزامن أصلًا. الأسرار غير المكشوفة لا تُحفظ هنا.</p><a class="btn" data-link="/account/history">العودة للسجل</a></section>`) };
  return { active: "account", title: match.roomLabel, description: "ملخص مباراة محفوظة.", html: shell("سجل المباريات", h(match.roomLabel), "أحداث عامة فقط، من دون أسرار غير مكشوفة.", `<section class="prose-page panel"><p>${new Date(match.playedAt).toLocaleString("ar-SA")}</p><p>اللاعبون: ${match.players} · الجولات: ${match.rounds} · المدة: ${match.durationMinutes} دقيقة</p><p>الفائز: ${h(match.winnerName)}</p></section>`) };
}
function achievementsPage() {
  const session = platform.getSession();
  const gate = requireAccount(session);
  const content = gate ?? `${accountTabs("achievements")}<section class="empty-state panel"><span class="empty-glyph">✦</span><h2>الإنجازات تحت التجهيز</h2><p>لن نعرض شارات أو تقدمًا وهميًا. هذه الصفحة جاهزة لربطها بخدمة النتائج الموثوقة.</p><a class="btn" data-link="/how-to-play">راجع طريقة اللعب</a></section>`;
  return { active: "account", title: "الإنجازات", description: "إنجازات BACKFIRE المستقبلية.", html: shell("حسابي", "الإنجازات", "إنجازات مرتبطة باللعب الحقيقي فقط.", content) };
}
function billingPage() {
  const session = platform.getSession();
  const gate = requireAccount(session);
  const receipts = session ? platform.getPurchaseHistory() : [];
  const premium = session?.plan !== "free";
  const content = gate ?? `${accountTabs("billing")}<div id="product-notice" role="status" aria-live="polite" hidden></div><section class="billing-summary panel"><div><span>الباقة الحالية</span><h2>${h(planById(session.plan)?.name ?? "مجلس")}</h2><small>${premium ? "اشتراك عرض محلي · بلا تجديد أو خصم تلقائي" : "الباقة الأساسية بلا رسوم"}</small></div><div class="billing-actions"><a class="btn" data-link="/pricing">${premium ? "تغيير الباقة" : "عرض الباقات"}</a>${premium ? '<button id="cancel-plan" class="btn danger-outline">إلغاء اشتراك العرض</button>' : ""}</div></section><h2 class="section-label">السجل المحلي</h2>${receipts.length ? `<section class="receipt-list">${receipts.map((receipt) => `<article class="panel"><div><b>${h(receipt.label)}</b><span>إيصال عرض · لم تُخصم أموال · ${new Date(receipt.createdAt).toLocaleDateString("ar-SA")}</span></div><strong>${formatPrice({ amountMinor: receipt.totalMinor, currency: "SAR", interval: "one-time", taxInclusive: true })}</strong></article>`).join("")}</section>` : '<section class="empty-state panel compact"><h2>لا توجد عمليات</h2><p>أي تجربة شراء ناجحة ستظهر هنا بإشارة واضحة أنها محلية.</p></section>'}`;
  return {
    active: "account",
    title: "الفوترة",
    description: "باقة وفواتير حساب BACKFIRE.",
    html: shell("حسابي", "الفوترة", "الباقة وسجل تجارب الدفع المحلية.", content),
    bind(_navigate, refresh) {
      $("#cancel-plan")?.addEventListener("click", async (event) => {
        const button = event.currentTarget;
        if (button.dataset.confirmed !== "true") {
          button.dataset.confirmed = "true";
          button.textContent = "أكد إلغاء اشتراك العرض";
          notice("اضغط مرة ثانية للتأكيد. يمكنك مغادرة الصفحة للإلغاء.");
          return;
        }
        try {
          await platform.cancelSubscription();
          notice("أُلغي اشتراك العرض وعاد الحساب إلى الباقة المجانية.");
          setTimeout(refresh, 450);
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
    }
  };
}
function checkoutPage(params) {
  const kind = params.get("kind") === "plan" ? "plan" : "product";
  const referenceId = params.get("id") ?? "";
  const interval = params.get("interval") === "year" ? "year" : "month";
  const product = kind === "product" ? productById(referenceId) : void 0;
  const plan = kind === "plan" ? planById(referenceId) : void 0;
  const item = product ?? plan;
  const price = product?.price ?? (interval === "year" ? plan?.yearly : plan?.monthly);
  if (!item || !price || product?.comingSoon || plan?.id === "free") return notFoundPage("الاختيار غير متاح", "ارجع للمتجر واختر عنصرًا متاحًا.");
  const session = platform.getSession();
  const gate = requireAccount(session, `/checkout?kind=${kind}&id=${encodeURIComponent(referenceId)}&interval=${interval}`);
  const content = gate ?? `<section class="checkout-layout"><div class="checkout-main panel"><div id="product-notice" role="status" aria-live="polite" hidden></div><div class="checkout-demo-seal">تجربة دفع — لا خصم حقيقي</div><h2>راجع طلبك</h2><div class="checkout-item"><div class="checkout-glyph">${h(product?.glyph ?? "◇")}</div><div><b>${h(item.name)}</b><span>${kind === "plan" ? `اشتراك ${interval === "year" ? "سنوي" : "شهري"}` : categoryLabel(product.category)}</span></div><strong>${formatPrice(price)}</strong></div><dl class="checkout-total"><div><dt>المجموع الفرعي</dt><dd>${formatPrice(price)}</dd></div><div><dt>الخصم</dt><dd>—</dd></div><div><dt>الضريبة</dt><dd>مشمولة</dd></div><div class="grand"><dt>الإجمالي</dt><dd>${formatPrice(price)}</dd></div></dl><label class="field"><span>رمز خصم — غير موصول</span><input class="input" value="" placeholder="لا توجد رموز نشطة" disabled></label><div class="sandbox-method"><span>◇</span><div><b>محاكي الدفع المحلي</b><small>لا بطاقة · لا تحويل · لا حفظ بيانات مالية</small></div></div><label class="check-row"><input id="checkout-consent" type="checkbox"><span>أفهم أن هذه تجربة محلية ولن يتم خصم أي مبلغ.</span></label><button id="start-checkout" class="btn primary wide">إنشاء جلسة العرض</button><div id="checkout-actions" class="checkout-actions" hidden><button class="btn primary" data-outcome="succeeded">محاكاة نجاح</button><button class="btn" data-outcome="failed">محاكاة فشل</button><button class="btn" data-outcome="timed-out">محاكاة انتهاء المهلة</button><button class="btn ghost" data-outcome="cancelled">إلغاء</button></div></div><aside class="checkout-aside panel"><h2>واضح من البداية</h2><ul><li>لا حقول بطاقة في وضع العرض.</li><li>السعر من كتالوج مركزي، لا من الرابط.</li><li>الفشل والإلغاء لا يمنحان العنصر.</li><li>النجاح ينشئ إيصال عرض محليًا.</li></ul><a data-link="/legal/refunds">سياسة الاسترجاع</a><a data-link="/legal/terms">شروط الشراء</a></aside></section>`;
  let checkoutId = "";
  return {
    active: "store",
    title: "إتمام الطلب",
    description: "مراجعة طلب BACKFIRE في وضع العرض.",
    html: shell("الطلب", "إتمام آمن وواضح", "لن نطلب بيانات بطاقة ما دام مزود الدفع غير موصول.", content),
    bind(navigate) {
      $("#start-checkout")?.addEventListener("click", async () => {
        if (!$("#checkout-consent")?.checked) return notice("أكد فهمك أن العملية تجريبية.", "error");
        try {
          const checkout = await platform.createCheckout(kind, referenceId, interval);
          checkoutId = checkout.id;
          $("#checkout-actions")?.removeAttribute("hidden");
          const button = $("#start-checkout");
          if (button) {
            button.disabled = true;
            button.textContent = "تم إنشاء الجلسة";
          }
          notice("جلسة العرض جاهزة. اختر نتيجة الاختبار.");
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
      document.querySelectorAll("[data-outcome]").forEach((button) => button.addEventListener("click", async () => {
        if (!checkoutId) return;
        try {
          const checkout = await platform.completeDemoCheckout(checkoutId, button.dataset.outcome);
          navigate(`/checkout/result?status=${checkout.status}&kind=${kind}`);
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      }));
    }
  };
}
function checkoutResultPage(params) {
  const status = params.get("status");
  const success = status === "succeeded";
  const labels = {
    failed: ["تعذرت تجربة الدفع", "لم يُمنح عنصر أو اشتراك. يمكنك الرجوع والمحاولة مرة ثانية."],
    cancelled: ["ألغيت العملية", "لم يحدث خصم ولم يُمنح أي شيء."],
    "timed-out": ["انتهت مهلة الجلسة", "أغلقت جلسة العرض قبل التأكيد. أنشئ جلسة جديدة للمحاولة."]
  };
  const [title, copy] = success ? ["نجحت تجربة الدفع", "تم تحديث المقتنيات وإنشاء إيصال عرض محلي. لم يتم خصم أي مبلغ."] : labels[status ?? ""] ?? ["حالة غير معروفة", "لا توجد نتيجة دفع صالحة في الرابط."];
  return {
    active: "store",
    title,
    description: copy,
    html: shell("نتيجة العرض", title, copy, `<section class="empty-state panel checkout-result ${success ? "success" : "failure"}"><span class="empty-glyph">${success ? "✓" : "×"}</span><h2>${success ? "عرض ناجح — بلا شحن مالي" : "لم تكتمل العملية"}</h2><p>${copy}</p><div class="empty-actions">${success ? '<a class="btn primary" data-link="/account/billing">عرض إيصال العرض</a><a class="btn" data-link="/account/inventory">المقتنيات</a>' : '<a class="btn primary" data-link="/store">العودة للمتجر</a><a class="btn" data-link="/support">المساعدة</a>'}</div></section>`)
  };
}
function supportPage(path = "/support") {
  const email = platform.getSession()?.email ?? "";
  const report = path === "/report-player";
  const heading = report ? "بلّغ عن لاعب" : path === "/contact" ? "تواصل معنا" : "وش نقدر نحل؟";
  return {
    active: "support",
    title: "الدعم",
    description: "مركز مساعدة ودعم BACKFIRE.",
    html: shell("الدعم", heading, "ابدأ بالحلول السريعة، أو احفظ طلبًا محليًا في وضع العرض.", `<section class="support-grid"><aside class="support-links"><a class="panel" data-link="/faq"><b>الأسئلة الشائعة</b><span>الحساب واللعب والدفع التجريبي.</span></a><a class="panel" data-link="/how-to-play"><b>شرح اللعبة</b><span>الجولات والقرارات والكشف.</span></a><article class="panel"><b>مشكلة دخول غرفة؟</b><span>تأكد من الكود، ثم حدّث الصفحة وحاول من نفس الرابط.</span></article><a class="panel" data-link="/status"><b>حالة الخدمة</b><span>ما هو موصول وما يزال تجريبيًا.</span></a></aside><form id="support-form" class="support-form panel"><div id="product-notice" role="status" aria-live="polite" hidden></div><label class="field"><span>نوع الطلب</span><select class="input" name="category"><option value="problem">مشكلة تقنية</option><option value="player-report" ${report ? "selected" : ""}>بلاغ لاعب</option><option value="suggestion">اقتراح</option><option value="billing">فوترة</option></select></label>${field("subject", "العنوان", "text", report ? "بلاغ عن سلوك لاعب" : "", 'maxlength="100" required')}${field("email", "البريد للرجوع إليك — اختياري", "email", email)}${field("roomCode", "كود الغرفة — اختياري", "text", "", 'maxlength="12" dir="ltr"')}<label class="field"><span>التفاصيل</span><textarea class="input" name="message" minlength="10" maxlength="2000" required></textarea></label><label class="check-row"><input name="technical" type="checkbox" checked><span>إرفاق إصدار المتصفح والمسار الحالي.</span></label><button class="btn primary" type="submit">حفظ الطلب محليًا</button><small class="muted">لن يصل الطلب إلى فريق دعم حتى يُوصل مزود التذاكر. لا تضف بيانات حساسة.</small></form></section>`),
    bind() {
      $("#support-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setFormBusy(form, true);
        const data = new FormData(form);
        try {
          await platform.saveSupportRequest({
            category: data.get("category"),
            subject: String(data.get("subject") ?? ""),
            message: String(data.get("message") ?? ""),
            email: String(data.get("email") ?? "") || void 0,
            roomCode: String(data.get("roomCode") ?? "") || void 0,
            technicalDetails: data.get("technical") === "on" ? `${navigator.userAgent} · ${location.pathname}` : void 0
          });
          form.reset();
          notice("حُفظ الطلب على هذا المتصفح فقط. لم يُرسل إلى خادم.");
        } catch (error) {
          notice(errorMessage(error), "error");
        } finally {
          setFormBusy(form, false);
        }
      });
    }
  };
}
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (!copied) throw new Error("تعذر النسخ. حدّد الرابط يدويًا.");
}
function invitePage(params) {
  const initial = h(normalizeRoomCode(params.get("code") ?? ""));
  return {
    active: "support",
    title: "مشاركة دعوة",
    description: "مشاركة رابط وكود غرفة BACKFIRE.",
    html: shell("دعوة المجلس", "أرسل الكود… وخلك جاهز", "الرابط يُبنى من نفس النطاق المفتوح الآن، بلا نطاق تطوير أو أسرار.", `<section class="invite-layout"><form id="invite-form" class="panel invite-form"><div id="product-notice" role="status" aria-live="polite" hidden></div>${field("code", "كود الغرفة", "text", initial, 'maxlength="12" dir="ltr" inputmode="text" autocapitalize="characters" required')}<button class="btn primary" type="submit">جهّز الدعوة</button></form><section id="invite-preview" class="panel invite-preview" hidden><span class="product-type">معاينة الدعوة</span><h2>تعالوا نلعب دسّ</h2><p id="invite-copy"></p><div class="invite-actions"><button id="copy-code" class="btn">نسخ الكود</button><button id="copy-link" class="btn">نسخ الرابط</button><button id="native-share" class="btn primary">مشاركة</button><a id="whatsapp-share" class="btn" target="_blank" rel="noopener noreferrer">واتساب</a></div><small>الرابط لا يحتوي رمز مضيف أو لاعب. الدعوة قد تنتهي إذا أُغلقت الغرفة أو امتلأت.</small></section></section>`),
    bind() {
      let code = "";
      let link = "";
      let message = "";
      $("#invite-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        code = normalizeRoomCode(new FormData(event.currentTarget).get("code"));
        if (!isRoomCode(code)) return notice("اكتب كود غرفة صحيحًا من ٨ خانات.", "error");
        link = new URL(`/join?code=${encodeURIComponent(code)}`, configuredPublicOrigin || location.origin).href;
        message = `تعالوا نلعب BACKFIRE 🎮
كود الغرفة: ${code}
ادخل من هنا: ${link}`;
        const copy = $("#invite-copy");
        if (copy) copy.textContent = message;
        const preview = $("#invite-preview");
        if (preview) preview.hidden = false;
        const whatsapp = $("#whatsapp-share");
        if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
        const share = $("#native-share");
        if (share) share.hidden = !("share" in navigator);
        notice("الدعوة جاهزة. تحقق من الكود قبل الإرسال.");
      });
      $("#copy-code")?.addEventListener("click", async () => {
        try {
          await copyText(code);
          notice("نُسخ كود الغرفة.");
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
      $("#copy-link")?.addEventListener("click", async () => {
        try {
          await copyText(link);
          notice("نُسخ رابط الانضمام.");
        } catch (error) {
          notice(errorMessage(error), "error");
        }
      });
      $("#native-share")?.addEventListener("click", async () => {
        try {
          if (navigator.share) await navigator.share({ title: "دعوة BACKFIRE", text: message, url: link });
        } catch (error) {
          if (error.name !== "AbortError") notice(errorMessage(error), "error");
        }
      });
      if (initial) $("#invite-form")?.requestSubmit();
    }
  };
}
function staticPage(path) {
  if (path === "/faq") return { active: "support", title: "الأسئلة الشائعة", description: "إجابات واضحة عن لعبة BACKFIRE وخدماتها — بلا وعود غير موصولة.", html: shell("المساعدة", "الأسئلة الشائعة", "كل شي بصراحة: كيف تلعبون، وش يشتغل الحين، ووش لسه على الطريق.", `<section class="faq-list wide">
    <h2 class="faq-group">اللعب</h2>
    <details open><summary>كم لاعب نحتاج؟</summary><p>من ٤ إلى ٨ لاعبين، كل واحد على جواله. وكل ما زاد العدد، زاد الشك والضغط على الطاولة.</p></details>
    <details><summary>هل نحتاج نحمّل تطبيق؟</summary><p>لا. كل شي من المتصفح — الشاشة والجوالات. بلا تحميل وبلا متجر تطبيقات.</p></details>
    <details><summary>هل لازم نسوي حساب؟</summary><p>لا. ادخلوا كضيوف والعبوا على طول. الحساب اختياري، يفيدك بس لحفظ إعداداتك وتخصيصك التجميلي — ما يغيّر شي في اللعب.</p></details>
    <details><summary>هل أقدر أدخل كضيف؟</summary><p>إي، وهذا الوضع الأساسي. تفتح الغرفة على الشاشة، وتدخل الشلة بالكود أو QR بلا أي تسجيل.</p></details>
    <details><summary>هل كل اللاعبين يحتاجون يشترون الطور؟</summary><p>لا. الطور الأساسي «المجلس» مجاني ضمن اللعبة، ويكفي إن الشاشة وحدها تفتحه للكل. باقي العوالم لسه «قريبًا» وما فيه شراء لها بعد.</p></details>
    <details><summary>هل نقدر نلعب على لابتوب موصول بالتلفزيون؟</summary><p>إي. أي شاشة كبيرة يشوفها الكل تنفع — تلفاز، أو لابتوب موصول، أو متصفح كبير. المهم تكون قدّام الجماعة.</p></details>
    <details><summary>كم تستغرق اللعبة؟</summary><p>الطور الأساسي غالبًا ١٥–٢٥ دقيقة عبر جولات متتابعة، وتقدرون تعيدون أكثر من مباراة ورا بعض.</p></details>
    <details><summary>هل القرارات سرية؟</summary><p>إي. تعلن نيّتك بصوت عالي إذا حبيت، بس قرارك الحقيقي يُقفل على جوالك وما يشوفه أحد إلى ما تكشفه الشاشة.</p></details>
    <details><summary>وش يصير لو فصل جوال واحد؟</summary><p>يرجع اللاعب لنفس مقعده بنفس معلوماته السرّية عبر إعادة الاتصال، بلا ما تختلط الأوراق.</p></details>
    <details><summary>هل نقدر نعيد اللعب بنفس الشلة؟</summary><p>إي. تقدرون تبدون مباراة جديدة على طول بنفس الغرفة ونفس الشلة.</p></details>
    <details><summary>هل كل الأطوار لها نفس عدد الجولات؟</summary><p>لا. كل عالم له إيقاعه وطوله ومستوى توتره — مو كلهم نفس عدد الجولات.</p></details>
    <h2 class="faq-group">الحساب والخدمات</h2>
    <details><summary>هل المشتريات حقيقية؟</summary><p>لا حاليًا. المتجر والدفع يشتغلون كمحاكاة محلية واضحة، وما يطلبون بطاقة.</p></details>
    <details><summary>هل تتزامن بياناتي بين الأجهزة؟</summary><p>لا. الحساب والمقتنيات والإعدادات التجريبية محفوظة على هذا المتصفح فقط.</p></details>
    <details><summary>كيف أبلّغ عن لاعب؟</summary><p>استخدم نموذج البلاغ المحلي، مع العلم أنه ما يُرسل لفريق إلى أن تُوصل خدمة الدعم.</p><a data-link="/report-player">فتح نموذج البلاغ</a></details>
    <details><summary>وش المتصفحات المناسبة؟</summary><p>إصدار حديث من Chrome أو Safari أو Edge مع JavaScript واتصال ثابت. التلفاز يحتاج متصفحًا حديثًا أو جهاز بث يدعمه.</p></details>
  </section>`) };
  if (path === "/credits") return { title: "الاعتمادات", description: "اعتمادات بناء BACKFIRE.", html: shell("BACKFIRE", "الاعتمادات", "المنتج مبني بهوية عربية أصلية وتقنيات ويب مفتوحة.", `<section class="prose-page panel"><h2>التصميم والمنتج</h2><p>هوية BACKFIRE ونظامها البصري ومحتواها العربي جزء من المنتج نفسه.</p><h2>التقنيات</h2><p>TypeScript وesbuild وواجهات الويب القياسية، مع توليد QR محليًا. الخط المستخدم هو Tajawal عبر Google Fonts.</p><h2>المحتوى البصري</h2><p>الرسوم الأساسية وواجهات اللعبة مبنية بالكود. صورة المشاركة الاجتماعية مولدة خصيصًا لهذا المشروع ومراجعة للاستخدام الحالي.</p></section>`) };
  if (path === "/about") return { title: "عن BACKFIRE", description: "عن لعبة BACKFIRE ورؤيتها.", html: shell("عن BACKFIRE", "كل حركة لها عواقب", "نبني لحظة جماعية حقيقية حول شاشة واحدة، مو عزلة داخل كل جوال.", `<section class="prose-page panel"><h2>الفكرة</h2><p>BACKFIRE تجربة سيناريوهات جماعية: التلفاز يعرض المشهد العام، وكل جوال يحمل معلومة أو حركة مختلفة. قرارات اللاعبين تغيّر ما يعود إلى الشاشة عبر الجولات.</p><h2>مبادئنا</h2><p>العربية أصل المنتج، والوضوح أهم من الإلحاح التجاري، واللعبة الأساسية لا تُباع على شكل أفضلية.</p><h2>هذه المرحلة</h2><p>إنشاء الغرف والانضمام وإعادة الاتصال تعمل، بينما نظام السيناريو والعواقب الجديد ما زال قيد التطوير. الحساب والمتجر والدفع معروضة الآن من خلال مزود محلي صريح إلى أن تُوصل خدمات الإنتاج.</p></section>`) };
  if (path === "/status") return { title: "حالة الخدمة", description: "حالة أنظمة BACKFIRE.", html: shell("الحالة", "الأنظمة بوضوح", "تحديث محلي يصف ما هو عامل وما يحتاج مزود إنتاج.", `<section class="status-list panel"><article><i class="ok"></i><div><b>إنشاء الغرف والانضمام</b><span>مسار الإنتاج الحالي — تتم مراقبته باختبارات المستودع.</span></div><strong>متاح</strong></article><article><i class="ok"></i><div><b>موقع BACKFIRE العام</b><span>الصفحات والملفات الثابتة.</span></div><strong>متاح</strong></article><article><i class="demo"></i><div><b>الحسابات والمقتنيات</b><span>مزود عرض محلي، بلا مزامنة أجهزة.</span></div><strong>عرض</strong></article><article><i class="demo"></i><div><b>الدفع والبريد والدعم</b><span>غير موصولة بمزودي إنتاج.</span></div><strong>غير موصول</strong></article></section>`) };
  if (path === "/changelog") return { title: "سجل التغييرات", description: "أحدث تغييرات منتج BACKFIRE.", html: shell("التحديثات", "وش تغيّر؟", "سجل مختصر لما وصل فعليًا، من غير وعود منجزة وهمية.", `<section class="timeline"><article class="panel"><time>يوليو ٢٠٢٦</time><h2>هوية BACKFIRE العامة</h2><ul><li>موقع تسويقي جديد مبني حول التلفاز والجوالات والعواقب المتغيرة.</li><li>هوية سينمائية قرمزية مستقلة عن واجهات اللعب الحالية.</li><li>شرح صريح لما يعمل وما يزال قيد التطوير.</li></ul></article><article class="panel"><time>الإصدار الأساسي</time><h2>تثبيت تدفق الغرف</h2><ul><li>إنشاء الغرفة والانضمام اليدوي والـQR.</li><li>استرجاع المضيف ومنع الانضمام المكرر.</li><li>إعادة اتصال اللاعب.</li></ul></article></section>`) };
  if (path === "/legal/privacy") return { title: "سياسة الخصوصية", description: "سياسة خصوصية دسّ الحالية.", html: legal("سياسة الخصوصية", `<h2>ملخص هذه النسخة</h2><p>صفحات الحساب والمتجر تستخدم تخزين المتصفح المحلي في وضع العرض. لا ترسل هذه الطبقة بيانات حساب أو دفع أو دعم إلى خادم.</p><h2>بيانات اللعب</h2><p>خدمة الغرف تعالج كود الغرفة واسم اللاعب والرموز اللازمة للاتصال وتشغيل المباراة. لا تعرض رمز المضيف داخل QR.</p><h2>التحكم</h2><p>يمكنك تنزيل نسخة من بيانات العرض أو حذفها من صفحة الإعدادات. مسح بيانات الموقع من المتصفح يزيلها أيضًا.</p><h2>قبل الإطلاق التجاري</h2><p>يلزم تحديد جهة التحكم بالبيانات، مدد الاحتفاظ، مزودي الاستضافة والدفع والبريد، وقناة طلبات الخصوصية قبل تفعيل خدمات الحساب الحقيقية.</p>`) };
  if (path === "/legal/refunds") return { title: "سياسة الاسترجاع", description: "حالة سياسة استرجاع دسّ.", html: legal("سياسة الاسترجاع", `<h2>لا توجد مبيعات فعلية الآن</h2><p>مسار الدفع الحالي عرض محلي ولا يخصم أموالًا، لذلك لا توجد عملية قابلة للاسترجاع.</p><h2>قبل تفعيل الدفع</h2><p>يجب نشر مدة طلب الاسترجاع، العناصر غير القابلة للاسترجاع، معالجة الاشتراكات، قناة التواصل، ومدة إعادة المبلغ وفق نظام الدفع والأنظمة المطبقة.</p><h2>إيصالات العرض</h2><p>الإيصال التجريبي يحمل علامة واضحة ولا يمثل مستندًا ضريبيًا أو إثبات دفع.</p>`) };
  if (path === "/legal/cookies") return { title: "سياسة ملفات الارتباط", description: "التخزين المحلي في دسّ.", html: legal("ملفات الارتباط والتخزين", `<h2>ما نستخدمه الآن</h2><p>طبقة المنتج التجريبية تستخدم localStorage لحفظ الجلسة المحلية والإعدادات والمقتنيات، وsessionStorage لتذكر زيارة الواجهة في الجلسة الحالية.</p><h2>التحليلات</h2><p>لا توجد خدمة تحليلات خارجية موصولة في هذه الطبقة، والموافقة غير مفعلة افتراضيًا.</p><h2>التحكم</h2><p>يمكنك تغيير تفضيلات التخزين الوظيفي والتحليلات من الإعدادات وحذف بيانات العرض بالكامل.</p>`) };
  return { title: "الشروط", description: "شروط استخدام دسّ الحالية.", html: legal("شروط الاستخدام والشراء", `<h2>اللعبة</h2><p>استخدم دسّ باحترام ومن دون إساءة أو تحايل أو محاولة الوصول إلى صلاحيات المضيف.</p><h2>وضع العرض</h2><p>الحسابات والإيصالات والمشتريات الظاهرة في وضع العرض محلية وتجريبية. لا تمثل عقد بيع ولا خصمًا ماليًا ولا اشتراكًا حقيقيًا.</p><h2>الأسعار</h2><p>الأسعار المعروضة بالريال السعودي وتشمل الضريبة على سبيل تصميم الكتالوج. لا تُقبل مدفوعات حتى يوصل مزود دفع إنتاجي وتُنشر سياسة استرداد نهائية.</p><h2>المحتوى والسلوك</h2><p>يمكن تقييد الوصول عند إساءة استخدام الخدمة أو محاولة تعطيلها. البلاغات في وضع العرض لا تُرسل إلى فريق دعم.</p>`) };
}
function legal(title, content) {
  return shell("قانوني", title, "نسخة تشغيلية واضحة لهذه المرحلة، وتحتاج مراجعة قانونية قبل البيع الفعلي.", `<article class="prose-page panel"><div class="legal-meta">آخر تحديث: ١٨ يوليو ٢٠٢٦ · نسخة قبل البيع الحقيقي</div>${content}<p class="legal-note">هذه الصياغة منتجية وليست بديلًا عن مراجعة مستشار قانوني في مناطق التشغيل.</p></article>`);
}
function accountLanding() {
  return profilePage();
}
function notFoundPage(title = "الصفحة غير موجودة", copy = "يمكن أن الرابط تغيّر أو أن الصفحة غير متاحة.") {
  return { title: "غير موجود", description: copy, html: shell("٤٠٤", title, copy, `<section class="empty-state panel"><span class="empty-glyph">؟</span><h2>نرجعك للمجلس</h2><div class="empty-actions"><a class="btn primary" data-link="/">الرئيسية</a><a class="btn" data-link="/support">الدعم</a></div></section>`) };
}
function renderProductPage(path, search = "") {
  if (path === "/store") return storePage();
  if (path === "/store/product") return productDetailPage(new URLSearchParams(search));
  if (path === "/pricing") return pricingPage();
  if (path === "/login") return loginPage();
  if (path === "/signup") return signupPage();
  if (path === "/forgot-password") return forgotPage();
  if (["/reset-password", "/verify-email", "/session-ended"].includes(path)) return authStatePage(path);
  if (path === "/account") return accountLanding();
  if (path === "/account/profile") return profilePage();
  if (path === "/account/settings") return settingsPage();
  if (path === "/account/inventory") return inventoryPage();
  if (path === "/account/history") return historyPage();
  if (path === "/account/history/match") return matchDetailPage(new URLSearchParams(search));
  if (path === "/account/achievements") return achievementsPage();
  if (path === "/account/billing") return billingPage();
  if (path === "/checkout") return checkoutPage(new URLSearchParams(search));
  if (path === "/checkout/result") return checkoutResultPage(new URLSearchParams(search));
  if (["/support", "/contact", "/report-player"].includes(path)) return supportPage(path);
  if (path === "/invite") return invitePage(new URLSearchParams(search));
  if (["/faq", "/about", "/credits", "/status", "/changelog", "/legal/privacy", "/legal/terms", "/legal/refunds", "/legal/cookies"].includes(path)) return staticPage(path);
  return notFoundPage();
}

// apps/dasssite/src/product/product-css.ts
function productCss() {
  return `
  .product-page{position:relative;z-index:var(--z-content);width:min(1180px,calc(100% - 40px));min-height:75dvh;margin:0 auto;padding:clamp(54px,8vw,96px) 0 100px}
  .product-page{animation:productEnter .38s var(--e-out) both}.product-page:focus{outline:none}@keyframes productEnter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .product-hero{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid var(--line)}
  .product-hero>div{max-width:760px}.product-hero h1{font-size:clamp(42px,7vw,82px);line-height:1.05;margin:10px 0 14px;letter-spacing:-.04em}.product-hero p{font-size:var(--fs-h3);line-height:1.7;color:var(--text-2);margin:0;max-width:62ch}
  .demo-banner{display:flex;align-items:flex-start;gap:12px;margin:0 0 26px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--gold) 35%,transparent);border-radius:var(--r-2);background:color-mix(in srgb,var(--gold) 7%,var(--surface));color:var(--text-2)}
  .demo-banner>div{display:grid;gap:3px}.demo-banner b{color:var(--gold)}.demo-banner span:last-child{font-size:14px}.demo-dot{width:9px;height:9px;border-radius:50%;background:var(--gold);box-shadow:0 0 16px var(--gold);margin-top:7px;flex:0 0 auto}.demo-banner.unavailable{border-color:color-mix(in srgb,var(--red) 40%,transparent)}.demo-banner.unavailable .demo-dot{background:var(--red)}
  .product-notice{padding:12px 14px;border-radius:12px;background:color-mix(in srgb,var(--green) 12%,var(--surface));border:1px solid color-mix(in srgb,var(--green) 34%,transparent);color:var(--green);font-weight:800;margin-bottom:14px}.product-notice.error{color:var(--red);background:color-mix(in srgb,var(--red) 10%,var(--surface));border-color:color-mix(in srgb,var(--red) 34%,transparent)}
  .auth-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.72fr);gap:20px;max-width:900px;margin:0 auto}.auth-card{width:min(100%,560px);margin:0 auto;padding:clamp(24px,4vw,38px);display:flex;flex-direction:column;gap:17px}.auth-side{padding:clamp(28px,5vw,54px);border:1px solid var(--line-2);border-radius:var(--r-3);background:radial-gradient(circle at top right,color-mix(in srgb,var(--violet) 24%,transparent),transparent 55%),var(--surface);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:14px}.auth-side h2,.auth-side p{margin:0}.auth-side p{line-height:1.65;color:var(--text-2)}.auth-seal{width:70px;height:70px;border-radius:22px;display:grid;place-items:center;font-size:22px;font-weight:900;color:var(--gold);border:1px solid color-mix(in srgb,var(--gold) 35%,transparent);background:color-mix(in srgb,var(--gold) 8%,var(--surface))}.text-link,.form-foot a,.checkout-aside a,.legal-note a{color:var(--gold);font-weight:800;text-decoration:none}.auth-card>.text-link{text-align:center}.form-foot{text-align:center;color:var(--muted);margin:0}.form-grid{max-width:620px}
  .field{display:grid;gap:8px;text-align:start}.field>span{font-weight:800;color:var(--text-2);font-size:14px}.field textarea{min-height:150px;resize:vertical;padding-top:14px}.field select{appearance:auto}.check-row{display:flex;align-items:flex-start;gap:10px;color:var(--text-2);line-height:1.55;font-size:14px}.check-row input{margin-top:4px;accent-color:var(--gold);width:18px;height:18px;flex:0 0 auto}.check-row a{color:var(--gold);font-weight:800}.btn.ghost{background:transparent}.btn.danger-outline{border-color:color-mix(in srgb,var(--red) 50%,transparent);color:var(--red)}.btn.sm{min-height:38px;padding:8px 14px;font-size:14px}.btn[disabled]{opacity:.58;cursor:not-allowed;transform:none}
  .catalog-tools{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:28px 0}.filter-pills,.billing-toggle{display:flex;gap:5px;background:var(--surface);padding:5px;border:1px solid var(--line-2);border-radius:var(--r-pill);width:max-content}.filter-pills button,.billing-toggle button{border:0;border-radius:var(--r-pill);background:transparent;color:var(--muted);padding:9px 16px;font:inherit;font-weight:800;cursor:pointer}.filter-pills button.on,.billing-toggle button.on{background:var(--surface-3);color:var(--text);box-shadow:var(--shadow-1)}.catalog-note{margin:0;color:var(--muted);font-size:14px}
  .product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.product-card{overflow:hidden;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp)}.product-card:hover{transform:translateY(-5px);border-color:var(--line-3)}.product-art{height:190px;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 25%,transparent),transparent 66%),linear-gradient(135deg,color-mix(in srgb,var(--accent) 8%,var(--bg-1)),var(--bg-1));border-bottom:1px solid var(--line)}.product-art span{width:86px;height:86px;border-radius:27px;display:grid;place-items:center;color:var(--accent);font-size:28px;font-weight:900;border:1px solid color-mix(in srgb,var(--accent) 50%,transparent);box-shadow:0 18px 70px color-mix(in srgb,var(--accent) 17%,transparent);transform:rotate(-4deg)}.product-card-copy{padding:22px;display:flex;min-height:250px;flex-direction:column}.product-type{font-size:12px;font-weight:900;letter-spacing:.1em;color:var(--gold);text-transform:uppercase}.product-card h2{margin:7px 0;font-size:var(--fs-h3)}.product-card p{margin:0;color:var(--text-2);line-height:1.6}.product-card-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:auto;padding-top:20px}.product-card-foot>b{font-size:18px;color:var(--text)}
  .billing-toggle{margin:0 auto 26px}.billing-toggle button span{font-size:11px;color:var(--green);margin-inline-start:4px}.plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}.plan-card{position:relative;padding:28px 24px;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));display:flex;flex-direction:column;gap:24px}.plan-card.recommended{border-color:color-mix(in srgb,var(--gold) 60%,transparent);box-shadow:0 26px 90px color-mix(in srgb,var(--gold) 8%,transparent)}.plan-badge{position:absolute;top:0;inset-inline-end:20px;transform:translateY(-50%);background:var(--gold);color:var(--bg);padding:6px 12px;border-radius:var(--r-pill);font-size:12px;font-weight:900}.plan-card h2{font-size:var(--fs-h2);margin:6px 0}.plan-card p{color:var(--text-2);line-height:1.6;margin:0}.plan-price{display:flex;align-items:baseline;gap:8px}.plan-price b{font-size:clamp(25px,3vw,38px)}.plan-price span{color:var(--muted)}.plan-card ul{list-style:none;margin:0;padding:0;display:grid;gap:13px;color:var(--text-2);line-height:1.5;flex:1}.plan-card li::before{content:'✓';color:var(--green);margin-inline-end:9px;font-weight:900}.pricing-trust{padding:60px 0 0}.pricing-trust>h2{text-align:center}.pricing-trust>div{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.pricing-trust p{display:grid;gap:6px;padding:20px;border-top:1px solid var(--line-2)}.pricing-trust span{color:var(--muted)}
  .account-tabs{display:flex;gap:5px;overflow:auto;padding:5px;margin-bottom:22px;border:1px solid var(--line-2);background:var(--surface);border-radius:var(--r-2)}.account-tabs a{white-space:nowrap;color:var(--muted);text-decoration:none;font-weight:800;padding:10px 14px;border-radius:10px;cursor:pointer}.account-tabs a.on{color:var(--text);background:var(--surface-3)}.account-grid{display:grid;grid-template-columns:300px minmax(0,1fr);gap:20px}.profile-preview,.account-form{padding:28px}.profile-preview{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}.profile-preview h2{margin:7px 0 0}.profile-preview>span{color:var(--muted);direction:ltr}.profile-preview>i{font-style:normal;color:var(--gold);font-weight:800;font-size:13px}.profile-avatar{width:96px;height:96px;border-radius:32px;display:grid;place-items:center;font-size:38px;font-weight:900;color:var(--gold);background:radial-gradient(circle,color-mix(in srgb,var(--gold) 20%,var(--surface)),var(--surface));border:1px solid color-mix(in srgb,var(--gold) 40%,transparent)}.account-form{display:flex;flex-direction:column;gap:16px}.inventory-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.inventory-item{padding:18px;display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:16px}.inventory-glyph{width:70px;height:70px;border-radius:20px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);color:var(--accent);font-size:22px;font-weight:900}.inventory-item h2{margin:3px 0;font-size:18px}.inventory-item span{font-size:12px;color:var(--muted)}.account-nudge{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding:20px 4px;border-top:1px solid var(--line)}.account-nudge p{font-size:var(--fs-h3);font-weight:800}
  .settings-section{padding:24px;margin-bottom:16px}.settings-section h2{margin:0 0 12px}.setting-row{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:15px 0;border-top:1px solid var(--line)}.setting-row>span{display:grid;gap:4px}.setting-row small{color:var(--muted)}.setting-row input{appearance:none;width:50px;height:28px;border-radius:var(--r-pill);background:var(--surface-3);border:1px solid var(--line-2);position:relative;cursor:pointer;transition:.2s}.setting-row input::after{content:'';position:absolute;width:20px;height:20px;border-radius:50%;background:var(--muted);top:3px;inset-inline-start:4px;transition:.2s}.setting-row input:checked{background:color-mix(in srgb,var(--green) 25%,var(--surface));border-color:var(--green)}.setting-row input:checked::after{background:var(--green);transform:translateX(-21px)}.range-row{display:grid;gap:12px;padding:15px 0;border-top:1px solid var(--line)}.range-row span{display:flex;justify-content:space-between;font-weight:800}.range-row input{accent-color:var(--gold)}.danger-zone{padding:24px;margin-top:34px;border-color:color-mix(in srgb,var(--red) 35%,transparent)}.danger-zone h2{color:var(--red);margin-top:0}.danger-zone p{color:var(--text-2)}
  .empty-state{max-width:700px;margin:28px auto;padding:clamp(32px,6vw,70px);text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}.empty-state.compact{padding:34px}.empty-state h2,.empty-state p{margin:0}.empty-state p{color:var(--text-2);line-height:1.7;max-width:52ch}.empty-glyph{width:78px;height:78px;border-radius:25px;display:grid;place-items:center;background:var(--surface-3);color:var(--gold);font-size:34px;font-weight:900}.empty-actions{display:flex;gap:10px}.billing-summary{padding:25px;display:flex;align-items:center;justify-content:space-between}.billing-summary span{color:var(--muted)}.billing-summary h2{margin:5px 0}.section-label{margin:30px 0 14px}.receipt-list{display:grid;gap:10px}.receipt-list article{padding:18px;display:flex;align-items:center;justify-content:space-between}.receipt-list article>div{display:grid;gap:3px}.receipt-list span{color:var(--muted);font-size:13px}.receipt-list strong{color:var(--gold)}
  .checkout-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,.7fr);gap:20px}.checkout-main,.checkout-aside{padding:clamp(22px,4vw,36px)}.checkout-main h2,.checkout-aside h2{margin-top:0}.checkout-demo-seal{display:inline-block;padding:7px 10px;border-radius:8px;background:color-mix(in srgb,var(--gold) 12%,var(--surface));color:var(--gold);font-size:13px;font-weight:900;margin-bottom:20px}.checkout-item{display:grid;grid-template-columns:64px 1fr auto;gap:15px;align-items:center;padding:20px 0;border-block:1px solid var(--line)}.checkout-glyph{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:var(--surface-3);color:var(--gold);font-size:24px}.checkout-item>div:nth-child(2){display:grid;gap:4px}.checkout-item span{color:var(--muted)}.checkout-item strong{font-size:20px}.checkout-total{margin:18px 0}.checkout-total>div{display:flex;justify-content:space-between}.checkout-total dt{color:var(--text-2)}.checkout-total dd{margin:0;font-weight:900}.checkout-main>.btn{margin-top:18px}.checkout-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.checkout-aside ul{padding-inline-start:20px;color:var(--text-2);line-height:1.8}.checkout-aside a{display:inline-block;margin-top:10px}
  .support-grid{display:grid;grid-template-columns:minmax(240px,.65fr) minmax(0,1.35fr);gap:20px}.support-links{display:flex;flex-direction:column;gap:12px}.support-links>*{padding:20px;display:grid;gap:6px;color:inherit;text-decoration:none}.support-links span{color:var(--muted);line-height:1.5}.support-form{padding:28px;display:flex;flex-direction:column;gap:16px}
  .prose-page{max-width:820px;margin:0 auto;padding:clamp(26px,5vw,54px);font-size:17px;line-height:1.9}.prose-page h2{font-size:var(--fs-h2);margin:38px 0 4px}.prose-page h2:first-of-type{margin-top:10px}.prose-page p{color:var(--text-2)}.legal-meta{color:var(--gold);font-size:13px;font-weight:800;border-bottom:1px solid var(--line);padding-bottom:14px}.legal-note{border-top:1px solid var(--line);padding-top:18px;font-size:14px}.status-list{padding:10px 24px}.status-list article{display:grid;grid-template-columns:12px 1fr auto;gap:15px;align-items:center;padding:20px 0;border-bottom:1px solid var(--line)}.status-list article:last-child{border:0}.status-list i{width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 12px currentColor}.status-list i.demo{background:var(--gold)}.status-list article>div{display:grid;gap:4px}.status-list span{color:var(--muted)}.status-list strong{font-size:13px;color:var(--green)}.status-list i.demo~div~strong{color:var(--gold)}.timeline{display:grid;gap:18px;max-width:820px;margin:0 auto}.timeline article{padding:28px;border-inline-start:3px solid var(--gold)}.timeline time{color:var(--gold);font-weight:900}.timeline h2{margin:7px 0}.timeline ul{color:var(--text-2);line-height:1.8}
  .field-help{display:block;color:var(--muted);line-height:1.55;margin-top:-10px}.form-options{display:flex;align-items:center;justify-content:space-between;gap:12px}.secret-toggle{border:0;background:transparent;color:var(--gold);font:inherit;font-size:13px;font-weight:800;cursor:pointer;padding:4px}.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .demo-credential{display:flex;justify-content:space-between;gap:10px;padding:11px 12px;border:1px dashed var(--line-3);border-radius:10px;color:var(--muted);font-size:12px}.demo-credential code{color:var(--gold);font-family:ui-monospace,monospace}
  .catalog-tools{gap:16px;flex-wrap:wrap}.catalog-inputs{display:flex;gap:8px}.catalog-inputs .input{min-height:43px;padding:9px 12px;font-size:14px}.catalog-inputs input{width:160px}.catalog-inputs select{width:170px}.product-art{color:inherit;text-decoration:none}.product-card h2 a{color:inherit;text-decoration:none}.product-card-foot>div{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
  .product-detail{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:20px}.product-detail-art{min-height:480px;display:grid;place-items:center;align-content:center;gap:25px;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 25%,transparent),transparent 60%),var(--surface)}.product-detail-art>span{width:150px;height:150px;border-radius:44px;display:grid;place-items:center;color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 48%,transparent);font-size:46px;font-weight:900;box-shadow:0 30px 100px color-mix(in srgb,var(--accent) 20%,transparent)}.product-detail-art i{font-style:normal;color:var(--muted);font-size:13px}.product-detail-copy{padding:clamp(24px,4vw,42px);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:17px}.product-detail-copy h2{font-size:var(--fs-h1);margin:0}.product-detail-copy dl{width:100%;margin:0;border-block:1px solid var(--line)}.product-detail-copy dl>div{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)}.product-detail-copy dl>div:last-child{border:0}.product-detail-copy dt{color:var(--muted)}.product-detail-copy dd{margin:0;font-weight:800}.product-detail-copy>p{color:var(--text-2);line-height:1.6}
  .plan-badge.current{background:var(--green)}.plan-card.current{border-color:color-mix(in srgb,var(--green) 45%,transparent)}.plan-compare{max-width:850px;margin:45px auto 0;padding:28px}.plan-compare h2{margin-top:0}.plan-compare>div{display:flex;justify-content:space-between;gap:20px;padding:13px 0;border-top:1px solid var(--line)}.plan-compare span{color:var(--text-2)}.faq-list{max-width:850px;margin:50px auto 0}.faq-list.wide{margin-top:0}.faq-list>h2{font-size:var(--fs-h2)}.faq-list>h2.faq-group{font-size:clamp(1.15rem,2.6vw,1.4rem);margin:38px 0 2px;color:var(--gold);letter-spacing:.01em}.faq-list>h2.faq-group:first-child{margin-top:0}.faq-list details{border-bottom:1px solid var(--line);padding:18px 2px}.faq-list summary{font-weight:900;font-size:18px;cursor:pointer}.faq-list p{color:var(--text-2);line-height:1.7}.faq-list a{color:var(--gold);font-weight:800}
  .profile-preview>small{color:var(--muted);margin-top:5px}.profile-badges{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}.profile-badges>*{font-style:normal;color:var(--gold);font-weight:800;font-size:12px;padding:5px 8px;border-radius:var(--r-pill);background:color-mix(in srgb,var(--gold) 8%,var(--surface));text-decoration:none}.profile-badges .verified{color:var(--green)}.profile-stats{margin-top:20px;padding:26px}.profile-stats header{display:flex;align-items:flex-start;justify-content:space-between}.profile-stats h2,.profile-stats p{margin:0}.profile-stats header p,.profile-stats footer{color:var(--muted)}.profile-stats header a{color:var(--gold);font-weight:800;text-decoration:none}.profile-stats>div{display:grid;grid-template-columns:repeat(6,1fr);margin:24px 0;border-block:1px solid var(--line)}.profile-stats>div p{padding:18px 10px;display:grid;gap:5px;text-align:center;border-inline-end:1px solid var(--line)}.profile-stats>div p:last-child{border:0}.profile-stats b{font-size:24px}.profile-stats span{color:var(--muted);font-size:12px}
  .select-row,.account-actions>div{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:15px 0;border-top:1px solid var(--line)}.select-row>span,.account-actions>div>span{display:grid;gap:4px}.select-row small,.account-actions small{color:var(--muted)}.select-row .input{width:min(220px,45%);min-height:44px}.account-actions>div:first-of-type{border-top:0}
  .checkout-total>div{padding:5px 0}.checkout-total .grand{margin-top:8px;padding-top:12px;border-top:1px solid var(--line);font-size:18px}.sandbox-method{display:flex;gap:12px;align-items:center;margin:17px 0;padding:14px;border:1px dashed color-mix(in srgb,var(--gold) 40%,transparent);border-radius:12px}.sandbox-method>span{width:40px;height:40px;display:grid;place-items:center;border-radius:10px;background:var(--surface-3);color:var(--gold)}.sandbox-method>div{display:grid;gap:3px}.sandbox-method small{color:var(--muted)}.checkout-aside>a{display:block}.checkout-result.success .empty-glyph{color:var(--green)}.checkout-result.failure .empty-glyph{color:var(--red)}
  .history-list{display:grid;gap:10px}.history-list a{display:flex;justify-content:space-between;padding:18px;color:var(--text);text-decoration:none}.history-list span{color:var(--muted)}.history-empty-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}.history-empty-grid article{padding:22px}.history-empty-grid h2{font-size:var(--fs-h3);margin-top:0}.history-empty-grid p{color:var(--text-2);line-height:1.6}.billing-summary small{color:var(--muted)}.billing-actions{display:flex;gap:8px;flex-wrap:wrap}
  .danger-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
  .invite-layout{display:grid;grid-template-columns:minmax(280px,.7fr) minmax(0,1.3fr);gap:18px}.invite-form,.invite-preview{padding:28px}.invite-form{display:flex;flex-direction:column;gap:14px;align-self:start}.invite-preview h2{font-size:var(--fs-h2);margin:10px 0}.invite-preview>p{white-space:pre-line;direction:rtl;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--bg-1);line-height:1.8}.invite-actions{display:flex;gap:8px;flex-wrap:wrap}.invite-preview>small{display:block;color:var(--muted);line-height:1.6;margin-top:15px}
  .dass-high-contrast .panel,.dass-high-contrast .product-card{border-color:color-mix(in srgb,var(--text) 38%,transparent)}.dass-high-contrast .muted,.dass-high-contrast .field-help{color:var(--text-2)!important}.dass-large-text{font-size:112.5%}.dass-reduced-motion .product-page{animation:none!important}.dass-reduced-motion *{scroll-behavior:auto!important}
  @media(max-width:900px){.product-grid,.plans-grid{grid-template-columns:repeat(2,1fr)}.plans-grid .plan-card:first-child{grid-column:1/-1}.account-grid,.checkout-layout,.product-detail,.invite-layout{grid-template-columns:1fr}.product-detail-art{min-height:360px}.profile-preview{min-height:260px}.inventory-grid{grid-template-columns:1fr}.profile-stats>div{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:700px){.product-page{width:min(100% - 28px,1180px);padding-top:42px}.product-hero h1{font-size:clamp(38px,13vw,58px)}.auth-layout,.support-grid{grid-template-columns:1fr}.auth-side{order:-1}.product-grid,.plans-grid,.pricing-trust>div{grid-template-columns:1fr}.plans-grid .plan-card:first-child{grid-column:auto}.catalog-tools{align-items:flex-start;flex-direction:column}.catalog-inputs{width:100%;display:grid;grid-template-columns:1fr 1fr}.catalog-inputs input,.catalog-inputs select{width:100%}.filter-pills{max-width:100%;overflow:auto}.catalog-note{padding-inline:5px}.product-art{height:155px}.product-card-copy{min-height:220px}.product-detail-art{min-height:300px}.product-detail-art>span{width:110px;height:110px}.account-tabs{margin-inline:-7px}.inventory-item{grid-template-columns:58px 1fr auto}.inventory-glyph{width:58px;height:58px}.profile-stats>div{grid-template-columns:repeat(2,1fr)}.profile-stats>div p:nth-child(2n){border-inline-end:0}.select-row,.account-actions>div{align-items:flex-start;flex-direction:column}.select-row .input{width:100%}.checkout-item{grid-template-columns:54px 1fr}.checkout-item>strong{grid-column:2}.status-list article{grid-template-columns:10px 1fr}.status-list strong{grid-column:2}.billing-summary{align-items:flex-start;gap:15px;flex-direction:column}.receipt-list article{align-items:flex-start;gap:10px;flex-direction:column}.history-empty-grid{grid-template-columns:1fr}.empty-actions{flex-wrap:wrap;justify-content:center}}
  @media(prefers-reduced-motion:reduce){.product-page{animation:none}.product-card{transition:none}}
  `;
}

// apps/dasssite/src/modes/catalog.ts
var MODES = [
  // ── متاح الآن ─────────────────────────────────────────────────────────────
  {
    id: "majlis",
    name: "المجلس",
    codename: "THE ORIGINAL",
    premise: "طاولة وحدة، ووعود تنقلب في السرّ.",
    brief: "الطور الأساسي وأول ما تلعبونه. كل واحد يجلس على الطاولة ويعلن نيّته قدّام الكل، بس القرار الحقيقي يُقفل على جواله. اللي تكشفه الشاشة آخر الجولة هو الفرق بين اللي قيل واللي انسوّى.",
    hook: "وعدك مسموع للكل، وقرارك ما يشوفه أحد.",
    players: "٤–٨ لاعبين",
    duration: "١٥–٢٥ دقيقة",
    intensity: "متوسط",
    price: "مجاني",
    priceNote: "ضمن اللعبة",
    availability: "playable",
    accent: "#b72e38",
    playRoute: "/create",
    beats: ["أعلنوا نيّاتكم على الطاولة", "اقفلوا قراركم الحقيقي بسرّه", "الشاشة تكشف من التزم ومن انقلب"]
  },
  // ── أطوار BACKFIRE الأصلية — عوالم أصلية على الطريق ───────────────────────
  {
    id: "classroom",
    name: "الصف",
    codename: "THE CLASS",
    premise: "سرٌّ واحد بين خمسة طلاب، ومجلس تأديب لا يعرف الرحمة.",
    brief: "حدث شيء في الصف، والإدارة تريد اسمًا واحدًا قبل الجرس. كل طالب يحمل جزءًا من الحقيقة وسببًا للكذب. من يحمي صاحبه؟ ومن يبيعه ليخرج نظيفًا؟",
    hook: "أحدكم يعرف الفاعل. وأحدكم هو الفاعل.",
    players: "٥ لاعبين",
    duration: "٢٠ دقيقة",
    intensity: "عالٍ",
    price: "٢٩ ر.س",
    availability: "coming-soon",
    accent: "#c8873a",
    beats: ["وزّعوا الشهادات المتناقضة", "صوّتوا على اسم قبل الجرس", "الحقيقة تظهر بعد فوات الأوان"]
  },
  {
    id: "siege",
    name: "الحصار",
    codename: "SIEGE",
    premise: "المدينة محاصرة، والقرار: من يخرج ومن يبقى خلف الجدار.",
    brief: "المؤن تكفي القليل، والبوابة تُفتح مرة واحدة كل ليلة. كل لاعب يمثّل بيتًا له مصالحه وأسراره. التحالفات تُبنى في الظلام، وتنهار عند أول رغيف.",
    hook: "من تُنقذه الليلة قد يغلق البوابة في وجهك غدًا.",
    players: "٥–٦ لاعبين",
    duration: "٣٠ دقيقة",
    intensity: "عالٍ جدًا",
    price: "٣٤ ر.س",
    availability: "coming-soon",
    accent: "#d0552f",
    beats: ["قسّموا المؤن سرًّا", "افتحوا البوابة لواحد فقط", "الجوع يكشف من خان الحصار"]
  },
  {
    id: "blackout",
    name: "العتمة",
    codename: "BLACKOUT",
    premise: "انطفأت المدينة، وكل قرار في الظلام قد يضيء الهدف الخطأ.",
    brief: "انقطعت الكهرباء، ومعها كل وسيلة للتأكد. لديكم مولّد واحد وقرارات لا رجعة فيها. ما تفعله في العتمة لا يراه أحد… حتى تعود الأنوار.",
    hook: "في الظلام، الجميع بريء. عند الضوء، يظهر أثر واحد.",
    players: "٥ لاعبين",
    duration: "١٨ دقيقة",
    intensity: "متوسط",
    price: "٢٤ ر.س",
    availability: "waitlist",
    accent: "#e0e0dc",
    beats: ["تحرّكوا وأنتم في العتمة", "وجّهوا المولّد لغرفة واحدة", "الضوء يفضح ما جرى في الظلام"]
  },
  {
    id: "orbit",
    name: "المدار",
    codename: "ORBIT",
    premise: "المحطة تتهاوى، والأكسجين لا يكفي الجميع — من تُنقذ؟",
    brief: "المحطة تفقد مدارها، والوحدات تُغلق واحدة تلو الأخرى. كل طاقم يخفي عطلًا يخصّه وحلًّا يخص غيره. القرار جماعي، والهبوط فردي.",
    hook: "كل وحدة تُغلقها لإنقاذ نفسك تحبس أحدهم بالداخل.",
    players: "٦ لاعبين",
    duration: "٢٥ دقيقة",
    intensity: "عالٍ",
    price: "٣٩ ر.س",
    availability: "coming-soon",
    accent: "#7f97a6",
    beats: ["شخّصوا الأعطال سرًّا", "أغلقوا وحدة لإنقاذ المدار", "المحطة تتذكّر من ضحّى بمن"]
  },
  {
    id: "hotel",
    name: "النزيل",
    codename: "THE GUEST",
    premise: "فندق بلا خروج، ونزيل واحد ليس كما يدّعي.",
    brief: "الليل طويل، والغرف كلها محجوزة، والمفاتيح تنتقل بين الأيدي. كل نزيل يحمل قصة غطاء وسببًا للبقاء مستيقظًا. باب واحد موارب يكفي ليقلب الليلة كلها.",
    hook: "أحد النزلاء لا يملك غرفة… لكنه يملك مفتاحك.",
    players: "٥–٧ لاعبين",
    duration: "٢٢ دقيقة",
    intensity: "متوسط",
    price: "٢٩ ر.س",
    availability: "coming-soon",
    accent: "#8a2f44",
    beats: ["بدّلوا المفاتيح في الممر", "اطرقوا بابًا واحدًا في الليل", "الصباح يكشف من لم يكن نزيلًا"]
  },
  // ── مستوحى من الأنمي — قريبًا ─────────────────────────────────────────────
  // Concept labels only: anime *titles* as inspiration for a BACKFIRE world.
  // No characters, logos, screenshots, or affiliation. Disabled, no checkout,
  // no numeric price, no play route — marketing previews only.
  {
    id: "attack-on-titan",
    name: "هجوم العمالقة",
    codename: "THE LAST WALL",
    premise: "جدار واحد يحميكم، وواحد فيكم يقدر يفتح فيه ثغرة.",
    brief: "تهديد يجي على الكل من برّه، والحماية ما تكفي كل الجهات. تتفقون بصوت عالي وين تحصّنون، وكل واحد يرسل قوّته بسرّه. اللي يقصّر في جهة يفتح ثغرة — والكسر يضل بارز للجولة الجاية.",
    hook: "اللي تحميه الليلة، يمكن يطيّح الجدار بكرة.",
    players: "٤–٨ لاعبين",
    duration: "٣٠ دقيقة",
    intensity: "عالٍ جدًا",
    price: "قريبًا",
    availability: "coming-soon",
    accent: "#c0392b",
    beats: ["اتفقوا بصوت عالي وين تحمون", "كل واحد يرسل قوّته بسرّه", "الشاشة تكشف من وين جت الثغرة"]
  },
  {
    id: "tomodachi-game",
    name: "لعبة الأصدقاء",
    codename: "THE TRUST GAME",
    premise: "كلكم أصحاب… بس كل واحد معه دَين يخبّيه عن البقية.",
    brief: "تقعدون كلكم تحت المراقبة، والثقة بينكم هي رأس المال. قرار واحد عام قدّام الكل، وقرار سري على جوالك يخالفه. تقدر تحمي الجماعة أو تسدّد دَينك على حسابهم — والفرق ينكشف قدّام الكل.",
    hook: "وعدك سمعوه كلهم، وقرارك ما يشوفه أحد.",
    players: "٤–٦ لاعبين",
    duration: "٢٥ دقيقة",
    intensity: "عالٍ",
    price: "قريبًا",
    availability: "coming-soon",
    accent: "#6f9a6f",
    beats: ["كل واحد ياخذ دَينه بسرّه", "اتفقوا على وعد قدّام الكل", "الشاشة تقارن الوعد بالفعل"]
  },
  {
    id: "kaiji",
    name: "كايجي",
    codename: "THE GAMBLE",
    premise: "كل جولة ترفع الرهان، والطريق يضيق، واللي يطمع يخسر كل شي.",
    brief: "رهان يكبر جولة بعد جولة، وكل واحد يقرّر بسرّه: يثبت، يرفع، أو ينسحب. تشوفون مجموع الخطر بس ما تشوفون قرار كل واحد. اللي يطمع بزيادة يمكن يطيح لحاله.",
    hook: "الطمع يورّطك… والانسحاب يفضحك.",
    players: "٤–٨ لاعبين",
    duration: "٢٥ دقيقة",
    intensity: "عالٍ جدًا",
    price: "قريبًا",
    availability: "coming-soon",
    accent: "#c79a2e",
    beats: ["الطاولة ترفع الرهان", "كل واحد يقرّر بسرّه: يثبت أو يرفع", "العدّاد يكشف من طمع"]
  },
  {
    id: "code-geass",
    name: "كود غياس",
    codename: "THE COMMAND",
    premise: "أمر واحد مخفي يقلب الولاء… وبعدها ما تدري مين معك.",
    brief: "تعلنون تحالفاتكم قدّام الكل، وكل واحد معه أمر واحد يخبّيه. الأمر يجبر دعم، أو يحوّل عاقبة، أو يكسر تحالف. الأوامر تتصادم، والسيطرة تنتقل من يد ليد.",
    hook: "الأمر يعطيك السيطرة الحين… ويكشفك بعدين.",
    players: "٤–٨ لاعبين",
    duration: "٢٨ دقيقة",
    intensity: "عالٍ",
    price: "قريبًا",
    availability: "coming-soon",
    accent: "#7b52a8",
    beats: ["أعلنوا تحالفاتكم قدّام الكل", "كل واحد يخبّي أمره الواحد", "الشاشة تكشف الأمر اللي رجع على صاحبه"]
  },
  {
    id: "jujutsu-kaisen",
    name: "جوجوتسو كايسن",
    codename: "THE CURSE",
    premise: "القوة تنقذك الحين… بس أثرها يمشي وراك.",
    brief: "لعنة وحدة في الغرفة يشوفها الكل، وكل واحد يقرّر بسرّه: يمتصّها، يحوّلها، أو يستخدمها. القرار القوي يعطيك فايدة فورية، بس أثره يضل شايفينه، ويعرف طريق الرجوع لصاحبه.",
    hook: "الحماية ما تمحي الخطر… تأخّره.",
    players: "٤–٧ لاعبين",
    duration: "٢٢ دقيقة",
    intensity: "عالٍ",
    price: "قريبًا",
    availability: "coming-soon",
    accent: "#3f9aa8",
    beats: ["اللعنة تظهر للكل", "كل واحد يقرّر بسرّه: يمتص أو يحوّل", "الأثر يرجع لمن استخدمه أول"]
  }
];
var ANIME_MODE_IDS = /* @__PURE__ */ new Set([
  "attack-on-titan",
  "tomodachi-game",
  "kaiji",
  "code-geass",
  "jujutsu-kaisen"
]);
function modeFamily(mode) {
  if (mode.availability === "playable") return "live";
  return ANIME_MODE_IDS.has(mode.id) ? "anime" : "original";
}
function modeById(id2) {
  return MODES.find((mode) => mode.id === id2);
}
function availabilityLabel(availability) {
  return { playable: "متاح الآن", "coming-soon": "قريبًا", waitlist: "قائمة الانتظار" }[availability];
}

// apps/dasssite/src/modes/covers.ts
var N = {
  black: "#080808",
  ink: "#0c0c0d",
  charcoal: "#151517",
  graphite: "#222226",
  lead: "#3a3a40",
  steel: "#66666d",
  gray: "#808088",
  muted: "#9a9a9f",
  paper: "#efece4",
  white: "#fafaf7"
};
function silhouette(fill, o = {}) {
  const hr = o.hr ?? 24, hx = o.hx ?? 50, hy = o.hy ?? 62, sw = o.sw ?? 92, rise = o.rise ?? 0, neck = o.neck ?? 98;
  const l = 50 - sw / 2, r = 50 + sw / 2;
  const body = `M${l} 152 C${l} ${neck + 24 + rise} ${l + 20} ${neck + rise} ${hx} ${neck} C${r - 20} ${neck - rise} ${r} ${neck + 24 - rise} ${r} 152 Z`;
  return `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${fill}"/><path d="${body}" fill="${fill}"/>`;
}
function person(x, y, s, fill, o = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${silhouette(fill, o)}</g>`;
}
function frame(accent) {
  return `<rect x="14" y="14" width="472" height="572" fill="none" stroke="${accent}" stroke-width="1.4" opacity=".38"/>`;
}
function defs(accent, id2) {
  return `<defs>
    <linearGradient id="sky-${id2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${N.charcoal}"/><stop offset="1" stop-color="${N.black}"/></linearGradient>
    <radialGradient id="glow-${id2}" cx="50%" cy="34%" r="62%"><stop offset="0" stop-color="${accent}" stop-opacity=".26"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <filter id="sh-${id2}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>`;
}
function phone(cx, cy, s, rot, screen) {
  const w = 26, h3 = 52;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})"><rect x="${-w / 2}" y="${-h3 / 2}" width="${w}" height="${h3}" rx="5" fill="${N.charcoal}" stroke="${N.lead}" stroke-width="1.2"/><rect x="${-w / 2 + 3}" y="${-h3 / 2 + 5}" width="${w - 6}" height="${h3 - 10}" rx="2" fill="${screen}"/></g>`;
}
function joinGlyph(x, y, u, fill) {
  const cells = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2], [4, 0], [4, 2], [1, 4], [3, 4], [4, 4], [0, 4]];
  return cells.map(([cx, cy]) => `<rect x="${x + cx * u}" y="${y + cy * u}" width="${u * 0.8}" height="${u * 0.8}" fill="${fill}" opacity=".8"/>`).join("");
}
function majlis(accent) {
  const id2 = "mode-majlis";
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="غرفة معيشة: خمسة أشخاص حول تلفزيون واحد مضاء، كل واحد يمسك جوالًا، وخط ملوّن يخرج من جوال إلى الشاشة ويعود إلى صاحبه">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <!-- the one shared TV -->
    <rect x="118" y="290" width="24" height="30" fill="${N.graphite}"/>
    <ellipse cx="250" cy="322" rx="70" ry="11" fill="${N.ink}"/>
    <g filter="url(#sh-${id2})"><rect x="112" y="64" width="276" height="168" rx="10" fill="${N.charcoal}" stroke="${N.lead}" stroke-width="2"/></g>
    <rect x="124" y="76" width="252" height="144" rx="6" fill="${N.ink}"/>
    <clipPath id="tv-${id2}"><rect x="124" y="76" width="252" height="144" rx="6"/></clipPath>
    <g clip-path="url(#tv-${id2})">
      ${person(176, 96, 0.6, N.steel, { hx: 54, sw: 96 })}
      ${person(250, 104, 0.54, N.lead, { hx: 44, sw: 92 })}
      <rect x="236" y="164" width="34" height="18" rx="2" fill="${accent}" transform="rotate(-8 253 173)"/>
      <circle cx="144" cy="96" r="4" fill="${accent}"/>
      <rect x="154" y="93" width="22" height="6" rx="2" fill="${N.steel}" opacity=".7"/>
      ${joinGlyph(322, 168, 8, N.muted)}
    </g>
    <!-- five people gathered around it, from behind -->
    ${person(60, 250, 0.95, N.lead, { hx: 46, sw: 84 })}
    ${person(345, 250, 0.95, N.lead, { hx: 54, sw: 84 })}
    ${person(30, 322, 1.16, N.steel, { sw: 94 })}
    ${person(355, 322, 1.16, N.steel, { hx: 54, sw: 94 })}
    ${person(178, 352, 1.36, N.muted, { sw: 96 })}
    <!-- each phone throws a faint decision line up to the screen -->
    <g stroke="${N.steel}" stroke-width="1.2" fill="none" opacity=".3" stroke-linecap="round">
      <path d="M140 342 C 190 300 230 262 250 232"/>
      <path d="M112 440 C 170 360 220 280 248 230"/>
      <path d="M388 440 C 330 360 280 280 252 230"/>
      <path d="M360 342 C 310 300 270 262 250 232"/>
    </g>
    <!-- the phones; the central one is the live decision -->
    ${phone(140, 352, 0.5, -12, N.muted)}
    ${phone(360, 352, 0.5, 12, N.muted)}
    ${phone(110, 456, 0.66, -10, N.muted)}
    ${phone(390, 456, 0.66, 10, N.muted)}
    ${phone(246, 500, 0.86, 0, accent)}
    <!-- the return line: decision rises to the TV, consequence loops back to its sender -->
    <path d="M246 478 C 244 400 250 300 250 232 C 250 190 330 190 326 270 C 322 340 290 372 258 384" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="246" cy="478" r="5" fill="${accent}"/>
    <path d="M258 384 l16 -10 4 20z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function classroom(accent) {
  const id2 = "mode-class";
  const slit = { x: 300, y: 150, w: 52, h: 300 };
  let desks = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 96 + c * 116, y = 300 + r * 96;
      const marked = r === 1 && c === 1;
      desks += person(x - 26, y - 128, 0.62, marked ? accent : N.lead, { sw: 88 });
      desks += `<rect x="${x - 34}" y="${y}" width="68" height="14" rx="2" fill="${marked ? accent : N.graphite}"/>`;
      desks += `<rect x="${x - 30}" y="${y + 14}" width="60" height="26" fill="${N.ink}"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="صفّ دراسي من طاولات وطلاب، أحدهم معلّم بالأحمر، يُرى جزء منه عبر شقّ مراقبة">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <!-- chalkboard -->
    <rect x="70" y="70" width="360" height="150" rx="4" fill="${N.ink}" stroke="${N.lead}" stroke-width="2"/>
    <line x1="110" y1="120" x2="300" y2="120" stroke="${N.steel}" stroke-width="2" opacity=".6"/>
    <line x1="110" y1="150" x2="250" y2="150" stroke="${N.steel}" stroke-width="2" opacity=".45"/>
    <path d="M330 108 C 372 96 392 128 356 150" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M356 150 l10 -12 4 14z" fill="${accent}"/>
    <g filter="url(#sh-${id2})">${desks}</g>
    <!-- the monitor's slit exposes one column brighter -->
    <g clip-path="url(#clip-${id2})"><rect x="${slit.x}" y="${slit.y}" width="${slit.w}" height="${slit.h}" fill="${accent}" opacity=".08"/></g>
    <clipPath id="clip-${id2}"><rect x="${slit.x}" y="${slit.y}" width="${slit.w}" height="${slit.h}"/></clipPath>
    <line x1="${slit.x}" y1="${slit.y}" x2="${slit.x}" y2="${slit.y + slit.h}" stroke="${N.paper}" stroke-width="1.6" opacity=".5"/>
    <line x1="${slit.x + slit.w}" y1="${slit.y}" x2="${slit.x + slit.w}" y2="${slit.y + slit.h}" stroke="${N.paper}" stroke-width="1.6" opacity=".5"/>
    ${frame(accent)}
  </svg>`;
}
function siege(accent) {
  const id2 = "mode-siege";
  const heights = [210, 300, 160, 360, 250, 420, 300, 190, 340, 240, 300];
  let city = "";
  heights.forEach((h3, i) => {
    const x = 60 + i * 38, lit = i === 5;
    city += `<rect x="${x}" y="${520 - h3}" width="30" height="${h3}" fill="${lit ? N.graphite : N.ink}" stroke="${N.lead}" stroke-width="1"/>`;
    for (let wy = 520 - h3 + 16; wy < 500; wy += 34) {
      const on = lit && wy < 520 - h3 + 120;
      city += `<rect x="${x + 8}" y="${wy}" width="6" height="10" fill="${on ? accent : N.steel}" opacity="${on ? ".9" : ".35"}"/>`;
      city += `<rect x="${x + 18}" y="${wy}" width="6" height="10" fill="${N.steel}" opacity=".28"/>`;
    }
  });
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="أفق مدينة من أبراج مظلمة، برج واحد مضاء، وقوس أحمر يطبق حول المدينة">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <g filter="url(#sh-${id2})">${city}</g>
    <rect x="0" y="518" width="500" height="82" fill="${N.black}"/>
    <!-- the closing perimeter -->
    <path d="M-20 470 C 120 430 260 520 640 430" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
    <path d="M-10 520 C 150 500 320 560 520 500" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>
    <circle cx="250" cy="497" r="5" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function blackout(accent) {
  const id2 = "mode-blackout";
  let grid = "";
  const litR = 2, litC = 3;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 66 + c * 78, y = 92 + r * 74, lit = r === litR && c === litC;
      grid += `<rect x="${x}" y="${y}" width="56" height="52" fill="${lit ? accent : N.ink}" opacity="${lit ? ".92" : "1"}" stroke="${N.lead}" stroke-width="1"/>`;
      if (lit) grid += person(x + 6, y - 6, 0.4, N.black, { sw: 96 });
      else if ((r + c) % 3 === 0) grid += `<rect x="${x + 10}" y="${y + 12}" width="36" height="4" fill="${N.steel}" opacity=".22"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="واجهة مبنى من نوافذ مظلمة، نافذة واحدة مضاءة بالأحمر، وخط طاقة ينقطع">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="${N.black}"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <g filter="url(#sh-${id2})">${grid}</g>
    <!-- the failing power line: a jagged return that snaps toward the one lit room -->
    <path d="M40 60 L 120 60 L 150 96 L 210 96 L 236 150" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="40" cy="60" r="5" fill="${accent}"/>
    <path d="M236 150 l-12 -4 2 14z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function orbit(accent) {
  const id2 = "mode-orbit";
  let modules = "";
  const cx = 250, cy = 300, R = 150;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, sealed = i === 2;
    modules += `<rect x="${x - 20}" y="${y - 16}" width="40" height="32" rx="4" transform="rotate(${a * 180 / Math.PI + 90} ${x} ${y})" fill="${sealed ? accent : N.graphite}" stroke="${N.steel}" stroke-width="1.4"/>`;
    if (!sealed) modules += `<circle cx="${x}" cy="${y}" r="3" fill="${N.muted}"/>`;
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="محطة فضائية على شكل حلقة، وحدة واحدة مغلقة بالأحمر، ومدار متهاوٍ">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${N.lead}" stroke-width="18"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${N.steel}" stroke-width="1.4" opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="58" fill="${N.ink}" stroke="${N.lead}" stroke-width="2"/>
    <g filter="url(#sh-${id2})">${modules}</g>
    <!-- decaying orbit: a red arc spiralling outward and breaking -->
    <path d="M250 300 m0 -${R + 34} a ${R + 34} ${R + 34} 0 1 1 -2 0" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="6 10" opacity=".85"/>
    <circle cx="${cx}" cy="${cy - R - 34}" r="5" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function hotel(accent) {
  const id2 = "mode-hotel";
  let doors = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const x = 74 + c * 96, y = 96 + r * 108, ajar = r === 2 && c === 2;
      doors += `<rect x="${x}" y="${y}" width="64" height="86" rx="3" fill="${N.ink}" stroke="${N.lead}" stroke-width="1.4"/>`;
      if (ajar) {
        doors += `<rect x="${x}" y="${y}" width="30" height="86" rx="3" fill="${accent}" opacity=".85"/>`;
        doors += `<path d="M${x + 30} ${y} L ${x + 44} ${y + 10} L ${x + 44} ${y + 78} L ${x + 30} ${y + 86} Z" fill="${N.charcoal}"/>`;
      } else {
        doors += `<circle cx="${x + 52}" cy="${y + 46}" r="3" fill="${N.steel}"/>`;
        doors += `<rect x="${x + 12}" y="${y + 14}" width="40" height="3" fill="${N.steel}" opacity=".3"/>`;
      }
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="واجهة فندق من أبواب مغلقة، باب واحد موارب يتسرب منه ضوء أحمر، ومفتاح يعود على خيط">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <g filter="url(#sh-${id2})">${doors}</g>
    <!-- a key on a return line, arriving back at the ajar door -->
    <path d="M420 70 C 300 40 150 70 300 300" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <circle cx="420" cy="70" r="8" fill="none" stroke="${accent}" stroke-width="3"/><rect x="416" y="78" width="8" height="20" fill="${accent}"/><rect x="416" y="92" width="14" height="4" fill="${accent}"/>
    <path d="M300 300 l-10 -8 -2 16z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function attackOnTitan(accent) {
  const id2 = "mode-aot";
  let wall = "";
  const wallTop = 322, courseH = 34, brickW = 66;
  for (let r = 0; r < 6; r++) {
    const y = wallTop + r * courseH;
    const off = r % 2 ? -brickW / 2 : 0;
    for (let c = -1; c < 9; c++) {
      const x = 30 + off + c * brickW;
      wall += `<rect x="${x}" y="${y}" width="${brickW - 5}" height="${courseH - 5}" rx="2" fill="${N.graphite}" stroke="${N.lead}" stroke-width="1"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="جدار حجري يحمي مجموعة، وكتلة تهديد ضخمة خلفه، وثغرة حمراء تكسر الجدار">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <!-- the looming external threat: a vast dark mass rising behind the wall -->
    <path d="M40 322 C 90 150 180 70 250 70 C 320 70 410 150 460 322 Z" fill="${N.ink}" opacity=".92"/>
    <circle cx="214" cy="196" r="7" fill="${accent}" opacity=".8"/>
    <circle cx="286" cy="196" r="7" fill="${accent}" opacity=".8"/>
    <path d="M224 236 C 240 248 260 248 276 236" fill="none" stroke="${N.lead}" stroke-width="3" stroke-linecap="round"/>
    <!-- the wall -->
    <g filter="url(#sh-${id2})">${wall}</g>
    <!-- structural damage: a black breach punched through the courses -->
    <path d="M236 322 L214 400 L246 452 L212 530 L296 530 L266 452 L294 400 L272 322 Z" fill="${N.black}"/>
    <path d="M236 322 L214 400 L246 452 L212 530" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M272 322 L294 400 L266 452 L296 530" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- tiny defenders on the wall top -->
    ${person(120, 268, 0.34, N.steel, { sw: 96 })}
    ${person(352, 268, 0.34, N.steel, { sw: 96 })}
    ${person(60, 300, 0.3, N.muted, { sw: 96 })}
    <!-- the red consequence line: the threat crosses the wall and reaches a defender -->
    <path d="M250 236 C 250 300 190 300 150 330 C 120 352 130 396 96 300" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="250" cy="236" r="5" fill="${accent}"/>
    <path d="M96 300 l-2 -18 12 8z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function tomodachiGame(accent) {
  const id2 = "mode-tomo";
  const cx = 250, cy = 360, R = 150;
  const n = 6, betrayer = 4;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2 + Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * (R * 0.78), i };
  });
  let links = "";
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const broken = a.i === betrayer || b.i === betrayer;
    links += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${broken ? accent : N.steel}" stroke-width="${broken ? 2 : 1.2}" opacity="${broken ? ".9" : ".32"}" ${broken ? 'stroke-dasharray="5 7"' : ""}/>`;
  }
  const seats = pts.map((p) => p.i === betrayer ? person(p.x - 22, p.y - 40, 0.4, accent, { sw: 94 }) : person(p.x - 22, p.y - 40, 0.4, N.lead, { sw: 94 })).join("");
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="حلقة أصدقاء تحت عين مراقبة، خطوط ثقة تربطهم، وخط واحد أحمر مقطوع لواحد يخفي قراره">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <!-- the observing eye above, casting a cone over the circle -->
    <path d="M250 96 L120 300 L380 300 Z" fill="${accent}" opacity=".05"/>
    <ellipse cx="250" cy="96" rx="46" ry="24" fill="${N.ink}" stroke="${N.lead}" stroke-width="2"/>
    <circle cx="250" cy="96" r="12" fill="${N.charcoal}" stroke="${accent}" stroke-width="2"/>
    <circle cx="250" cy="96" r="4" fill="${accent}"/>
    <!-- trust lines, then the seated group -->
    <g>${links}</g>
    <g filter="url(#sh-${id2})">${seats}</g>
    <!-- the private contradiction: a phone by the highlighted seat with a diverging mark -->
    ${phone(pts[betrayer].x + 30, pts[betrayer].y + 8, 0.6, 14, accent)}
    ${frame(accent)}
  </svg>`;
}
function kaiji(accent) {
  const id2 = "mode-kaiji";
  let steps = "";
  let tokens = "";
  const base = 470;
  for (let i = 0; i < 6; i++) {
    const x = 70 + i * 62, h3 = 60 + i * 46, w = 58;
    steps += `<rect x="${x}" y="${base - h3}" width="${w}" height="${h3}" fill="${i === 5 ? N.graphite : N.ink}" stroke="${N.lead}" stroke-width="1.4"/>`;
    for (let t = 0; t <= i; t++) {
      tokens += `<ellipse cx="${x + w / 2}" cy="${base - h3 - 6 - t * 9}" rx="17" ry="5.5" fill="${t === i && i >= 3 ? accent : N.charcoal}" stroke="${N.steel}" stroke-width="1"/>`;
    }
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="درج صاعد من الرهانات المتزايدة ينتهي بحافة ضيقة، وخط أحمر يصعد ثم يرجع هابطًا إلى لاعب وحيد">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <g filter="url(#sh-${id2})">${steps}</g>
    ${tokens}
    <!-- the narrowing edge at the top -->
    <path d="M442 64 L470 64 L470 178 L442 200 Z" fill="${N.black}"/>
    <line x1="442" y1="64" x2="442" y2="200" stroke="${accent}" stroke-width="2" opacity=".7"/>
    <!-- lone player at the foot of the climb -->
    ${person(38, 372, 0.62, N.muted, { sw: 92 })}
    <!-- the risk line: climbs the stairs, narrows, then loops back down onto the player -->
    <path d="M92 462 L132 462 L154 416 L194 416 L216 370 L256 370 L278 300 L318 300 L340 236 L400 200
             C 470 168 470 300 300 320 C 150 338 120 392 92 452" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="92" cy="462" r="5" fill="${accent}"/>
    <path d="M92 452 l-8 -12 16 -2z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function codeGeass(accent) {
  const id2 = "mode-geass";
  const cx = 250, cy = 300, R = 178;
  const n = 6;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, i };
  });
  const reversed = 3;
  let paths = "";
  let dots = "";
  nodes.forEach((p) => {
    const rev = p.i === reversed;
    const from = rev ? p : { x: cx, y: cy };
    const to = rev ? { x: cx, y: cy } : p;
    const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.14;
    const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.14;
    paths += `<path d="M${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}" fill="none" stroke="${rev ? accent : N.steel}" stroke-width="${rev ? 2.4 : 1.4}" opacity="${rev ? ".9" : ".42"}" ${rev ? 'stroke-dasharray="6 6"' : ""}/>`;
    const ang = Math.atan2(to.y - my, to.x - mx);
    dots += `<path transform="translate(${to.x} ${to.y}) rotate(${ang * 180 / Math.PI})" d="M0 0 l-11 -5 l0 10z" fill="${rev ? accent : N.steel}" opacity="${rev ? ".95" : ".5"}"/>`;
    dots += `<circle cx="${p.x}" cy="${p.y}" r="16" fill="${rev ? accent : N.graphite}" stroke="${N.lead}" stroke-width="1.6"/>`;
  });
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="عقدة قيادة مركزية تصدر أوامر لعقد حليفة حولها، وأمر واحد أحمر ينعكس راجعًا إلى المركز">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <g>${paths}</g>
    <g filter="url(#sh-${id2})">${dots}</g>
    <!-- the hidden order at the centre: a command sigil -->
    <circle cx="${cx}" cy="${cy}" r="42" fill="${N.ink}" stroke="${accent}" stroke-width="2.4"/>
    <circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="${accent}" stroke-width="1.6" opacity=".6"/>
    <path d="M${cx} ${cy - 30} L${cx} ${cy + 30} M${cx - 30} ${cy} L${cx + 30} ${cy}" stroke="${accent}" stroke-width="1.6" opacity=".7"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
function jujutsuKaisen(accent) {
  const id2 = "mode-jjk";
  const cx = 250, cy = 320;
  let absorb = "";
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const x = cx + Math.cos(a) * 210, y = cy + Math.sin(a) * 230;
    absorb += `<path d="M${x} ${y} Q ${cx + Math.cos(a) * 90} ${cy + Math.sin(a) * 90} ${cx} ${cy}" fill="none" stroke="${N.steel}" stroke-width="1.2" opacity=".3"/>`;
  }
  return `<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="علامة لعنة ثابتة على شخص، طاقة تُمتصّ نحوه ثم تُحوّل وترجع إليه عبر قوس متأخّر">
    ${defs(accent, id2)}
    <rect width="500" height="600" fill="url(#sky-${id2})"/><rect width="500" height="600" fill="url(#glow-${id2})"/>
    <!-- the cursed field: converging energy + concentric rings -->
    <g>${absorb}</g>
    <circle cx="${cx}" cy="${cy}" r="120" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".24"/>
    <circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".34"/>
    <!-- the marked figure -->
    <g filter="url(#sh-${id2})">${person(cx - 40, cy - 96, 0.72, N.charcoal, { sw: 92 })}</g>
    <!-- the persistent mark on its owner -->
    <path d="M${cx - 16} ${cy - 44} L${cx + 16} ${cy - 44} M${cx} ${cy - 60} L${cx} ${cy - 28} M${cx - 12} ${cy - 56} L${cx + 12} ${cy - 32} M${cx + 12} ${cy - 56} L${cx - 12} ${cy - 32}" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
    <!-- the delayed return: power leaves, curves wide, and comes back to its owner -->
    <path d="M${cx} ${cy - 40} C ${cx + 150} ${cy - 120} ${cx + 200} ${cy + 120} ${cx + 40} ${cy + 150} C ${cx - 60} ${cy + 168} ${cx - 40} ${cy + 60} ${cx} ${cy + 14}" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy - 40}" r="5" fill="${accent}"/>
    <path d="M${cx} ${cy + 14} l-12 -8 -2 16z" fill="${accent}"/>
    ${frame(accent)}
  </svg>`;
}
var COVERS = {
  majlis,
  classroom,
  siege,
  blackout,
  orbit,
  hotel,
  "attack-on-titan": attackOnTitan,
  "tomodachi-game": tomodachiGame,
  kaiji,
  "code-geass": codeGeass,
  "jujutsu-kaisen": jujutsuKaisen
};
function modeCover(id2, accent) {
  return (COVERS[id2] ?? majlis)(accent);
}

// apps/dasssite/src/modes/modes-page.ts
var h2 = escapeHtml;
var ICON = {
  players: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M18 14.5c1.9.5 3.5 2.2 3.5 4.5"/></svg>',
  duration: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/></svg>',
  intensity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>'
};
function availabilityTag(mode) {
  return `<span class="mode-flag ${mode.availability}">${availabilityLabel(mode.availability)}</span>`;
}
function metaRow(mode) {
  return `<ul class="mode-meta" aria-label="مواصفات الطور">
    <li>${ICON.players}<span>${h2(mode.players)}</span></li>
    <li>${ICON.duration}<span>${h2(mode.duration)}</span></li>
    <li>${ICON.intensity}<span>${h2(mode.intensity)}</span></li>
  </ul>`;
}
function primaryAction(mode) {
  if (mode.availability === "playable") return `<a class="btn primary" data-link="${mode.playRoute}">ابدأ لعبة</a>`;
  if (mode.availability === "waitlist") return `<button class="btn primary mode-waitlist" type="button" data-mode="${mode.id}">أضفني لقائمة الانتظار</button>`;
  return '<button class="btn primary" type="button" disabled>قريبًا</button>';
}
function detailAction(mode) {
  if (mode.availability !== "playable") return primaryAction(mode);
  const paid = mode.price !== "" && mode.price !== "مجاني" && !mode.priceNote;
  if (paid) return `<a class="btn primary" data-link="/checkout?kind=mode&id=${mode.id}">اشتر الطور</a>`;
  return `<a class="btn primary" data-link="${mode.playRoute}">ابدأ بهذا الطور</a>`;
}
function featuredCard(mode) {
  return `<article class="mode-featured" style="--accent:${mode.accent}">
    <a class="mode-featured-art" data-link="/modes/mode?id=${mode.id}" aria-label="استعرض ${h2(mode.name)}">${modeCover(mode.id, mode.accent)}</a>
    <div class="mode-featured-copy">
      <div class="mode-flags">${availabilityTag(mode)}<span class="mode-code" dir="ltr">${h2(mode.codename)}</span></div>
      <h2>${h2(mode.name)}</h2>
      <p class="mode-premise">${h2(mode.premise)}</p>
      ${metaRow(mode)}
      <p class="mode-hook"><span>الخبيئة</span>${h2(mode.hook)}</p>
      <div class="mode-actions">${primaryAction(mode)}<a class="btn ghost" data-link="/modes/mode?id=${mode.id}">استعرض الطور</a></div>
    </div>
  </article>`;
}
function portalCard(mode) {
  const anime = modeFamily(mode) === "anime";
  const foot = anime ? `<p class="mode-hook mode-hook-sm"><span>الضغط</span>${h2(mode.hook)}</p><button class="btn primary" type="button" disabled>قريبًا</button>` : `<div class="mode-card-foot"><div class="mode-price">${mode.availability === "playable" ? `<b>${h2(mode.price)}</b>${mode.priceNote ? `<span>${h2(mode.priceNote)}</span>` : ""}` : `<b>${h2(mode.price)}</b><span>${availabilityLabel(mode.availability)}</span>`}</div>${primaryAction(mode)}</div>`;
  return `<article class="mode-card ${mode.availability}${anime ? " anime" : ""}" style="--accent:${mode.accent}" data-mode="${mode.id}">
    <a class="mode-card-art" data-link="/modes/mode?id=${mode.id}" aria-label="استعرض ${h2(mode.name)}">
      ${modeCover(mode.id, mode.accent)}
      <span class="mode-enter">استعرض الطور</span>
    </a>
    <div class="mode-card-body">
      <div class="mode-flags">${availabilityTag(mode)}<span class="mode-code" dir="ltr">${h2(mode.codename)}</span></div>
      <h3><a data-link="/modes/mode?id=${mode.id}">${h2(mode.name)}</a></h3>
      <p class="mode-premise">${h2(mode.premise)}</p>
      ${metaRow(mode)}
      ${foot}
    </div>
  </article>`;
}
function modesGallery() {
  const live = MODES.filter((mode) => modeFamily(mode) === "live");
  const original = MODES.filter((mode) => modeFamily(mode) === "original");
  const anime = MODES.filter((mode) => modeFamily(mode) === "anime");
  const featured = live[0] ?? MODES[0];
  const extraLive = live.slice(1);
  const html = `<main id="main-content" class="product-page modes-page" tabindex="-1">
    <header class="product-hero"><div>
      <span class="eyebrow">أطوار BACKFIRE</span>
      <h1>عوالم تُلعب،<br>لا تُشترى.</h1>
      <p>كل طور عالم بقواعده وتوتره، بس القلب واحد: معلومة مخبّأة، قرار سرّي، وعاقبة ترجع.</p>
    </div></header>
    <aside class="modes-note" role="note"><span class="demo-dot"></span><div><b>طور واحد يُلعب الحين، والباقي معاينة</b><span>الأطوار القادمة أفكار بصرية — بلا شراء ولا تفعيل، وبلا زر «ابدأ». نبيّنها عشان تشوف وين رايحة اللعبة.</span></div></aside>

    <section class="modes-section modes-section-live" aria-labelledby="sec-live">
      <div class="modes-section-head"><span class="modes-section-tag live">متاح الآن</span><h2 id="sec-live">ابدأ من هنا</h2><p>الطور الأساسي — أول ما تلعبونه، ومجاني ضمن اللعبة.</p></div>
      ${featuredCard(featured)}
      ${extraLive.length ? `<section class="modes-grid">${extraLive.map(portalCard).join("")}</section>` : ""}
    </section>

    <section class="modes-section modes-section-original" aria-labelledby="sec-original">
      <div class="modes-section-head"><span class="modes-section-tag">قريبًا</span><h2 id="sec-original">أطوار BACKFIRE الأصلية</h2><p>عوالم أصلية من صميم اللعبة — كل واحد يقلب قاعدة ويرفع التوتر.</p></div>
      <section class="modes-grid">${original.map(portalCard).join("")}</section>
    </section>

    <section class="modes-section modes-section-anime" aria-labelledby="sec-anime">
      <div class="modes-section-head"><span class="modes-section-tag anime">مستوحى من الأنمي — قريبًا</span><h2 id="sec-anime">عوالم مستوحاة من الأنمي</h2><p>أفكار طور نأخذ إلهامها من أجواء أنميات معروفة، ونحوّلها لضغط BACKFIRE. معاينة فقط — بلا شراء.</p></div>
      <section class="modes-grid">${anime.map(portalCard).join("")}</section>
    </section>

    <section class="modes-store-link">
      <div><span class="eyebrow">تخصيص</span><h2>تبغى تغيّر شكل الجلسة؟</h2><p>مظاهر وإطارات ومؤثرات عرض اختيارية — تجميلية بس، بلا أي أفضلية باللعب.</p></div>
    </section>
  </main>`;
  return {
    active: "modes",
    title: "الأطوار",
    description: "عوالم BACKFIRE — طور متاح الآن، أطوار أصلية قادمة، وعوالم مستوحاة من الأنمي.",
    html,
    bind: bindWaitlist
  };
}
function beatList(mode) {
  return `<ol class="mode-beats">${mode.beats.map((beat) => `<li><b class="beat-mark" aria-hidden="true"></b><span>${h2(beat)}</span></li>`).join("")}</ol>`;
}
function modeDetail(search) {
  const mode = modeById(new URLSearchParams(search).get("id") ?? "");
  if (!mode) {
    return {
      active: "modes",
      title: "الطور غير موجود",
      description: "لم نجد هذا الطور.",
      html: `<main id="main-content" class="product-page" tabindex="-1"><section class="empty-state panel"><span class="empty-glyph">؟</span><h2>هذا الطور غير موجود</h2><p>يمكن أن الرابط تغيّر. ارجع لصفحة الأطوار واختر عالمًا.</p><a class="btn primary" data-link="/modes">كل الأطوار</a></section></main>`
    };
  }
  const html = `<main id="main-content" class="product-page mode-detail-page" tabindex="-1" style="--accent:${mode.accent}">
    <a class="mode-back" data-link="/modes">← كل الأطوار</a>
    <section class="mode-detail">
      <div class="mode-detail-art panel">${modeCover(mode.id, mode.accent)}<div class="mode-detail-art-cap">${availabilityTag(mode)}<span class="mode-code" dir="ltr">${h2(mode.codename)}</span></div></div>
      <div class="mode-detail-copy">
        <h1>${h2(mode.name)}</h1>
        <p class="mode-detail-premise">${h2(mode.premise)}</p>
        <p class="mode-hook"><span>الخبيئة</span>${h2(mode.hook)}</p>
        <p class="mode-brief">${h2(mode.brief)}</p>
        <dl class="mode-detail-meta">
          <div><dt>اللاعبون</dt><dd>${h2(mode.players)}</dd></div>
          <div><dt>المدة</dt><dd>${h2(mode.duration)}</dd></div>
          <div><dt>التوتر</dt><dd>${h2(mode.intensity)}</dd></div>
          <div><dt>الحالة</dt><dd>${availabilityLabel(mode.availability)}</dd></div>
        </dl>
        <div class="mode-detail-price"><b>${h2(mode.price)}</b>${mode.priceNote ? `<span>${h2(mode.priceNote)}</span>` : mode.availability !== "playable" ? "<span>لا شراء فعلي بعد</span>" : ""}</div>
        <div class="mode-actions">${detailAction(mode)}<a class="btn ghost" data-link="/how-to-play">كيف تُلعب الأطوار</a></div>
        <p class="mode-waitlist-note" hidden role="status"></p>
      </div>
    </section>
    <section class="mode-round">
      <div class="mode-round-head"><span class="eyebrow">كيف تمرّ الجولة</span><h2>ثلاث لحظات في ${h2(mode.name)}</h2><p>معاينة إيقاع — الطور لسه ما نزل.</p></div>
      ${beatList(mode)}
    </section>
  </main>`;
  return { active: "modes", title: mode.name, description: mode.premise, html, bind: bindWaitlist };
}
function bindWaitlist() {
  document.querySelectorAll(".mode-waitlist").forEach((button) => {
    button.addEventListener("click", () => {
      button.disabled = true;
      button.classList.add("on");
      button.textContent = "في قائمة انتظارك ✓";
      const note = document.querySelector(".mode-waitlist-note");
      if (note) {
        note.hidden = false;
        note.textContent = "هذه معاينة محلية — التسجيل الفعلي في قائمة الانتظار يبدأ عند إطلاق الطور. لم نرسل أي بيانات.";
      }
    });
  });
}
function modesHomeSection() {
  const live = MODES.filter((mode) => modeFamily(mode) === "live");
  const original = MODES.filter((mode) => modeFamily(mode) === "original");
  const anime = MODES.filter((mode) => modeFamily(mode) === "anime");
  const featured = [...live.slice(0, 1), ...original.slice(0, 2), ...anime.slice(0, 2)];
  return `<section class="home-modes on-dark" data-reveal>
    <div class="home-modes-head">
      <span class="eyebrow">عوالم BACKFIRE</span>
      <h2>طور واحد يبدأ الليلة.<br><em>وعوالم كثيرة على الطريق.</em></h2>
      <p>نفس القلب — معلومة مخبّأة وقرار سرّي وعاقبة ترجع — بس كل عالم يغيّر القاعدة والتوتر: أطوار أصلية، وعوالم مستوحاة من الأنمي.</p>
    </div>
    <div class="home-modes-rail">
      ${featured.map((mode) => `<a class="home-mode" data-link="/modes/mode?id=${mode.id}" style="--accent:${mode.accent}" aria-label="استعرض ${h2(mode.name)}">
        <span class="home-mode-art">${modeCover(mode.id, mode.accent)}</span>
        <span class="home-mode-cap"><span class="mode-flag ${mode.availability}">${availabilityLabel(mode.availability)}</span><b>${h2(mode.name)}</b><small dir="ltr">${h2(mode.codename)}</small></span>
      </a>`).join("")}
    </div>
    <div class="home-modes-cta"><a class="btn ghost lg" data-link="/modes">استكشف كل الأطوار</a></div>
  </section>`;
}
var MODES_PATHS = /* @__PURE__ */ new Set(["/modes", "/modes/mode"]);
function renderModesPage(path, search = "") {
  if (path === "/modes/mode") return modeDetail(search);
  return modesGallery();
}

// apps/dasssite/src/modes/modes-css.ts
function modesCss() {
  return `
  .modes-page .product-hero h1{line-height:.98}
  .mode-cover-art{display:block;width:100%;height:100%;object-fit:cover}

  /* local-only note (neutral, distinct from the amber demo banner) */
  .modes-note{display:flex;align-items:flex-start;gap:12px;margin:0 0 30px;padding:14px 16px;border:1px solid var(--line-2);border-radius:var(--r-2);background:var(--surface);color:var(--text-2)}
  .modes-note>div{display:grid;gap:3px}.modes-note b{color:var(--text)}.modes-note span:last-child{font-size:14px}
  .modes-note .demo-dot{background:var(--bf-red);box-shadow:0 0 14px var(--bf-red)}

  /* shared mode chrome */
  .mode-flags{display:flex;align-items:center;gap:10px}
  .mode-flag{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:900;letter-spacing:.04em;padding:5px 11px;border-radius:var(--r-pill);border:1px solid var(--line-2)}
  .mode-flag::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}
  .mode-flag.playable{color:var(--bf-red-soft);border-color:color-mix(in srgb,var(--bf-red-soft) 45%,transparent);background:color-mix(in srgb,var(--bf-red) 10%,transparent)}
  .mode-flag.playable::before{box-shadow:0 0 8px currentColor}
  .mode-flag.coming-soon{color:var(--bf-muted)}
  .mode-flag.waitlist{color:var(--bf-white)}
  .mode-code{font:900 11px/1 'Arial',sans-serif;letter-spacing:.16em;color:var(--bf-gray)}
  .mode-premise{color:var(--text);font-weight:700;line-height:1.5;margin:0}
  .mode-meta{display:flex;flex-wrap:wrap;gap:8px 18px;list-style:none;margin:0;padding:0}
  .mode-meta li{display:inline-flex;align-items:center;gap:7px;color:var(--text-2);font-size:14px;font-weight:700}
  .mode-meta svg{width:17px;height:17px;color:color-mix(in srgb,var(--accent) 78%,var(--bf-muted));flex:0 0 auto}
  .mode-hook{display:grid;gap:4px;margin:0;padding:14px 16px;border-inline-start:2px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent);border-radius:0 var(--r-2) var(--r-2) 0;color:var(--text);font-weight:700;line-height:1.5}
  .mode-hook span{font-size:11px;font-weight:900;letter-spacing:.12em;color:color-mix(in srgb,var(--accent) 82%,var(--bf-white));text-transform:uppercase}
  .mode-actions{display:flex;gap:10px;flex-wrap:wrap}
  .btn.on{background:color-mix(in srgb,var(--bf-red) 22%,var(--surface));border-color:var(--line-2);color:var(--bf-white)}

  /* featured mode — the playable one, cinematic and wide */
  .mode-featured{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:clamp(20px,3vw,44px);align-items:stretch;margin:0 0 clamp(40px,6vw,68px);padding:clamp(18px,2.2vw,26px);border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(140deg,color-mix(in srgb,var(--accent) 12%,var(--surface-2)),var(--surface));position:relative;overflow:hidden}
  .mode-featured::before{content:'';position:absolute;inset:0;background:radial-gradient(80% 90% at 12% 0,color-mix(in srgb,var(--accent) 16%,transparent),transparent 60%);pointer-events:none}
  .mode-featured-art{position:relative;z-index:1;display:block;border-radius:var(--r-2);overflow:hidden;aspect-ratio:5/6;box-shadow:0 30px 80px rgba(0,0,0,.5);transition:transform var(--t-comp) var(--e-out)}
  .mode-featured-art:hover{transform:translateY(-4px)}
  .mode-featured-copy{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:16px;padding:6px 4px}
  .mode-featured-copy h2{font-size:clamp(34px,4.6vw,60px);line-height:1;letter-spacing:-.03em;margin:2px 0}
  .mode-featured-copy .mode-premise{font-size:clamp(17px,1.5vw,21px)}

  /* three labelled sections: متاح الآن / الأصلية / مستوحى من الأنمي */
  .modes-section{margin:0 0 clamp(46px,7vw,80px)}
  .modes-section-head{margin:0 0 22px;padding-bottom:16px;border-bottom:1px solid var(--line)}
  .modes-section-head h2{font-size:var(--fs-h2);margin:10px 0 6px;letter-spacing:-.02em}
  .modes-section-head p{color:var(--muted);font-size:15px;line-height:1.6;margin:0;max-width:60ch}
  .modes-section-tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:900;letter-spacing:.04em;padding:5px 12px;border-radius:var(--r-pill);border:1px solid var(--line-2);color:var(--bf-muted)}
  .modes-section-tag::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}
  .modes-section-tag.live{color:var(--bf-red-soft);border-color:color-mix(in srgb,var(--bf-red-soft) 45%,transparent);background:color-mix(in srgb,var(--bf-red) 10%,transparent)}
  .modes-section-tag.live::before{box-shadow:0 0 8px currentColor}
  .modes-section-tag.anime{color:#cbb9e6;border-color:color-mix(in srgb,#8a6fb8 45%,transparent);background:color-mix(in srgb,#8a6fb8 12%,transparent)}
  .modes-section-live .mode-featured{margin-bottom:0}
  /* anime concept cards read as previews: dimmed cover, pressure line, disabled action */
  .mode-card.anime .mode-hook-sm{margin:0;font-size:13px;padding:11px 13px}
  .mode-card.anime .mode-hook-sm span{font-size:10px}
  .mode-card.anime .btn[disabled]{margin-top:12px;width:100%;opacity:.68;cursor:not-allowed}
  .mode-card.anime .mode-card-art::after{background:linear-gradient(180deg,rgba(8,8,8,.28) 0,transparent 34%,color-mix(in srgb,var(--accent) 16%,transparent) 76%,rgba(8,8,8,.82))}

  /* portal grid */
  .modes-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .mode-card{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp),box-shadow var(--t-comp)}
  .mode-card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line-2));box-shadow:0 30px 70px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent)}
  .mode-card-art{position:relative;display:block;aspect-ratio:5/6;overflow:hidden;border-bottom:1px solid var(--line)}
  .mode-card-art::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,color-mix(in srgb,var(--accent) 14%,transparent) 78%,rgba(8,8,8,.72));pointer-events:none}
  .mode-card-art .mode-cover-art{transition:transform var(--t-comp) var(--e-out)}
  .mode-card:hover .mode-card-art .mode-cover-art{transform:scale(1.045)}
  .mode-enter{position:absolute;z-index:2;inset-block-end:12px;inset-inline-start:14px;padding:7px 13px;border-radius:var(--r-pill);background:color-mix(in srgb,var(--accent) 88%,#000);color:var(--bf-white);font-size:12px;font-weight:900;opacity:0;transform:translateY(6px);transition:opacity var(--t-fast),transform var(--t-fast)}
  .mode-card:hover .mode-enter,.mode-card-art:focus-visible .mode-enter{opacity:1;transform:none}
  .mode-card-body{display:flex;flex-direction:column;gap:12px;padding:18px 18px 20px}
  .mode-card-body h3{margin:0;font-size:21px;letter-spacing:-.01em}
  .mode-card-body h3 a{color:inherit}
  .mode-card-body .mode-premise{font-size:15px;color:var(--text-2);font-weight:700;min-height:2.8em}
  .mode-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:14px;border-top:1px solid var(--line)}
  .mode-price{display:grid;gap:1px}.mode-price b{font-size:17px;color:var(--text)}.mode-price span{font-size:11px;color:var(--muted);font-weight:700}

  .modes-store-link{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:clamp(44px,6vw,72px) 0 0;padding:clamp(24px,3vw,36px);border:1px solid var(--line);border-radius:var(--r-3);background:var(--bg-1)}
  .modes-store-link h2{margin:8px 0 6px;font-size:clamp(22px,2.6vw,30px);letter-spacing:-.02em}
  .modes-store-link p{margin:0;color:var(--text-2);max-width:52ch;line-height:1.6}

  /* mode detail */
  .mode-back{display:inline-block;margin:0 0 14px;padding:4px 2px;color:var(--muted);font-weight:800}
  .mode-back:hover{color:var(--text)}
  .mode-detail{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:clamp(22px,4vw,52px);align-items:start}
  .mode-detail-art{position:relative;padding:0;overflow:hidden;aspect-ratio:5/6;border-radius:var(--r-3)}
  .mode-detail-art .mode-cover-art{width:100%;height:100%}
  .mode-detail-art-cap{position:absolute;inset-block-end:14px;inset-inline:14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mode-detail-copy{display:flex;flex-direction:column;gap:16px;padding-top:6px}
  .mode-detail-copy h1{font-size:clamp(40px,6vw,74px);line-height:.98;letter-spacing:-.03em;margin:0}
  .mode-detail-premise{font-size:clamp(18px,1.7vw,23px);font-weight:800;color:var(--text);line-height:1.4;margin:0}
  .mode-brief{color:var(--text-2);line-height:1.8;margin:0;font-size:16px}
  .mode-detail-meta{display:grid;grid-template-columns:repeat(4,1fr);margin:6px 0;border-block:1px solid var(--line)}
  .mode-detail-meta>div{display:grid;gap:5px;padding:16px 4px;border-inline-end:1px solid var(--line)}
  .mode-detail-meta>div:last-child{border-inline-end:0}
  .mode-detail-meta dt{color:var(--muted);font-size:12px;font-weight:800;letter-spacing:.04em}
  .mode-detail-meta dd{margin:0;font-weight:900;font-size:16px}
  .mode-detail-price{display:flex;align-items:baseline;gap:10px}
  .mode-detail-price b{font-size:26px}.mode-detail-price span{color:var(--muted);font-size:13px;font-weight:700}
  .mode-waitlist-note{margin:0;color:var(--text-2);font-size:13px;line-height:1.6}

  .mode-round{margin:clamp(50px,7vw,86px) 0 0;padding-top:clamp(30px,4vw,44px);border-top:1px solid var(--line)}
  .mode-round-head{margin-bottom:26px}
  .mode-round-head h2{font-size:var(--fs-h2);margin:12px 0 0;letter-spacing:-.02em}
  .mode-beats{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
  .mode-beats li{list-style:none;display:flex;gap:14px;align-items:flex-start;padding:26px 22px;background:var(--bg);min-height:120px}
  .mode-beats .beat-mark{flex:0 0 auto;width:9px;height:9px;margin-top:8px;background:var(--accent);transform:rotate(45deg)}
  .mode-beats span{font-size:17px;font-weight:700;color:var(--text);line-height:1.5}

  @media(max-width:900px){
    .mode-featured{grid-template-columns:1fr}
    .mode-featured-art{aspect-ratio:16/12;max-height:420px}
    .modes-grid{grid-template-columns:repeat(2,1fr)}
    .mode-detail{grid-template-columns:1fr}
    .mode-detail-art{max-width:440px;margin-inline:auto}
    .mode-beats{grid-template-columns:1fr}
    .mode-beats li{min-height:0}
  }
  @media(max-width:640px){
    .modes-grid{grid-template-columns:1fr}
    .mode-card-art{aspect-ratio:16/11}
    .mode-detail-meta{grid-template-columns:repeat(2,1fr)}
    .mode-detail-meta>div:nth-child(2n){border-inline-end:0}
    .mode-detail-meta>div:nth-child(-n+2){border-bottom:1px solid var(--line)}
    .modes-store-link{flex-direction:column;align-items:flex-start}
    .mode-featured-copy .mode-premise{min-height:0}
  }
  @media(prefers-reduced-motion:reduce){
    .mode-card,.mode-featured-art,.mode-card-art .mode-cover-art,.mode-enter{transition:none}
  }

  /* ---- home page featured-modes band (dark) ---- */
  .home-modes{position:relative;padding:clamp(80px,12vh,140px) var(--pad);background:radial-gradient(84% 80% at 78% 8%,#141013,var(--bf-black) 62%)}
  .home-modes-head{max-width:var(--maxw);margin:0 auto clamp(34px,5vw,54px)}
  .home-modes-head h2{font-size:clamp(2.1rem,4vw,4rem);line-height:1;letter-spacing:-.025em;margin:14px 0 16px;text-wrap:balance}
  .home-modes-head p{color:var(--bf-muted);font-size:clamp(16px,1.3vw,19px);line-height:1.7;max-width:52ch;margin:0}
  .home-modes-rail{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .home-mode{position:relative;display:block;border-radius:var(--r-3);overflow:hidden;border:1px solid var(--line);background:var(--bf-charcoal);transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp)}
  .home-mode:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line))}
  .home-mode-art{display:block;aspect-ratio:5/6;overflow:hidden}
  .home-mode-art .mode-cover-art{width:100%;height:100%;transition:transform var(--t-comp) var(--e-out)}
  .home-mode:hover .mode-cover-art{transform:scale(1.05)}
  .home-mode-cap{position:absolute;inset-block-end:0;inset-inline:0;display:grid;gap:3px;padding:16px 16px 14px;background:linear-gradient(transparent,rgba(8,8,8,.5) 34%,rgba(8,8,8,.92));text-align:start}
  .home-mode-cap .mode-flag{margin-bottom:6px;width:max-content;font-size:11px;padding:4px 9px}
  .home-mode-cap b{font-size:19px;color:var(--bf-white);letter-spacing:-.01em}
  .home-mode-cap small{font:900 10px/1 'Arial',sans-serif;letter-spacing:.16em;color:var(--bf-gray)}
  .home-modes-cta{max-width:var(--maxw);margin:clamp(30px,4vw,44px) auto 0;display:flex}
  @media(max-width:900px){.home-modes-rail{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.home-modes-rail{grid-template-columns:1fr 1fr;gap:12px}.home-mode-cap b{font-size:16px}.home-modes-cta .btn{width:100%}}
  `;
}

// apps/dasssite/src/site-brand.ts
var SITE_BRAND = "BACKFIRE";
var SOCIAL_PREVIEW_PATH = "/og-backfire.png";
var LEGACY_ARABIC_BRAND = "دسّ";
var LEGACY_DEMO_EMAIL = `demo@${"dass"}.local`;
function rebrandVisibleText(value) {
  return value.replaceAll(LEGACY_ARABIC_BRAND, SITE_BRAND).replaceAll(LEGACY_DEMO_EMAIL, "demo@backfire.local");
}

// apps/dasssite/src/site-product.ts
var demoJoinUrl = "/play?code=BF24X7";
var AVATARS = ["#b3202d", "#7e151e", "#8a4a2e", "#5c5c60", "#a3a3a5", "#d24850"];
function avatar(seat) {
  return AVATARS[seat % AVATARS.length] ?? "#b3202d";
}
function seatDot(initial, seat, cls = "") {
  return `<span class="p-av ${cls}" style="--av:${avatar(seat)}">${initial}</span>`;
}
var ICN = {
  support: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V7"/><path d="M6 13l6-6 6 6"/></svg>`,
  attack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v13"/><path d="M6 11l6 6 6-6"/></svg>`,
  vault: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="12" cy="12" r="3.4"/><path d="M12 12v3.6"/></svg>`
};
function ring(pct) {
  return `<span class="gs-ring" style="--p:${pct}"></span>`;
}
function secretBody(eyebrow, lead, note) {
  return `<div class="scr scr-secret"><span class="scr-eyebrow">${eyebrow}</span><p class="scr-lead">${lead}</p><div class="scr-seal"><span class="seal-mark"></span><span>${note}</span></div></div>`;
}
function GameScreenPreview(state = "round") {
  if (state === "lobby") {
    return `<div class="game-screen tv-lobby-screen" data-product-screen="tv-lobby">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-chip live">غرفة مفتوحة</span></header>
      <div class="lobby-body">
        <div class="lobby-qr">${qrSvg(demoJoinUrl, "#0d0d0e", "#f1f0ec", 2)}</div>
        <div class="lobby-join"><small>امسح الرمز من جوالك أو اكتبه</small><strong dir="ltr">BF24X7</strong><span class="lobby-count">٤ / ٨ جاهزين</span></div>
      </div>
      <div class="lobby-roster">${seatDot("ي", 0)}${seatDot("ت", 1)}${seatDot("س", 2)}${seatDot("ر", 3)}${seatDot("٥", 4, "ghost")}${seatDot("٦", 5, "ghost")}</div>
    </div>`;
  }
  if (state === "reveal") {
    return `<div class="game-screen tv-reveal-screen" data-product-screen="tv-reveal">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">الكشف</span><span class="gs-round mono" dir="ltr">4 / 8</span></header>
      <div class="reveal-list">
        <article class="rv dassa">${seatDot("ت", 1)}<div class="rv-copy"><small>تركي قال إنه بيدعم يزيد</small><b>غيّر قراره من وراهم</b></div><em class="rv-tag dassa">دسّة</em></article>
        <article class="rv kept">${seatDot("ي", 0)}<div class="rv-copy"><small>يزيد ثبّت على كلامه</small><b>التزم بوعده قدّام المجلس</b></div><em class="rv-tag kept">التزم</em></article>
      </div>
      <footer class="reveal-foot"><span>الأثر الجاي</span><strong>المسار رجع على تركي</strong></footer>
    </div>`;
  }
  if (state === "consequence") {
    return `<div class="game-screen tv-conseq-screen" data-product-screen="tv-consequence">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">النتيجة العامة</span><span class="gs-round mono" dir="ltr">4 / 8</span></header>
      <div class="conseq-body"><span class="conseq-eyebrow">تغيّر إيقاع الغرفة</span><h3>طاحت خزنة راكان،<br><em>وارتفع رصيد تركي.</em></h3></div>
      <div class="conseq-bars">
        <span class="cb up" style="--h:78%">${seatDot("ت", 1)}<i>+٦</i></span>
        <span class="cb up" style="--h:54%">${seatDot("ي", 0)}<i>+٢</i></span>
        <span class="cb flat" style="--h:40%">${seatDot("س", 2)}<i>٠</i></span>
        <span class="cb down" style="--h:22%">${seatDot("ر", 3)}<i>−٤</i></span>
      </div>
    </div>`;
  }
  return `<div class="game-screen tv-round-screen" data-product-screen="tv-round">
    <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">الإعلان</span><span class="gs-round mono" dir="ltr">3 / 8</span>${ring(0.62)}</header>
    <div class="round-prompt"><small>أعلنوا نيّاتكم على جوالاتكم</small><strong class="round-count" dir="ltr">12</strong></div>
    <div class="round-floor">
      <span class="rf-col"><i class="rf-intent up">${ICN.support}</i><span class="rf-bar" style="--h:70%"></span>${seatDot("ي", 0)}</span>
      <span class="rf-col"><i class="rf-intent"></i><span class="rf-bar" style="--h:48%"></span>${seatDot("ت", 1)}</span>
      <span class="rf-col"><i class="rf-intent dn">${ICN.attack}</i><span class="rf-bar" style="--h:86%"></span>${seatDot("ر", 3)}</span>
      <span class="rf-col"><i class="rf-intent"></i><span class="rf-bar" style="--h:34%"></span>${seatDot("س", 2)}</span>
      <span class="rf-col wait"><i class="rf-intent">◌</i><span class="rf-bar" style="--h:58%"></span>${seatDot("خ", 4)}</span>
    </div>
  </div>`;
}
function phoneChip(state) {
  const chips = { secret: "الجولة ٣", decision: "الإعلان", waiting: "قُفل", backfire: "الكشف", join: "" };
  return chips[state] ? `<span class="app-chip">${chips[state]}</span>` : `<span class="app-chip ghost">جوّالك</span>`;
}
function phoneScreen(state) {
  switch (state) {
    case "secret":
      return secretBody("معلومة تخصّك وحدك", "راكان يقدر يغيّر اتجاه القرار بعد ما تُقفلونه.", "لا أحد غيرك يعرف هذا الآن");
    case "decision":
      return `<div class="scr scr-pick">
        <span class="scr-eyebrow">أعلن نيّتك</span>
        <div class="pick-acts"><span class="pa up on">${ICN.support}<b>دعم</b></span><span class="pa dn">${ICN.attack}<b>هجوم</b></span><span class="pa gd">${ICN.vault}<b>خزنة</b></span></div>
        <span class="pick-label">أدعم مين؟</span>
        <div class="pick-chips"><span class="pchip on">${seatDot("ي", 0, "sm")}يزيد</span><span class="pchip">${seatDot("ر", 3, "sm")}راكان</span><span class="pchip">${seatDot("س", 2, "sm")}سعود</span></div>
        <span class="scr-confirm">اقفل الفعل</span>
      </div>`;
    case "waiting":
      return `<div class="scr scr-wait"><span class="wait-seal">${ICN.vault}</span><p class="scr-lead">أقفلت فعلك</p><span class="scr-note">ارفع عينك للتلفاز</span><div class="wait-dots"><i class="on"></i><i class="on"></i><i></i><i class="on"></i></div></div>`;
    case "backfire":
      return `<div class="scr scr-result"><span class="scr-eyebrow warn">رجع عليك</span><span class="result-arrow" aria-hidden="true">↩</span><p class="scr-lead">المسار الذي عطّلته صار طريقك الوحيد.</p><span class="result-delta" dir="ltr">−4</span><span class="scr-note">الجولة القادمة تغيّرت</span></div>`;
    case "join":
      return `<div class="scr scr-join"><span class="scr-eyebrow">انضمام</span><b class="scr-title">خشّ المجلس</b><span class="join-field mono" dir="ltr">BF24X7</span><span class="join-field ghost">اسمك</span><span class="scr-confirm">انضم</span></div>`;
  }
}
function PhoneMockup(state, label, extraClass = "", body) {
  return `<div class="phone-unit ${state} ${extraClass}" data-product-screen="player-${state}">${label ? `<span class="device-label">${label}</span>` : ""}<div class="phone-shell">
    <span class="phone-island"></span><span class="phone-btn vol"></span><span class="phone-btn pow"></span>
    <div class="phone-screen">
      <div class="app-top"><span class="app-brand"><span class="app-mark"></span><b>BACKFIRE</b></span>${phoneChip(state)}</div>
      <div class="app-body">${body ?? phoneScreen(state)}</div>
    </div>
    <span class="home-ind"></span>
  </div></div>`;
}
function TvStage(state = "round", className = "") {
  return `<div class="tv-stage ${className}"><div class="tv-frame"><div class="tv-bezel">${GameScreenPreview(state)}<span class="tv-glare" aria-hidden="true"></span></div><span class="tv-led"></span></div><div class="tv-neck"></div><div class="tv-foot"></div></div>`;
}

// apps/dasssite/src/site-scenes.ts
var NOIR = {
  black: "#080808",
  ink: "#0c0c0d",
  charcoal: "#151517",
  graphite: "#222226",
  lead: "#3a3a40",
  steel: "#66666d",
  gray: "#808088",
  muted: "#9a9a9f",
  paper: "#f0efea",
  paperShadow: "#d8d6d0",
  white: "#fafaf7",
  red: "#b72e38",
  redDark: "#811c25",
  redSoft: "#c8454d"
};
function bust(fill) {
  return `<circle cx="50" cy="62" r="26" fill="${fill}"/><path d="M4 150 C4 110 27 96 50 96 C73 96 96 110 96 150 Z" fill="${fill}"/>`;
}
function place(x, y, s, inner) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
}
function rect(x, y, w, h3, fill, extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h3}" fill="${fill}"${extra ? " " + extra : ""}/>`;
}
function silhouette2(fill, o = {}) {
  const hr = o.hr ?? 24;
  const hx = o.hx ?? 50;
  const hy = o.hy ?? 62;
  const sw = o.sw ?? 92;
  const rise = o.rise ?? 0;
  const neck = o.neck ?? 98;
  const l = 50 - sw / 2;
  const r = 50 + sw / 2;
  const body = `M${l} 152 C${l} ${neck + 24 + rise} ${l + 20} ${neck + rise} ${hx} ${neck} C${r - 20} ${neck - rise} ${r} ${neck + 24 - rise} ${r} 152 Z`;
  return `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${fill}"/><path d="${body}" fill="${fill}"/>`;
}
function person2(x, y, s, fill, o = {}) {
  return place(x, y, s, silhouette2(fill, o));
}
function phone2(cx, cy, s, rot, screen, glowId = "") {
  const w = 30;
  const h3 = 60;
  const halo = glowId ? `<ellipse cx="0" cy="0" rx="40" ry="58" fill="${screen}" opacity=".22" filter="url(#${glowId})"/>` : "";
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})">${halo}<rect x="${-w / 2}" y="${-h3 / 2}" width="${w}" height="${h3}" rx="6" fill="${NOIR.charcoal}" stroke="${NOIR.lead}" stroke-width="1.4"/><rect x="${-w / 2 + 3.5}" y="${-h3 / 2 + 6}" width="${w - 7}" height="${h3 - 12}" rx="3" fill="${screen}"/></g>`;
}
function joinGlyph2(x, y, u, fill) {
  const cells = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2], [4, 0], [4, 2], [1, 4], [3, 4], [4, 4], [0, 4]];
  return cells.map(([cx, cy]) => rect(x + cx * u, y + cy * u, u * 0.8, u * 0.8, fill, 'opacity=".8"')).join("");
}
function HeroScene() {
  return `<svg class="scene hero-scene" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="غرفة معيشة: خمسة أشخاص حول تلفزيون واحد مضاء، كل واحد يمسك جوالًا، وخط أحمر يخرج من جوال إلى الشاشة ثم يعود كعاقبة نحو صاحبه">
    <defs>
      <radialGradient id="hero-glow" cx="50%" cy="34%" r="60%"><stop offset="0" stop-color="${NOIR.red}" stop-opacity=".22"/><stop offset="1" stop-color="${NOIR.red}" stop-opacity="0"/></radialGradient>
      <linearGradient id="hero-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NOIR.graphite}"/><stop offset="1" stop-color="${NOIR.black}"/></linearGradient>
      <filter id="hero-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="hero-sh" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000" flood-opacity=".5"/></filter>
      <clipPath id="hero-tv"><rect x="330" y="84" width="340" height="196" rx="6"/></clipPath>
    </defs>
    <!-- ambient light thrown by the TV -->
    <ellipse cx="500" cy="220" rx="380" ry="250" fill="url(#hero-glow)"/>
    <!-- TV: the one shared screen -->
    <rect x="486" y="290" width="28" height="34" fill="${NOIR.graphite}"/>
    <ellipse cx="500" cy="330" rx="78" ry="12" fill="${NOIR.ink}"/>
    <g filter="url(#hero-sh)"><rect x="314" y="70" width="372" height="224" rx="12" fill="${NOIR.charcoal}" stroke="${NOIR.lead}" stroke-width="2"/></g>
    <rect x="330" y="84" width="340" height="196" rx="6" fill="url(#hero-screen)"/>
    <g clip-path="url(#hero-tv)">
      <line x1="330" y1="214" x2="670" y2="214" stroke="${NOIR.steel}" stroke-width="1.4" opacity=".3"/>
      ${person2(392, 118, 0.74, NOIR.steel, { hx: 54, sw: 96 })}
      ${person2(488, 128, 0.66, NOIR.lead, { hx: 44, sw: 92 })}
      <rect x="470" y="196" width="40" height="22" rx="2" fill="${NOIR.red}" transform="rotate(-8 490 207)"/>
      <circle cx="352" cy="106" r="5" fill="${NOIR.red}"/>
      <rect x="364" y="102" width="26" height="7" rx="2" fill="${NOIR.steel}" opacity=".7"/>
      <rect x="396" y="102" width="16" height="7" rx="2" fill="${NOIR.steel}" opacity=".5"/>
      ${joinGlyph2(600, 224, 9, NOIR.muted)}
    </g>
    <!-- the gathered players, seen from behind, facing the TV -->
    ${person2(150, 300, 1.3, NOIR.lead, { hx: 52, sw: 88, hr: 22 })}
    ${person2(770, 300, 1.3, NOIR.lead, { hx: 48, sw: 88, hr: 22 })}
    ${person2(300, 336, 1.5, NOIR.steel, { sw: 96 })}
    ${person2(625, 336, 1.5, NOIR.steel, { hx: 54, sw: 96 })}
    ${person2(417, 356, 1.66, NOIR.muted, { sw: 100 })}
    <!-- every phone throws a faint decision line up to the shared screen -->
    <g stroke="${NOIR.steel}" stroke-width="1.4" fill="none" opacity=".32" stroke-linecap="round">
      <path d="M240 452 C 340 380 430 320 496 290"/>
      <path d="M362 500 C 410 420 460 340 500 292"/>
      <path d="M640 500 C 592 420 542 340 504 292"/>
      <path d="M760 452 C 660 380 570 320 504 290"/>
    </g>
    <!-- the five phones; the central one is the live red decision -->
    ${phone2(240, 466, 0.62, -14, NOIR.muted)}
    ${phone2(362, 516, 0.8, -8, NOIR.muted)}
    ${phone2(640, 516, 0.8, 9, NOIR.muted)}
    ${phone2(760, 466, 0.62, 13, NOIR.muted)}
    ${phone2(500, 552, 0.98, 0, NOIR.red, "hero-soft")}
    <!-- the Return Line: the red decision rises to the TV, then the consequence loops back onto its sender -->
    <path class="cs-shadow" d="M500 524 C 494 452 500 372 500 300 C 500 250 612 246 606 336 C 600 408 546 440 508 452" fill="none" stroke="${NOIR.graphite}" stroke-width="8" stroke-linecap="round" transform="translate(9 12)"/>
    <path class="return-line rl-draw" pathLength="1" d="M500 524 C 494 452 500 372 500 300 C 500 250 612 246 606 336 C 600 408 546 440 508 452" fill="none" stroke="${NOIR.red}" stroke-width="2.6" stroke-linecap="round"/>
    <circle class="rl-src" cx="500" cy="524" r="6" fill="${NOIR.redSoft}"/>
    <path class="rl-head" d="M508 452 l16 -10 4 20z" fill="${NOIR.red}"/>
  </svg>`;
}
function IncompleteScene() {
  const truth = person2(-8, 44, 2.9, NOIR.steel, { hx: 58, sw: 98 }) + person2(360, 96, 2.6, NOIR.lead, { hx: 42, sw: 92 }) + rect(20, 456, 620, 16, NOIR.lead) + rect(150, 402, 96, 54, NOIR.muted) + rect(300, 406, 84, 50, NOIR.steel) + rect(472, 300, 66, 74, NOIR.red);
  const holders = [
    { id: "a", x: 48, y: 150, w: 150, h: 250, head: 118 },
    // ← a person fragment
    { id: "b", x: 250, y: 250, w: 150, h: 250, head: 220 },
    // ← the table + decision
    { id: "c", x: 452, y: 168, w: 150, h: 250, head: 136 }
    // ← the red clue + a person
  ];
  const phoneFragment = (p) => `
    ${person2(p.x + p.w / 2 - 42, p.head - 26, 0.84, NOIR.graphite, { sw: 96 })}
    <rect x="${p.x - 9}" y="${p.y - 9}" width="${p.w + 18}" height="${p.h + 18}" rx="15" fill="${NOIR.ink}" stroke="${NOIR.lead}" stroke-width="1.6"/>
    <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" fill="${NOIR.black}"/>
    <clipPath id="frag-${p.id}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6"/></clipPath>
    <g clip-path="url(#frag-${p.id})">${truth}</g>
    <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" fill="none" stroke="${NOIR.steel}" stroke-width="1" opacity=".55"/>
    <rect x="${p.x + p.w / 2 - 15}" y="${p.y - 5}" width="30" height="3.4" rx="1.7" fill="${NOIR.lead}"/>`;
  return `<svg class="scene incomplete-scene" viewBox="0 0 660 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مشهد واحد كامل مخفيّ في الخلفية، وأجزاؤه موزّعة على ثلاثة جوالات يمسكها ثلاثة لاعبين، بينها فجوات مظلمة، ولا أحد يرى الصورة كاملة">
    <defs>
      <filter id="inc-sh" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#0c0c0d" flood-opacity=".34"/></filter>
    </defs>
    <rect width="660" height="560" fill="${NOIR.black}"/>
    <!-- the whole truth, present but unlit -->
    <g opacity=".12">${truth}</g>
    <g filter="url(#inc-sh)">${holders.map(phoneFragment).join("")}</g>
    <!-- the picture line that the fragments never fully rebuild -->
    <path d="M52 500 L 240 500" stroke="${NOIR.lead}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
    <path d="M266 500 L 442 500" stroke="${NOIR.lead}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
    <path d="M468 500 L 610 500" stroke="${NOIR.red}" stroke-width="2.4"/>
  </svg>`;
}
function PrivateScene() {
  const known = { x: 150, y: 214, s: 1.62 };
  const kcx = known.x + 50 * known.s;
  return `<svg class="scene private-scene" viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مجموعة لاعبين مربوطين بخيوط رمادية متساوية، جوال أحدهم يضيء بالأحمر بمعلومة خاصة، فيتقدّم عن الصف ويرسم خطًّا أحمر جديدًا نحو لاعب آخر بينما ينقطع خيطه القديم">
    <defs>
      <filter id="pv-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect x="30" y="452" width="580" height="20" fill="${NOIR.ink}"/>
    <!-- the public, neutral group -->
    ${person2(46, 250, 1.12, NOIR.steel, { sw: 92 })}
    ${person2(300, 246, 1.16, NOIR.steel, { hx: 52, sw: 94, rise: 4 })}
    ${person2(430, 252, 1.12, NOIR.steel, { sw: 90 })}
    ${person2(552, 258, 1.02, NOIR.lead, { sw: 84, rise: -6 })}
    <!-- the even ties everyone shares -->
    <g stroke="${NOIR.steel}" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round">
      <path d="M103 300 C 180 268 250 268 358 300"/>
      <path d="M486 300 C 520 288 560 288 603 306"/>
    </g>
    <!-- the old tie from the knower to their neighbour — now snapped -->
    <path d="M${kcx} 300 C 300 262 340 262 358 300" fill="none" stroke="${NOIR.lead}" stroke-width="1.6" stroke-dasharray="5 9" opacity=".45"/>
    <!-- the knower steps forward, brighter -->
    ${person2(known.x, known.y, known.s, NOIR.muted, { hx: 52, sw: 96 })}
    <!-- the private red info, on their phone only -->
    <ellipse class="pv-secret" cx="${kcx + 40}" cy="360" rx="34" ry="46" fill="${NOIR.red}" opacity=".2" filter="url(#pv-soft)"/>
    ${phoneReveal(kcx + 40, 360)}
    <!-- the new intent the knowledge creates: a red line redrawn across the group -->
    <path class="rl-draw" pathLength="1" d="M${kcx + 40} 348 C 360 300 470 300 560 320" fill="none" stroke="${NOIR.red}" stroke-width="2.6" stroke-linecap="round"/>
    <path class="rl-head" d="M560 320 l-18 -6 4 20z" fill="${NOIR.red}"/>
    <circle class="rl-src" cx="${kcx + 40}" cy="348" r="5" fill="${NOIR.redSoft}"/>
  </svg>`;
}
function phoneReveal(cx, cy) {
  return `<g transform="translate(${cx} ${cy}) rotate(-8)"><rect x="-19" y="-38" width="38" height="76" rx="7" fill="${NOIR.charcoal}" stroke="${NOIR.lead}" stroke-width="1.6"/><rect class="pv-secret" x="-14" y="-31" width="28" height="62" rx="3" fill="${NOIR.red}"/><rect class="pv-secret" x="-8" y="-18" width="16" height="6" rx="2" fill="${NOIR.white}" opacity=".85"/><rect class="pv-secret" x="-8" y="-6" width="24" height="5" rx="2" fill="${NOIR.white}" opacity=".6"/></g>`;
}
function ConsequenceScene() {
  return `<svg class="scene consequence-scene" viewBox="0 0 1000 580" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ظل يمثل صاحب القرار، خط أحمر يخرج منه ويضرب شخصًا آخر، ثم يعود ليقع عليه كظل أثقل ومنحرف">
    ${place(70, 214, 2.02, bust(NOIR.graphite))}
    ${place(120, 250, 1.78, bust(NOIR.steel))}
    <rect x="150" y="262" width="42" height="8" rx="1" fill="${NOIR.paper}" opacity=".85"/>
    ${place(560, 300, 1.5, bust(NOIR.lead))}
    <circle class="cs-impact" cx="632" cy="392" r="12" fill="${NOIR.red}"/>
    <path class="cs-shadow" d="M250 358 C 420 316 520 340 632 392 C 770 456 856 356 762 300 C 700 264 560 300 250 452" fill="none" stroke="${NOIR.graphite}" stroke-width="12" stroke-linecap="round" transform="translate(14 16)"/>
    <path class="cs-line rl-draw" pathLength="1" d="M250 358 C 420 316 520 340 632 392 C 770 456 856 356 762 300 C 700 264 560 300 250 452" fill="none" stroke="${NOIR.red}" stroke-width="2.8" stroke-linecap="round"/>
    <path class="cs-return" d="M300 430 C 270 442 250 448 234 452" fill="none" stroke="${NOIR.red}" stroke-width="5.4" stroke-linecap="round"/>
    <circle class="cs-src" cx="250" cy="358" r="8" fill="${NOIR.redSoft}"/>
    <path class="cs-head" d="M234 452 l30 -20 3 32z" fill="${NOIR.red}"/>
  </svg>`;
}
function FinalScene() {
  return `<svg class="scene final-scene" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path class="fs-shadow" d="M452 120 C 690 120 760 300 620 400 C 470 508 250 470 220 320 C 196 200 320 150 470 176" fill="none" stroke="${NOIR.graphite}" stroke-width="12" stroke-linecap="round" transform="translate(14 16)"/>
    <path class="fs-line rl-draw" pathLength="1" d="M450 108 C 690 108 762 292 620 392 C 466 502 244 462 216 312 C 194 196 322 142 470 168" fill="none" stroke="${NOIR.red}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="450" cy="108" r="7" fill="${NOIR.redSoft}"/>
    <path class="fs-head" d="M470 168 l-30 -14 2 30z" fill="${NOIR.red}"/>
  </svg>`;
}

// apps/dasssite/src/site-theme.ts
var SITE_CSS = String.raw`
:root[data-site-theme="backfire"]{
  color-scheme:dark;
  /* Editorial-noir palette: black / graphite / paper, with a single controlled red. */
  --bf-black:#080808;--bf-ink:#0c0c0d;--bf-charcoal:#151517;--bf-graphite:#222226;--bf-lead:#3a3a40;--bf-steel:#66666d;--bf-gray:#7c7c83;--bf-muted:#9a9a9f;--bf-paper:#f0efea;--bf-paper-shadow:#d8d6d0;--bf-white:#fafaf7;--bf-red:#b72e38;--bf-red-dark:#811c25;--bf-red-soft:#c8454d;--bf-ink-2:#404046;
  --maxw:1440px;--pad:clamp(20px,5vw,84px);
  --space-3:.75rem;--space-4:1rem;--space-5:1.5rem;--space-6:2rem;--space-7:3rem;--space-8:4.5rem;--space-9:6rem;
  --e-out:cubic-bezier(.22,1,.36,1);--t-fast:200ms;--t-micro:180ms;--t-instant:120ms;--t-comp:520ms;
  --line:rgba(250,250,247,.12);--line-2:rgba(250,250,247,.2);--line-3:rgba(250,250,247,.28);
  --shadow:0 30px 90px rgba(0,0,0,.6);--shadow-1:0 14px 40px rgba(0,0,0,.5);
  /* compatibility map for the commercial product/store pages (kept dark, neutral, warm-red accent) */
  --bg:var(--bf-black);--bg-1:var(--bf-ink);--surface:var(--bf-charcoal);--surface-2:var(--bf-graphite);--surface-3:#2c2c30;--text:var(--bf-white);--text-2:var(--bf-muted);--muted:var(--bf-gray);--warm:var(--bf-white);--warm-2:#d7d6d2;--crimson:var(--bf-red-dark);--wine:#1a1013;--red:var(--bf-red);--red-hot:var(--bf-red-soft);--ember:var(--bf-red-soft);--gold:var(--bf-red);--violet:var(--bf-red);--cyan:var(--bf-red-soft);--green:var(--bf-muted);--accent:var(--bf-red);
  --z-content:2;--r-2:8px;--r-3:12px;--r-pill:999px;--fs-h1:clamp(40px,6vw,74px);--fs-h2:clamp(28px,4vw,46px);--fs-h3:19px;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{background:var(--bf-black);scroll-behavior:smooth;scrollbar-color:var(--bf-lead) var(--bf-black)}
body.backfire-site{margin:0;min-width:320px;background:var(--bf-black);color:var(--bf-white);font-family:'Tajawal','Segoe UI',Tahoma,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
/* One quiet film-grain layer across the whole page, blended so it reads on paper and black alike. */
body.backfire-site::after{content:'';position:fixed;inset:0;z-index:120;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.backfire-site a,.backfire-site button,.backfire-site input{font:inherit;color:inherit}
.backfire-site a{cursor:pointer;text-decoration:none}
.backfire-site a,.backfire-site button{touch-action:manipulation}
.backfire-site ::selection{background:var(--bf-red);color:var(--bf-white)}
:focus-visible{outline:2px solid var(--bf-red-soft);outline-offset:3px}
img,svg{max-width:100%}
em{font-style:normal;color:var(--bf-red)}

.scene{display:block;width:100%;height:100%}
[data-reveal]{opacity:0;transform:translateY(22px);transition:opacity .8s var(--e-out),transform .8s var(--e-out)}
[data-reveal].revealed{opacity:1;transform:none}
.rl-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.15s var(--e-out) .15s}
.revealed .rl-draw{stroke-dashoffset:0}
.rl-head,.cs-head,.cs-return,.fs-head,.rl-src,.cs-src,.cs-impact{opacity:0;transition:opacity .5s var(--e-out) .9s}
.revealed .rl-head,.revealed .cs-head,.revealed .cs-return,.revealed .fs-head,.revealed .rl-src,.revealed .cs-src,.revealed .cs-impact{opacity:1}
.pv-secret{opacity:0;transition:opacity .55s var(--e-out) .45s}.revealed .pv-secret{opacity:1}

.skip-link{position:fixed;z-index:1000;inset-block-start:10px;inset-inline-start:10px;transform:translateY(-160%);background:var(--bf-white);color:var(--bf-black);padding:10px 14px;border-radius:4px;font-weight:800}
.skip-link:focus{transform:none}

/* ---------------- header ---------------- */
.site-head{position:fixed;z-index:60;inset-block-start:0;inset-inline:0;height:74px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding-inline:var(--pad);transition:background var(--t-fast),border-color var(--t-fast),height var(--t-fast);border-block-end:1px solid transparent}
.site-head.scrolled{height:64px;background:rgba(8,8,8,.86);backdrop-filter:blur(10px);border-block-end-color:var(--line)}
.bf-word{display:inline-block;font:900 clamp(1.35rem,2vw,1.7rem)/1 'Arial Black','Segoe UI',sans-serif;letter-spacing:.03em;color:var(--bf-white);direction:ltr}
.head-nav{display:flex;align-items:center;gap:clamp(14px,2vw,28px)}
.head-nav a{font-size:14px;font-weight:700;color:var(--bf-muted)}
.head-nav a:hover{color:var(--bf-white)}
.head-actions{display:flex;align-items:center;gap:10px}.nav-logo{display:inline-flex;align-items:center;align-self:stretch}
.head-account{display:inline-flex;align-items:center;height:42px;padding-inline:14px;border:1px solid var(--line-2);color:var(--bf-white);font-weight:700;border-radius:4px;font-size:14px}
.head-account:hover,.head-account.on{border-color:var(--bf-white);background:rgba(255,255,255,.05)}
.head-cta{display:inline-flex;align-items:center;height:42px;padding-inline:18px;background:var(--bf-red);color:var(--bf-white);font-weight:800;border-radius:4px;font-size:14px}
.head-cta:hover{background:var(--bf-red-soft)}
.mobile-panel .mpanel-account{color:var(--bf-white)}
.mobile-panel .mpanel-cta{color:var(--bf-red);font-weight:800}
.head-menu{display:none;width:44px;height:44px;border:1px solid var(--line-2);background:transparent;border-radius:4px;place-items:center;cursor:pointer}
.head-menu span{position:absolute;width:18px;height:2px;background:var(--bf-white);transition:.2s}
.head-menu span:first-child{transform:translateY(-4px)}.head-menu span:last-child{transform:translateY(4px)}
.menu-open .head-menu span:first-child{transform:rotate(45deg)}.menu-open .head-menu span:last-child{transform:rotate(-45deg)}
.mobile-panel{position:fixed;z-index:59;inset-block-start:64px;inset-inline:12px;padding:8px;background:rgba(13,13,14,.98);border:1px solid var(--line-2);border-radius:8px}
.mobile-panel a{display:block;padding:15px;color:var(--bf-white);font-weight:700;border-block-end:1px solid var(--line)}
.mobile-panel a:last-child{border:0}

/* ---------------- buttons ---------------- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding-inline:24px;border:1px solid transparent;border-radius:5px;font-weight:800;cursor:pointer;transition:transform var(--t-micro) var(--e-out),background var(--t-micro),border-color var(--t-micro),color var(--t-micro)}
.btn.lg{min-height:56px;padding-inline:30px;font-size:16px}
.btn.wide{width:100%}
.btn.primary{background:var(--bf-red);color:var(--bf-white)}
.btn.primary:hover{background:var(--bf-red-soft);transform:translateY(-2px)}
.btn.ghost{background:transparent;border-color:var(--line-3);color:var(--bf-white)}
.btn.ghost:hover{border-color:var(--bf-white);transform:translateY(-2px)}
.on-paper .btn.ghost{border-color:rgba(13,13,14,.28);color:var(--bf-ink)}
.on-paper .btn.ghost:hover{border-color:var(--bf-ink)}
.btn[disabled]{opacity:.55;cursor:wait;transform:none}
.text-link{color:var(--bf-red-soft);font-weight:700;text-underline-offset:5px}
.on-paper .text-link{color:var(--bf-red)}

/* ---------------- section scaffolding + tonal rhythm ---------------- */
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--bf-red-soft);text-transform:uppercase}
.eyebrow::before{content:'';width:26px;height:2px;background:currentColor}
.on-paper .eyebrow{color:var(--bf-red)}
.poster{position:relative;min-height:clamp(560px,84svh,880px);display:grid;align-items:center;padding-block:clamp(80px,12vh,148px);padding-inline:var(--pad)}
.poster-inner{width:100%;max-width:var(--maxw);margin-inline:auto;display:grid;gap:clamp(28px,5vw,80px);align-items:center}
.poster h2{font-size:clamp(2.2rem,4.2vw,4.8rem);line-height:1;letter-spacing:-.025em;margin:14px 0 18px;text-wrap:balance}
.poster p{font-size:clamp(17px,1.35vw,21px);line-height:1.7;max-width:34ch;margin:0}
.on-dark{color:var(--bf-white)}.on-dark p{color:var(--bf-muted)}
.on-paper{color:var(--bf-ink)}.on-paper p{color:var(--bf-lead)}

/* hero */
.hero-noir{position:relative;min-height:100svh;overflow:hidden;background:radial-gradient(130% 100% at 50% 8%,#141416,var(--bf-black) 60%);display:flex;align-items:flex-start}
.hero-inner{position:relative;z-index:2;width:100%;max-width:var(--maxw);margin-inline:auto;padding:clamp(110px,14vh,172px) var(--pad) 0}
.hero-copy{max-width:min(620px,92%)}
.hero-noir h1{font-size:clamp(3rem,6vw,6.4rem);line-height:.98;letter-spacing:-.035em;margin:18px 0 20px;text-wrap:balance}
.hero-lead{font-size:clamp(17px,1.35vw,21px);line-height:1.7;color:var(--bf-muted);max-width:34ch;margin:0}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-block-start:30px}
.hero-note{display:flex;align-items:center;gap:9px;margin-block-start:22px;color:var(--bf-gray);font-size:12px}
.hero-note i{width:7px;height:7px;border-radius:50%;background:var(--bf-red);flex:0 0 auto}
.hero-facts{display:flex;flex-wrap:wrap;align-items:center;gap:9px 18px;list-style:none;margin:20px 0 0;padding:0;color:var(--bf-muted);font-size:13px;font-weight:700}
.hero-facts li{display:inline-flex;align-items:center;gap:8px}
.hero-facts li::before{content:'';width:5px;height:5px;background:var(--bf-red);transform:rotate(45deg);flex:0 0 auto}
.hero-art{position:absolute;z-index:1;left:calc(var(--pad) - 10px);bottom:8%;width:min(52%,880px)}
.hero-art .hero-scene{width:100%;height:auto;display:block}
.scroll-cue{position:absolute;z-index:2;inset-block-end:22px;inset-inline-start:50%;transform:translateX(-50%);display:grid;justify-items:center;gap:6px;color:var(--bf-gray);font-size:10px}
.scroll-cue i{width:1px;height:26px;background:linear-gradient(var(--bf-red),transparent)}

/* Poster 01 — incomplete picture: a paper editorial panel framed by a dark section,
   so the jump from black is a bridge, not a wall. A red seam carries the eye across. */
.poster-incomplete{position:relative;background:var(--bf-charcoal)}
.poster-incomplete .poster-inner{grid-template-columns:1.05fr .95fr;background:var(--bf-paper);color:var(--bf-ink);padding:clamp(34px,4.4vw,70px);box-shadow:0 46px 100px rgba(0,0,0,.5)}
.poster-incomplete .poster-art{order:-1}
.incomplete-scene{aspect-ratio:660/560;filter:drop-shadow(0 14px 30px rgba(0,0,0,.16))}

/* Poster 02 — private knowledge (graphite) */
.poster-private{background:var(--bf-graphite)}
.poster-private .poster-inner{grid-template-columns:.92fr 1.08fr}
.private-scene{aspect-ratio:640/520}

/* Social tension — one editorial, typographic beat: a statement + a wall of overheard accusations. No cards, no chat UI. */
.social-noir{position:relative;min-height:clamp(520px,76svh,800px);display:grid;align-items:center;padding:clamp(80px,12vh,146px) var(--pad);background:radial-gradient(78% 72% at 28% 42%,#150a0c,var(--bf-black) 60%)}
.social-inner{width:100%;max-width:var(--maxw);margin-inline:auto;display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(28px,5vw,66px);align-items:center}
.social-copy{max-width:22ch}
.social-head{font-size:clamp(2.2rem,4.4vw,4.8rem);line-height:1;letter-spacing:-.025em;margin:14px 0 18px;text-wrap:balance}
.social-note{color:var(--bf-muted);font-size:clamp(15px,1.2vw,18px);line-height:1.7;max-width:44ch;margin:0}
.social-lines{position:relative;height:clamp(300px,44vh,430px)}
.sl{position:absolute;white-space:nowrap;font-weight:900;color:var(--bf-white);letter-spacing:-.01em}
.sl-1{top:3%;inset-inline-end:2%;font-size:clamp(19px,2.4vw,32px);transform:rotate(-2deg)}
.sl-2{top:31%;inset-inline-start:0;font-size:clamp(16px,1.9vw,25px);color:var(--bf-muted);transform:rotate(1deg)}
.sl-3{top:55%;inset-inline-end:5%;font-size:clamp(17px,2.1vw,27px);transform:rotate(-1deg)}
.sl-4{bottom:2%;inset-inline-start:3%;font-size:clamp(22px,2.9vw,40px);color:var(--bf-red-soft);transform:rotate(2deg)}

/* Consequence (black, the red event) */
.poster-consequence{background:radial-gradient(88% 78% at 60% 52%,#160a0c,var(--bf-black) 62%)}
.poster-consequence .poster-inner{grid-template-columns:.94fr 1.06fr}
.poster-consequence h2{font-size:clamp(2.3rem,4vw,4.5rem)}
.consequence-scene{aspect-ratio:1000/580}

/* ---------------- product reality (paper) — the only devices on the site ---------------- */
.product-noir{background:var(--bf-paper);color:var(--bf-ink);padding-block:clamp(84px,13vh,150px);padding-inline:var(--pad)}
.product-inner{width:100%;max-width:var(--maxw);margin-inline:auto}
.product-head{max-width:min(620px,92%);margin-bottom:clamp(38px,5vw,62px)}
.product-head h2{font-size:clamp(2.2rem,4vw,4.4rem);line-height:1;letter-spacing:-.025em;margin:14px 0 16px}
.product-head p{font-size:clamp(17px,1.3vw,20px);line-height:1.7;color:var(--bf-lead);margin:0;max-width:46ch}
.product-stage{display:grid;grid-template-columns:1.55fr 1fr;gap:clamp(30px,4vw,64px);align-items:center;max-width:1180px}
.stage-tv{position:relative}
.stage-tv figcaption,.stage-phones figcaption{margin-block-start:16px;display:flex;gap:9px;align-items:baseline;color:var(--bf-lead);font-size:14px}
.stage-tv figcaption b,.stage-phones figcaption b{color:var(--bf-ink);font-weight:800}
.stage-phones{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2vw,28px);align-items:center}
.stage-phones .phone-unit{width:100%}
.product-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:clamp(40px,6vw,68px) 0 0;padding:0;list-style:none;background:rgba(13,13,14,.14);counter-reset:none}
.product-steps li{list-style:none;display:flex;align-items:center;justify-content:center;gap:14px;padding:26px 12px;background:var(--bf-paper);border-block-start:2px solid var(--bf-red)}
.product-steps span{font-size:clamp(17px,1.6vw,20px);font-weight:700;color:var(--bf-ink)}

/* ---------------- final CTA (black) ---------------- */
.final-noir{position:relative;min-height:clamp(560px,80svh,820px);display:grid;place-items:center;overflow:hidden;padding:clamp(90px,12vh,150px) var(--pad);text-align:center;background:radial-gradient(80% 70% at 50% 46%,#140a0c,var(--bf-black) 60%)}
.final-art{position:absolute;z-index:0;inset:0;display:grid;place-items:center;opacity:.9}
.final-art .final-scene{width:min(760px,92%)}
.final-inner{position:relative;z-index:2;display:grid;justify-items:center;gap:22px}
.final-noir h2{font-size:clamp(2.6rem,6vw,6rem);line-height:.98;letter-spacing:-.035em;margin:0;text-wrap:balance}
.final-noir p{color:var(--bf-muted);font-size:18px;margin:0}

/* ---------------- footer ---------------- */
.foot-noir{background:var(--bf-black);border-block-start:1px solid var(--line);padding:clamp(46px,7vw,72px) var(--pad) 26px}
.foot-inner{max-width:var(--maxw);margin-inline:auto;display:flex;flex-wrap:wrap;gap:24px 60px;align-items:flex-start;justify-content:space-between}
.foot-brand{display:grid;gap:8px;max-width:34ch}
.foot-brand p{color:var(--bf-gray);font-size:13px;line-height:1.6;margin:0}
.foot-links{display:flex;gap:44px;flex-wrap:wrap}
.foot-links div{display:grid;gap:11px}
.foot-links b{color:var(--bf-muted);font-size:12px;letter-spacing:.06em}
.foot-links a{color:var(--bf-gray);font-size:14px}
.foot-links a:hover{color:var(--bf-white)}
.foot-cap{max-width:var(--maxw);margin:36px auto 0;padding-block-start:20px;border-block-start:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;color:#5a5a5e;font-size:12px}

/* ---------------- entry pages: create / join ---------------- */
.door{min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.82fr);background:var(--bf-black)}
.door-form{display:flex;flex-direction:column;justify-content:center;gap:6px;padding:clamp(110px,14vh,150px) var(--pad) 60px}
.door-form .eyebrow{margin-bottom:8px}
.door-form h1{font-size:clamp(2.4rem,4.6vw,4.4rem);line-height:1;letter-spacing:-.03em;margin:0 0 14px}
.door-form>p{color:var(--bf-muted);font-size:17px;line-height:1.7;max-width:40ch;margin:0 0 26px}
.field{display:grid;gap:8px;margin-bottom:16px}
.field span{font-size:13px;font-weight:700;color:var(--bf-muted)}
.input{width:100%;min-height:54px;padding:13px 15px;border:1px solid var(--line-2);border-radius:5px;background:var(--bf-ink);color:var(--bf-white);outline:none;transition:border-color var(--t-micro),box-shadow var(--t-micro)}
.input:focus{border-color:var(--bf-red);box-shadow:0 0 0 3px rgba(179,32,45,.22)}
.input.err{border-color:var(--bf-red-soft)}
.input.mono{direction:ltr;text-align:center;font-family:ui-monospace,monospace;letter-spacing:.16em;font-weight:800}
.door-specs{display:flex;gap:26px;margin:6px 0 24px}
.door-specs span{display:grid;gap:3px;font-size:12px;color:var(--bf-gray)}
.door-specs b{font-size:15px;color:var(--bf-white);font-weight:800}
.j-err{min-height:20px;color:var(--bf-red-soft);font-size:13px;font-weight:700}
.door-form .text-link{margin-block-start:20px}
.door-aside{position:relative;overflow:hidden;display:grid;place-items:center;padding:60px;background:var(--bf-graphite)}
.door-aside .scene{width:min(88%,420px)}
.door-caption{position:absolute;inset-block-end:8%;inset-inline:8%;display:grid;gap:5px}
.door-caption span{color:var(--bf-red-soft);font-size:12px;font-weight:800}
.door-caption b{font-size:clamp(18px,2.4vw,30px);color:var(--bf-white);max-width:20ch}
.spinner{width:17px;height:17px;border:2px solid rgba(255,255,255,.35);border-block-start-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* create scene uses the product TV; join scene uses a private phone */
.door-aside .tv-stage{width:100%}
.door-aside .phone-unit{width:min(62%,230px)}

/* ---------------- how to play ---------------- */
.how-noir{background:var(--bf-black)}
.how-hero{min-height:64svh;display:grid;align-content:center;gap:12px;padding:clamp(118px,16vh,180px) var(--pad) clamp(50px,7vh,80px);max-width:var(--maxw);margin-inline:auto}
.how-hero h1{font-size:clamp(2.6rem,5.4vw,5rem);line-height:1;letter-spacing:-.03em;margin:0;max-width:16ch}
.how-hero p{color:var(--bf-muted);font-size:18px;line-height:1.7;max-width:48ch;margin:6px 0 0}
.how-steps{max-width:var(--maxw);margin-inline:auto;padding:0 var(--pad) clamp(70px,10vh,120px);display:grid;gap:1px;background:var(--line)}
.how-step{display:grid;grid-template-columns:1fr auto;gap:clamp(16px,3vw,44px);align-items:center;padding:clamp(26px,4vw,44px) 4px;background:var(--bf-black)}
.how-step h3{position:relative;padding-inline-start:22px}
.how-step h3::before{content:"";position:absolute;inset-inline-start:0;top:.32em;width:9px;height:9px;background:var(--bf-red);transform:rotate(45deg)}
.how-step h3{font-size:clamp(20px,2.4vw,28px);margin:0 0 6px}
.how-step p{color:var(--bf-muted);font-size:16px;line-height:1.6;margin:0;max-width:48ch}
.how-step .step-art{width:120px;height:78px}
.how-cta{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad) clamp(80px,12vh,130px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:22px}
.how-cta h2{font-size:clamp(2rem,4vw,3.4rem);margin:0;letter-spacing:-.02em}
/* how-to-play: what you need */
.how-needs{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad) clamp(50px,7vh,86px);display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,5vw,64px);align-items:center}
.how-needs-copy h2{font-size:clamp(1.9rem,3.4vw,3.2rem);line-height:1;letter-spacing:-.025em;margin:12px 0 12px}
.how-needs-copy p{color:var(--bf-muted);font-size:17px;line-height:1.7;max-width:38ch;margin:0}
.how-need-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
.how-need-list li{list-style:none;display:grid;gap:6px;padding:26px 20px;background:var(--bf-black)}
.how-need-list b{font:900 clamp(26px,3vw,40px)/1 'Arial',sans-serif;color:var(--bf-red)}
.how-need-list span{font-weight:800;font-size:16px;color:var(--bf-white)}
.how-need-list small{color:var(--bf-gray);font-size:13px;line-height:1.5}
/* how-to-play: endgame band */
.how-endgame{position:relative;padding:clamp(70px,10vh,120px) var(--pad);background:radial-gradient(80% 80% at 24% 40%,#160a0c,var(--bf-black) 62%);border-block:1px solid var(--line)}
.how-endgame-inner{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,66px);align-items:center}
.he-copy h2{font-size:clamp(2rem,3.8vw,3.6rem);line-height:1;letter-spacing:-.025em;margin:12px 0 14px;text-wrap:balance}
.he-copy p{color:var(--bf-muted);font-size:clamp(16px,1.3vw,19px);line-height:1.8;max-width:52ch;margin:0}
.he-facts{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.he-facts li{list-style:none;display:flex;align-items:baseline;gap:16px;padding:18px 22px;border:1px solid var(--line);border-radius:var(--r-3);background:rgba(255,255,255,.02)}
.he-facts b{font:900 24px/1 'Arial',sans-serif;color:var(--bf-red-soft);min-width:2.4em}
.he-facts span{color:var(--bf-white);font-weight:700}
/* how-to-play: tips */
.how-tips{max-width:var(--maxw);margin:0 auto;padding:clamp(60px,9vh,110px) var(--pad) 0}
.how-tips-grid{margin-block-start:24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.how-tips-grid article{padding:26px 22px;border:1px solid var(--line);border-radius:var(--r-3);background:var(--bf-ink)}
.how-tips-grid b{display:block;font-size:18px;color:var(--bf-white);margin-bottom:8px;letter-spacing:-.01em}
.how-tips-grid p{color:var(--bf-muted);font-size:15px;line-height:1.65;margin:0}
/* how-to-play: faq */
.how-faq{max-width:var(--maxw);margin:0 auto;padding:clamp(56px,8vh,100px) var(--pad) 0}
.how-faq .faq-list{margin:0}
.how-faq .faq-list>h2{font-size:clamp(1.8rem,3vw,2.6rem);margin:0 0 8px;letter-spacing:-.02em}
@media(max-width:900px){
  .how-needs{grid-template-columns:1fr;gap:26px}
  .how-endgame-inner{grid-template-columns:1fr;gap:28px}
  .how-tips-grid{grid-template-columns:1fr}
}
@media(max-width:560px){
  .how-need-list{grid-template-columns:1fr}
}

/* ---------------- devices (restyled neutral; used only in product + create) ---------------- */
.tv-stage{position:relative;width:100%;padding-bottom:6.5%}
.tv-frame{position:relative;padding:.8%;border-radius:12px;background:linear-gradient(160deg,#3a3a3e,#161618 44%,#0c0c0d);box-shadow:0 40px 100px rgba(0,0,0,.5)}
.tv-frame::before{content:'';position:absolute;inset:0;border-radius:12px;padding:1px;background:linear-gradient(160deg,rgba(255,255,255,.22),transparent 34%,transparent 66%,rgba(0,0,0,.5));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.tv-bezel{position:relative;overflow:hidden;aspect-ratio:16/9;border-radius:5px;background:#050505;box-shadow:0 0 0 1px #000,0 0 0 3px #1c1c1f}
.tv-glare{position:absolute;inset:0;z-index:6;pointer-events:none;background:linear-gradient(132deg,rgba(255,255,255,.05) 0 7%,transparent 22%)}
.tv-led{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--bf-red);inset-block-end:-1%;inset-inline-start:50%;transform:translateX(-50%);box-shadow:0 0 9px var(--bf-red)}
.tv-neck{position:absolute;width:6%;height:4.2%;inset-block-end:1.1%;inset-inline-start:47%;background:linear-gradient(#242427,#0d0d0e);border-radius:0 0 3px 3px}
.tv-foot{position:absolute;width:24%;height:1.4%;inset-block-end:0;inset-inline-start:38%;border-radius:0 0 46% 46%/0 0 100% 100%;background:#1d1d20;box-shadow:0 14px 28px rgba(0,0,0,.6)}
.game-screen{height:100%;padding:4.4% 4.8%;display:flex;flex-direction:column;color:var(--bf-white);background:radial-gradient(120% 92% at 84% 6%,rgba(179,32,45,.16),transparent 46%),linear-gradient(155deg,#111112,#070707 76%);container-type:inline-size;font-size:clamp(6px,3.05cqw,16px);line-height:1.3}
.gs-hud{display:flex;align-items:center;gap:.7em;color:var(--bf-gray)}
.gs-brand{font:900 1.1em/1 'Arial Black',sans-serif;letter-spacing:.05em;color:var(--bf-white)}
.gs-phase{font-weight:900;color:var(--bf-red-soft)}
.gs-round{margin-inline-start:auto;color:var(--bf-muted);font-weight:800;letter-spacing:.04em}
.gs-chip{margin-inline-start:auto;padding:.32em .68em;border:1px solid rgba(210,72,80,.4);border-radius:.4em;color:var(--bf-red-soft);font-weight:800}
.gs-chip.live::before{content:'';display:inline-block;width:.48em;height:.48em;border-radius:50%;background:var(--bf-red-soft);margin-inline-end:.42em;box-shadow:0 0 6px var(--bf-red-soft)}
.gs-ring{width:2.1em;height:2.1em;flex:0 0 auto;border-radius:50%;background:conic-gradient(var(--bf-red) calc(var(--p)*360deg),rgba(250,250,247,.14) 0);-webkit-mask:radial-gradient(farthest-side,transparent 60%,#000 62%);mask:radial-gradient(farthest-side,transparent 60%,#000 62%)}
.p-av{width:2.4em;height:2.4em;border-radius:.58em;display:grid;place-items:center;background:var(--av,var(--bf-red));color:var(--bf-white);font-weight:900;font-style:normal;flex:0 0 auto;font-size:.92em}
.p-av.ghost{background:transparent;border:1px dashed var(--line-2);color:var(--bf-gray)}
.tv-lobby-screen{padding:4% 5.4%}.lobby-body{flex:1;display:grid;grid-template-columns:auto 1fr;gap:6%;align-items:center}
.lobby-qr{width:min(34%,140px);aspect-ratio:1;padding:3.5%;background:var(--bf-paper);border-radius:6px}
.lobby-qr svg{display:block;width:100%;height:100%}
.lobby-join{display:flex;flex-direction:column;gap:.5em}.lobby-join small{color:var(--bf-gray)}
.lobby-join strong{font:900 3.4em/1 ui-monospace,monospace;letter-spacing:.14em;color:var(--bf-white)}
.lobby-count{color:var(--bf-red-soft);font-weight:800}
.lobby-roster{display:flex;gap:.7em;margin-block-start:auto;padding-block-start:4%}
.round-prompt{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.1em;margin:.5em 0 .7em}
.round-prompt small{color:var(--bf-red-soft);font-weight:900;font-size:1.05em}
.round-count{font:900 2.4em/1 ui-monospace,monospace;color:var(--bf-white)}
.round-floor{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:3.5%;padding-block-end:.2em}
.round-floor .p-av{width:1.9em;height:1.9em;border-radius:.42em}
.rf-col{flex:1;max-width:15%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.55em}
.rf-intent{width:1.5em;height:1.5em;color:var(--bf-gray)}.rf-intent.up{color:var(--bf-muted)}.rf-intent.dn{color:var(--bf-red-soft)}.rf-intent svg{width:100%;height:100%}
.rf-bar{width:48%;height:var(--h);max-height:62%;min-height:8%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--bf-red-soft),var(--bf-red-dark))}
.rf-col.wait .rf-bar{background:linear-gradient(180deg,#45454a,#232326)}
.tv-reveal-screen{padding:4% 5%}.reveal-list{flex:1;display:flex;flex-direction:column;justify-content:center;gap:.7em}
.rv{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.9em;padding:.85em 1em;border:1px solid var(--line);border-radius:.7em;background:rgba(255,255,255,.02)}
.rv.dassa{border-color:rgba(210,72,80,.5);background:rgba(179,32,45,.08)}
.rv-copy{display:grid;gap:.12em;min-width:0}.rv-copy small{color:var(--bf-gray)}.rv-copy b{color:var(--bf-white);font-size:1.12em}
.rv-tag{padding:.34em .72em;border-radius:.5em;font-weight:900;font-size:.86em}.rv-tag.dassa{background:var(--bf-red);color:#fff}.rv-tag.kept{border:1px solid var(--line-2);color:var(--bf-muted)}
.reveal-foot{display:flex;align-items:center;justify-content:space-between;color:var(--bf-gray);padding-block-start:.6em;margin-block-start:.4em;border-block-start:1px solid var(--line)}
.reveal-foot strong{color:var(--bf-red-soft)}
.tv-conseq-screen{padding:4.4% 5.2%}.conseq-body{display:flex;flex-direction:column;justify-content:center;gap:.15em}
.conseq-eyebrow{color:var(--bf-red-soft);font-weight:900}.tv-conseq-screen h3{margin:.2em 0 0;font-size:2.3em;line-height:1.08}
.conseq-bars{display:flex;align-items:stretch;justify-content:space-between;gap:3%;height:44%;margin-block-start:auto}
.conseq-bars .p-av{width:1.9em;height:1.9em;border-radius:.42em}
.cb{flex:1;display:grid;grid-template-rows:1fr auto auto;justify-items:center;align-items:end;gap:.35em}
.cb::before{content:'';grid-row:1;align-self:end;width:54%;height:var(--h);min-height:8%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--bf-red-soft),var(--bf-red-dark))}
.cb.down::before{background:linear-gradient(180deg,#4a3033,#232326)}.cb.flat::before{background:linear-gradient(180deg,#55474a,#232326)}
.cb i{font-style:normal;font-weight:900;color:var(--bf-muted);font-size:.86em}.cb.up i{color:var(--bf-white)}.cb.down i{color:var(--bf-red-soft)}
.phone-unit{position:relative;width:210px;flex:0 0 auto}
.device-label{position:absolute;z-index:7;inset-block-start:-11px;inset-inline-start:50%;transform:translateX(-50%);white-space:nowrap;padding:5px 9px;border-radius:3px;background:var(--bf-ink);color:var(--bf-white);font-size:10px;font-weight:800;box-shadow:0 8px 22px rgba(0,0,0,.5)}
.on-paper .device-label{background:var(--bf-ink);color:var(--bf-paper)}
.phone-shell{position:relative;aspect-ratio:9/19;padding:2.9%;border-radius:14%;background:linear-gradient(152deg,#2c2c30,#0d0d0e 60%);box-shadow:0 30px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05) inset,0 1.4px 0 rgba(255,255,255,.12) inset}
.phone-island{position:absolute;z-index:4;inset-block-start:5.5%;inset-inline-start:50%;transform:translateX(-50%);width:30%;height:3.4%;border-radius:99px;background:#040404}
.phone-btn{position:absolute;width:2px;border-radius:2px;background:#3d3d42}.phone-btn.vol{height:9%;inset-block-start:23%;inset-inline-start:-2px}.phone-btn.pow{height:6%;inset-block-start:25%;inset-inline-end:-2px}
.phone-screen{position:relative;height:100%;overflow:hidden;border-radius:11%;background:radial-gradient(120% 58% at 88% 3%,rgba(179,32,45,.18),transparent 44%),#0a0a0b;display:flex;flex-direction:column;container-type:inline-size;font-size:5.2cqw;line-height:1.4}
.app-top{display:flex;align-items:center;justify-content:space-between;padding:11cqw 8cqw 4cqw;color:var(--bf-gray)}
.app-brand{display:flex;align-items:center;gap:1.4cqw}.app-mark{width:2.6cqw;height:2.6cqw;border:.7cqw solid var(--bf-red)}
.app-brand b{font:900 3.1cqw/1 'Arial Black',sans-serif;color:var(--bf-white);letter-spacing:.02em}
.app-chip{font-size:2.7cqw;font-weight:800;color:var(--bf-red-soft);padding:.7cqw 2.4cqw;border:1px solid rgba(210,72,80,.35);border-radius:99px}.app-chip.ghost{color:var(--bf-gray);border-color:var(--line)}
.app-body{flex:1;display:flex;padding:2cqw 8cqw 9cqw}
.home-ind{position:absolute;z-index:5;inset-block-end:3%;inset-inline-start:50%;transform:translateX(-50%);width:26%;height:1.4%;border-radius:99px;background:rgba(250,250,247,.5)}
.scr{flex:1;display:flex;flex-direction:column;font-size:3.5cqw}
.scr-eyebrow{font-size:.85em;font-weight:900;color:var(--bf-red-soft);letter-spacing:.02em}.scr-eyebrow.warn{color:var(--bf-red-soft)}
.scr-lead{margin:.5em 0;font-size:1.55em;font-weight:800;line-height:1.22;color:var(--bf-white)}.scr-note{font-size:.82em;color:var(--bf-gray)}
.scr-secret{justify-content:center;gap:.2em}.scr-secret .scr-lead{margin:.5em 0}
.scr-seal{margin-block-start:1em;display:flex;align-items:center;gap:.5em;padding-block-start:.9em;border-block-start:1px solid var(--line);color:var(--bf-muted);font-size:.82em}
.seal-mark{width:.7em;height:.7em;background:var(--bf-red);transform:rotate(45deg);flex:0 0 auto}
.scr-pick .scr-eyebrow{margin-block-end:.8em}
.pick-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:.5em}
.pa{display:flex;flex-direction:column;align-items:center;gap:.34em;padding:.7em .2em;border:1.5px solid var(--line);border-radius:.6em;color:var(--bf-gray);font-size:.82em;font-weight:800}
.pa svg{width:1.5em;height:1.5em}.pa b{color:var(--bf-muted)}
.pa.up{--c:var(--bf-muted)}.pa.dn{--c:var(--bf-red-soft)}.pa.gd{--c:var(--bf-red-soft)}
.pa.on{border-color:var(--c);color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}.pa.on b{color:var(--bf-white)}
.pick-label{margin:.9em 0 .5em;font-size:.82em;color:var(--bf-gray);font-weight:800}
.pick-chips{display:flex;flex-direction:column;gap:.45em}
.pchip{display:flex;align-items:center;gap:.5em;padding:.5em .6em;border:1.5px solid var(--line);border-radius:.55em;font-weight:800;color:var(--bf-muted)}
.pchip.on{border-color:var(--bf-red);background:rgba(179,32,45,.12);color:var(--bf-white)}
.p-av.sm{width:2em;height:2em;border-radius:.45em;font-size:.9em}
.scr-confirm{margin-block-start:auto;margin-block-end:1em;padding:.85em;text-align:center;border-radius:.6em;background:var(--bf-red);color:#fff;font-weight:900}
.scr-wait{align-items:center;justify-content:center;text-align:center;gap:1em}
.wait-seal{width:3.4em;height:3.4em;border-radius:1em;display:grid;place-items:center;color:var(--bf-red-soft);border:1px solid rgba(210,72,80,.4);background:rgba(179,32,45,.08)}
.wait-seal svg{width:1.7em;height:1.7em}.scr-wait .scr-lead{margin:0}
.wait-dots{display:flex;gap:.5em}.wait-dots i{width:.62em;height:.62em;border-radius:50%;border:1px solid var(--bf-gray)}.wait-dots i.on{background:var(--bf-red-soft);border-color:var(--bf-red-soft)}
.scr-result{align-items:center;justify-content:center;text-align:center;gap:.4em}
.result-arrow{font-size:3.4em;line-height:1;color:var(--bf-red-soft);transform:rotate(-8deg)}
.result-delta{font:900 3.2em/1 ui-monospace,monospace;color:var(--bf-red-soft)}.scr-result .scr-lead{margin:.1em 0;font-size:1.42em}
.scr-join{gap:.7em}.scr-title{font-size:1.85em;font-weight:900;color:var(--bf-white)}
.join-field{padding:.85em .8em;border:1px solid var(--line-2);border-radius:.55em;color:var(--bf-white)}
.join-field.mono{font-family:ui-monospace,monospace;letter-spacing:.14em;font-weight:900;text-align:center}.join-field.ghost{color:var(--bf-gray)}
.scr-join .scr-confirm{margin-block-start:.2em;margin-block-end:0}

/* ---------------- error / misc ---------------- */
.network-notice{position:fixed;z-index:200;inset-block-end:16px;inset-inline-start:50%;transform:translateX(-50%);padding:11px 16px;background:var(--bf-white);color:var(--bf-black);box-shadow:var(--shadow);font-weight:800;font-size:12px;border-radius:4px}
.cinema-page{min-height:100svh;display:grid;place-items:center;padding:130px var(--pad)}
.door-card{width:min(560px,100%);padding:44px;background:var(--bf-charcoal);border:1px solid var(--line);border-radius:8px;text-align:center}
.door-card h1{font-size:44px;margin:.2em 0}
.panel{background:var(--surface);border-color:var(--line-2)!important}.muted{color:var(--bf-gray)!important}

/* ---------------- responsive ---------------- */
@media(max-width:1080px){
  .head-nav{display:none}.head-menu{display:grid}
  .poster-inner,.poster-incomplete .poster-inner,.poster-private .poster-inner,.poster-consequence .poster-inner{grid-template-columns:1fr;gap:34px}
  .social-inner{grid-template-columns:1fr;gap:28px}.social-copy{max-width:100%}.social-lines{height:clamp(240px,40vh,340px)}
  .poster-incomplete .poster-art,.poster-private .poster-art,.poster-consequence .poster-art{order:0}
  .poster .poster-art{max-width:560px}
  .product-stage{grid-template-columns:1fr;gap:34px}
  .door{grid-template-columns:1fr}
  .door-aside{min-height:auto;padding:60px var(--pad)}
}
@media(max-width:760px){
  .site-head{height:60px}.site-head.scrolled{height:56px}.mobile-panel{inset-block-start:58px}
  .hero-noir{display:flex;flex-direction:column;min-height:auto}
  .hero-inner{padding-block-start:clamp(104px,15vh,150px);padding-block-end:8px}
  .hero-art{position:relative;left:auto;bottom:auto;width:100%;margin-block-start:22px}
  .hero-copy{max-width:100%}
  .scroll-cue{display:none}
  .poster{min-height:auto;padding-block:clamp(70px,11vh,110px)}
  .poster .poster-art{max-width:440px;margin-inline:auto}
  .product-steps{grid-template-columns:1fr}
  .stage-phones{max-width:420px}
  .how-step{grid-template-columns:1fr;gap:16px}
  .how-step .step-art{display:none}
  .foot-links{gap:30px}
  .door{display:flex;flex-direction:column}
  .door-form{order:1;padding:96px var(--pad) 40px}
  .door-aside{order:2}
}
@media(max-width:430px){
  .hero-noir h1{font-size:clamp(2.6rem,12vw,3.4rem)}
  .hero-cta{display:grid;grid-template-columns:1fr}
  .foot-inner{flex-direction:column}
  .foot-cap{flex-direction:column;gap:6px}
}

/* ---------------- reduced motion & a11y ---------------- */
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  [data-reveal]{transition:none;opacity:1;transform:none}
  .rl-draw{transition:none;stroke-dashoffset:0}
  .rl-head,.cs-head,.cs-return,.fs-head,.rl-src,.cs-src,.cs-impact,.pv-secret{transition:none;opacity:1}
  .spinner{animation:none}
}
.dass-reduced-motion *{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}
.dass-high-contrast{--bf-muted:#d0d0d2;--bf-gray:#b8b8ba;--line:rgba(250,250,247,.3);--line-2:rgba(250,250,247,.5)}
.dass-large-text{font-size:112%}
`;

// apps/dasssite/src/main.ts
injectBase();
document.documentElement.dataset.siteTheme = "backfire";
document.body.classList.add("backfire-site");
addStyle(SITE_CSS);
addStyle(productCss());
addStyle(modesCss());
var app = document.getElementById("app");
var SPA = /* @__PURE__ */ new Set(["/", "/create", "/join", "/how-to-play", ...MODES_PATHS, ...PRODUCT_PATHS]);
var cleanups = [];
var wordmark = '<span class="bf-word" dir="ltr">BACKFIRE</span>';
function go(target) {
  const url = new URL(target, location.origin);
  if (!SPA.has(url.pathname)) {
    location.href = `${url.pathname}${url.search}${url.hash}`;
    return;
  }
  history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  render();
  requestAnimationFrame(() => {
    if (url.hash) document.querySelector(url.hash)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
    else scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    qs("#main")?.focus({ preventScroll: true });
  });
}
addEventListener("click", (event) => {
  const mouse = event;
  if (mouse.button !== 0 || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey) return;
  const link = event.target.closest("[data-link]");
  if (!link?.dataset.link) return;
  event.preventDefault();
  backfireAudio.tick();
  go(link.dataset.link);
});
addEventListener("popstate", render);
function teardown() {
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
  delete document.body.dataset.route;
  document.body.classList.remove("menu-open");
}
function render() {
  teardown();
  applyProductPreferences();
  try {
    switch (location.pathname) {
      case "/":
        updateMeta("لعبة جماعية عن الشك والعواقب", "كل لاعب يرى جزءًا مختلفًا. القرار سري، والنتيجة أمام الجميع.");
        home();
        break;
      case "/create":
        updateMeta("ابدأ لعبة", "افتح غرفة BACKFIRE على الشاشة الكبيرة، ثم أدخل الشلة من جوالاتهم.");
        createRoom();
        break;
      case "/join":
        updateMeta("انضم بكود", "أدخل رمز الغرفة واسمك للانضمام إلى BACKFIRE من جوالك.");
        joinRoom();
        break;
      case "/how-to-play":
        updateMeta("كيف تلعب", "الشاشة تحكي، والجوالات تخبّي. خمس خطوات للبدء.");
        howToPlay();
        break;
      default:
        if (MODES_PATHS.has(location.pathname)) modesRoute(location.pathname);
        else productRoute(location.pathname);
    }
  } catch (error) {
    console.error("[BACKFIRE site] route render failed", error);
    updateMeta("تعذّر فتح الصفحة", "حدث خطأ آمن أثناء عرض الصفحة.");
    app.innerHTML = `${header()}<main id="main" class="cinema-page" tabindex="-1"><section class="door-card"><span class="eyebrow">خطأ آمن</span><h1>المشهد ما اكتمل.</h1><p>لم نرسل أي بيانات. حدّث الصفحة أو ارجع للرئيسية.</p><button id="retry" class="btn primary wide">إعادة المحاولة</button><a data-link="/" class="text-link">العودة للرئيسية</a></section></main>`;
    qs("#retry")?.addEventListener("click", render);
  }
  bindChrome();
  bindNetworkNotice();
}
function applyProductPreferences() {
  try {
    const settings = platform.getSettings();
    document.documentElement.classList.toggle("dass-high-contrast", settings.highContrast);
    document.documentElement.classList.toggle("dass-large-text", settings.textScale === "large");
    document.documentElement.classList.toggle("dass-reduced-motion", settings.reducedMotion || !settings.animations);
  } catch {
    document.documentElement.classList.remove("dass-high-contrast", "dass-large-text", "dass-reduced-motion");
  }
}
function accountEntry() {
  try {
    const session = platform.getSession();
    if (session) return { href: "/account/profile", label: "حسابي", on: true };
  } catch {
  }
  return { href: "/login", label: "دخول", on: false };
}
function header(active = "") {
  const acc = accountEntry();
  const accClass = active === "account" ? "head-account on" : "head-account";
  return `<a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
    <header class="site-head" id="site-head">
      <a class="nav-logo" data-link="/" aria-label="BACKFIRE — الرئيسية">${wordmark}</a>
      <nav class="head-nav" aria-label="التنقل الرئيسي"><a data-link="/modes" class="${active === "modes" || active === "store" ? "on" : ""}">الأطوار</a><a data-link="/how-to-play" class="${active === "how" ? "on" : ""}">كيف تلعب</a><a data-link="/join">انضم بكود</a></nav>
      <div class="head-actions"><a data-link="${acc.href}" class="${accClass}">${acc.label}</a><a data-link="/create" class="head-cta">ابدأ لعبة</a><button id="menu" class="head-menu" type="button" aria-label="القائمة" aria-expanded="false" aria-controls="mpanel"><span></span><span></span></button></div>
      <div id="mpanel" class="mobile-panel" hidden><a data-link="/modes">الأطوار</a><a data-link="/how-to-play">كيف تلعب</a><a data-link="/join">انضم بكود</a><a data-link="${acc.href}" class="mpanel-account">${acc.label}</a><a data-link="/create" class="mpanel-cta">ابدأ لعبة</a></div>
    </header>`;
}
function footer() {
  return `<footer class="foot-noir" data-reveal>
    <div class="foot-inner">
      <div class="foot-brand">${wordmark}<p>كل حركة لها عواقب. لعبة جماعية على شاشة واحدة وجوالات اللاعبين.</p></div>
      <div class="foot-links">
        <div><b>اللعب</b><a data-link="/create">ابدأ لعبة</a><a data-link="/join">انضم بكود</a><a data-link="/how-to-play">كيف تلعب</a></div>
        <div><b>العوالم</b><a data-link="/modes">الأطوار</a><a data-link="/pricing">الأسعار</a></div>
        <div><b>الموقع</b><a data-link="/about">عن اللعبة</a><a data-link="/faq">الأسئلة</a><a data-link="/support">الدعم</a></div>
        <div><b>قانوني</b><a data-link="/legal/privacy">الخصوصية</a><a data-link="/legal/terms">الشروط</a><a data-link="/legal/refunds">الاسترجاع</a></div>
      </div>
    </div>
    <div class="foot-cap"><span>BACKFIRE — كل حركة لها عواقب.</span><span>٢٠٢٦</span></div>
  </footer>`;
}
function home() {
  document.body.dataset.route = "home";
  app.innerHTML = `${header()}<main id="main" tabindex="-1">
    <section class="hero-noir">
      <div class="hero-inner"><div class="hero-copy" data-reveal>
        <span class="eyebrow">لعبة جماعية على شاشة وجوالات</span>
        <h1>كل حركة<br>لها <em>عواقب.</em></h1>
        <p class="hero-lead">كل لاعب يشوف معلومة غير. القرار في جوالك، والعاقبة قدّام الكل.</p>
        <ul class="hero-facts" aria-label="مواصفات سريعة"><li>٤–٨ لاعبين</li><li>شاشة وحدة</li><li>جوال لكل لاعب</li><li>ادخل كضيف</li></ul>
        <div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/how-to-play" class="btn ghost lg">شوف كيف تلعب</a></div>
        <div class="hero-note"><i></i><span>نسخة تجريبية — نظام السيناريو الجديد لسه تحت التطوير.</span></div>
      </div></div>
      <div class="hero-art" data-reveal>${HeroScene()}</div>
      <a class="scroll-cue" data-link="/#poster01"><span>انزل</span><i></i></a>
    </section>

    <section id="poster01" class="poster poster-incomplete on-paper" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><h2>ما أحد يشوف<br>الصورة كاملة.</h2><p>المعلومة مفرّقة بينكم، والثقة قرار.</p></div>
        <div class="poster-art">${IncompleteScene()}</div>
      </div>
    </section>

    <section class="poster poster-private on-dark" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><h2>اللي تعرفه<br>يغيّر كل شي.</h2><p>كل واحد يعرف شي، وما أحد يعرف كل شي. على جوالك جزء ما يشوفه غيرك.</p></div>
        <div class="poster-art">${PrivateScene()}</div>
      </div>
    </section>

    <section class="social-noir on-dark" data-reveal>
      <div class="social-inner">
        <div class="social-copy">
          <span class="eyebrow">اللعبة الحقيقية بينكم</span>
          <h2 class="social-head">المشكلة مو في المعلومة.<br>المشكلة: <em>مين تصدّق؟</em></h2>
          <p class="social-note">الكذب، ونص الحقيقة، والثقة المؤقتة، والاتهام المتأخر — هذي اللعبة الحقيقية بينكم، مو داخل جوالك.</p>
        </div>
        <div class="social-lines" aria-hidden="true">
          <span class="sl sl-1">«مين عطّل المسار؟»</span>
          <span class="sl sl-2">«أنت كنت تعرف من البداية.»</span>
          <span class="sl sl-3">«قلت لكم لا ترسلونها له.»</span>
          <span class="sl sl-4">«خطتك قلبت عليك.»</span>
        </div>
      </div>
    </section>

    <section class="poster poster-consequence on-dark" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><h2>القرار يطلع منك.<br>والعاقبة <em>ترجع لك.</em></h2><p>كل جولة تتذكّر اللي سويتوه قبلها.</p></div>
        <div class="poster-art">${ConsequenceScene()}</div>
      </div>
    </section>

    <section class="product-noir on-paper" data-reveal>
      <div class="product-inner">
        <div class="product-head"><span class="eyebrow">المنتج</span><h2>شاشة وحدة.<br>أسرار مختلفة.</h2><p>الشاشة تعرض اللي يشوفه الكل. وجوالك يحتفظ باللي يخصّك إنت.</p></div>
        <div class="product-stage">
          <figure class="stage-tv">${TvStage("reveal")}<figcaption><b>التلفزيون</b><span>المشهد اللي يشوفه الكل.</span></figcaption></figure>
          <div class="stage-phones"><figure>${PhoneMockup("secret", "معلومة خاصة")}</figure><figure>${PhoneMockup("decision", "قرار سرّي")}</figure></div>
        </div>
        <ol class="product-steps"><li><span>افتح غرفة</span></li><li><span>امسح الرمز</span></li><li><span>اختر بسرية</span></li></ol>
      </div>
    </section>

    ${modesHomeSection()}

    <section class="final-noir" data-reveal>
      <div class="final-art">${FinalScene()}</div>
      <div class="final-inner"><span class="eyebrow">BACKFIRE</span><h2>ابدأ قبل لا<br>تكتمل الصورة.</h2><p>حطّ الشاشة قدّام الكل، وادخلوا من جوالاتكم.</p><div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div></div>
    </section>
  </main>${footer()}`;
  bindPageMotion();
}
function createRoom() {
  document.body.dataset.route = "create";
  app.innerHTML = `${header()}<main id="main" class="door" tabindex="-1">
    <section class="door-form" data-reveal>
      <span class="eyebrow">غرفة جديدة</span>
      <h1>افتح الشاشة.<br>واجمع الشلة.</h1>
      <p>بننقلك إلى شاشة التلفزيون. هناك يطلع رمز الغرفة عشان يدخلون اللاعبون من جوالاتهم.</p>
      <div class="door-specs"><span><b>٤–٨</b>لاعبين</span><span><b>رمز</b>أو كود</span><span><b>بلا</b>تحميل</span></div>
      <button id="startbtn" class="btn primary lg wide">افتح الغرفة على التلفاز</button>
      <a data-link="/" class="text-link">العودة للرئيسية</a>
    </section>
    <aside class="door-aside">${TvStage("lobby")}<div class="door-caption"><span>شاشة واحدة</span><b>رمز الدخول وحالة اللاعبين.</b></div></aside>
  </main>${footer()}`;
  revealPage();
  qs("#startbtn")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    press(button);
    backfireAudio.cta();
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span><span>جاري فتح الشاشة…</span>';
    window.setTimeout(() => {
      location.href = "/tv";
    }, 260);
  });
}
function joinRoom() {
  document.body.dataset.route = "join";
  const code = new URLSearchParams(location.search).get("code") ?? "";
  app.innerHTML = `${header()}<main id="main" class="door join-door" tabindex="-1">
    <section class="door-form" data-reveal>
      <span class="eyebrow">انضمام من الجوال</span>
      <h1>ادخل الغرفة.<br>ولا تكشف شيئًا.</h1>
      <p>اكتب الرمز اللي على التلفزيون، وبعده الاسم اللي بيشوفه باقي اللاعبين.</p>
      <label class="field"><span>رمز الغرفة</span><input id="code" class="input mono" placeholder="AB12CD" value="${escapeHtml(code)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" inputmode="text"></label>
      <label class="field"><span>اسم اللاعب</span><input id="name" class="input" placeholder="اسمك" maxlength="20" autocomplete="off"></label>
      <button id="joinbtn" class="btn primary lg wide">انضم إلى الغرفة</button>
      <div id="jerr" class="j-err" role="alert" aria-live="polite"></div>
      <a data-link="/" class="text-link">العودة للرئيسية</a>
    </section>
    <aside class="door-aside">${PhoneMockup("secret")}<div class="door-caption"><span>لك وحدك</span><b>ما تعرفه لا يظهر على الشاشة العامة.</b></div></aside>
  </main>${footer()}`;
  revealPage();
  const codeElement = qs("#code");
  const nameElement = qs("#name");
  (code ? nameElement : codeElement).focus();
  const submit = () => {
    const roomCode = codeElement.value.trim();
    const name = nameElement.value.trim();
    if (!roomCode) return fieldError(codeElement, "اكتب رمز الغرفة");
    if (!name) return fieldError(nameElement, "اكتب اسمك");
    backfireAudio.cta();
    location.href = `/play?code=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(name)}`;
  };
  qs("#joinbtn")?.addEventListener("click", submit);
  nameElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  codeElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") nameElement.focus();
  });
}
function howToPlay() {
  document.body.dataset.route = "how";
  app.innerHTML = `${header("how")}<main id="main" class="how-noir" tabindex="-1">
    <header class="how-hero" data-reveal>
      <span class="eyebrow">كيف تلعب</span>
      <h1>الشاشة تحكي.<br>الجوالات تخبّي.</h1>
      <p>شاشة وحدة قدّام الكل، وجوال بيد كل لاعب. الشاشة تحكي المشهد العام، والجوال يحفظ اللي يخصّك إنت. هذي رحلة جولة كاملة، من فتح الغرفة إلى العاقبة.</p>
    </header>

    <section class="how-needs" data-reveal>
      <div class="how-needs-copy"><span class="eyebrow">وش تحتاجون</span><h2>تجهيز بسيط،<br>بلا تحميل.</h2><p>شاشة كبيرة يشوفها الكل، وجوال لكل لاعب على نفس الشبكة. بلا حسابات وبلا تطبيقات.</p></div>
      <ul class="how-need-list">
        <li><b>١</b><span>شاشة أو تلفاز</span><small>تعرض المشهد العام ورمز الدخول.</small></li>
        <li><b>٤–٨</b><span>جوالات اللاعبين</span><small>كل جوال يحمل معلومة وقرار سرّي.</small></li>
        <li><b>١٥–٢٥</b><span>دقيقة للمباراة</span><small>جولات متتابعة، كل جولة تتذكّر اللي قبلها.</small></li>
      </ul>
    </section>

    <div class="how-steps">
      <article class="how-step" data-reveal><div><h3>افتح الغرفة على الشاشة</h3><p>افتح الغرفة من تلفاز أو متصفح كبير يشوفه الكل، ويطلع رمز الغرفة و QR.</p></div>${stepArt("room")}</article>
      <article class="how-step" data-reveal><div><h3>ادخلوا بمسح الرمز</h3><p>كل لاعب يمسح الـ QR أو يكتب الكود من جواله — تدخلون كضيوف على طول، بلا انتظار.</p></div>${stepArt("scan")}</article>
      <article class="how-step" data-reveal><div><h3>استلم معلومتك السرّية</h3><p>توصل لكل جوال بطاقة خاصة ما يشوفها غيره: دور، أو معلومة، أو ورقة ضغط.</p></div>${stepArt("secret")}</article>
      <article class="how-step" data-reveal><div><h3>تناقشوا واتفقوا</h3><p>الكلام على الطاولة: وعود، وتحالفات، ونص حقائق. اللعبة الحقيقية بينكم، مو في جوالكم.</p></div>${stepArt("discuss")}</article>
      <article class="how-step" data-reveal><div><h3>قرّر بسرّك</h3><p>تقفل حركتك على جوالك بعيد عن العيون، وتضل مخفية إلى ما تكشفها الشاشة.</p></div>${stepArt("decide")}</article>
      <article class="how-step" data-reveal><div><h3>واجه العاقبة… وتذكّرها</h3><p>النتيجة تطلع قدّام الكل على الشاشة، وقرارك ينحفظ يمكن يرجع لك أو عليك في جولة جاية.</p></div>${stepArt("return")}</article>
    </div>

    <section class="how-endgame on-dark" data-reveal>
      <div class="how-endgame-inner">
        <div class="he-copy"><span class="eyebrow">النهاية</span><h2>كل شي مترابط.<br><em>وكل قرار محسوب.</em></h2><p>في نهاية المباراة، الشاشة تجمع كل اللي سويتوه: مين التزم بوعده، ومين انقلب، ومين نجا لأن قرار قديم رجع في اللحظة الصح. الفايز مو الأذكى في جولة، الفايز اللي قرأ العواقب قبل لا تصير.</p></div>
        <ul class="he-facts">
          <li><b>متتابعة</b><span>جولات تبني على بعضها</span></li>
          <li><b>سري</b><span>القرار حتى الكشف</span></li>
          <li><b>يعود</b><span>أثر كل قرار</span></li>
        </ul>
      </div>
    </section>

    <section class="how-tips" data-reveal>
      <span class="eyebrow">عشان أحسن جلسة</span>
      <div class="how-tips-grid">
        <article><b>خلّوا الشاشة قدّام الكل</b><p>المشهد العام هو مرجعكم المشترك — خلّوه واضح لكل اللاعبين.</p></article>
        <article><b>احموا جوالكم</b><p>اللي على جوالك يخصّك إنت. نظرة وحدة تكفي تكشف سرّ يقلب الجولة.</p></article>
        <article><b>تكلّموا… واكذبوا بذكاء</b><p>النقاش سلاح. الوعد والاتهام والسكوت كلها قرارات لها عواقب.</p></article>
      </div>
    </section>

    <section class="how-faq" data-reveal>
      <div class="faq-list wide">
        <h2>أسئلة سريعة</h2>
        <details open><summary>كم لاعب نحتاج؟</summary><p>من ٤ إلى ٨ لاعبين، كل واحد على جواله. وكل ما زاد العدد، زاد الشك.</p></details>
        <details><summary>لازم نحمّل تطبيق أو نسوي حساب؟</summary><p>ما تحتاج حساب عشان تلعب. تدخلون الغرفة كضيوف على طول من المتصفح على الشاشة والجوال، بلا تحميل. الحساب اختياري — يفيدك بس لحفظ مشترياتك وإعداداتك.</p></details>
        <details><summary>كم تاخذ المباراة؟</summary><p>غالبًا ١٥–٢٥ دقيقة عبر جولات متتابعة. وتقدرون تلعبون أكثر من مباراة ورا بعض.</p></details>
        <details><summary>وش يصير لو فصل جوال واحد؟</summary><p>يقدر يرجع لنفس مقعده بنفس معلوماته السرّية عبر إعادة الاتصال، بدون ما تختلط الأوراق.</p></details>
      </div>
    </section>

    <div class="how-cta" data-reveal><h2>والباقي عليكم.</h2><div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div></div>
  </main>${footer()}`;
  bindPageMotion();
}
function stepArt(kind) {
  const s = (inner) => `<svg class="step-art" viewBox="0 0 120 78" aria-hidden="true">${inner}</svg>`;
  const R = "#b3202d";
  const G = "#707075";
  const L = "#38383d";
  switch (kind) {
    case "room":
      return s(`<rect x="16" y="12" width="88" height="48" rx="4" fill="none" stroke="${G}" stroke-width="2"/><rect x="52" y="62" width="16" height="4" fill="${L}"/><rect x="44" y="66" width="32" height="3" fill="${L}"/>`);
    case "scan":
      return s(`<path d="M22 30 V20 H32 M88 20 H98 V30 M98 48 V58 H88 M32 58 H22 V48" fill="none" stroke="${G}" stroke-width="2"/><line x1="32" y1="39" x2="88" y2="39" stroke="${R}" stroke-width="2"/>`);
    case "secret":
      return s(`<rect x="34" y="12" width="52" height="54" fill="${L}"/><rect x="44" y="32" width="32" height="8" fill="${R}"/><rect x="44" y="46" width="20" height="5" fill="${G}"/>`);
    case "discuss":
      return s(`<rect x="18" y="20" width="42" height="28" rx="5" fill="none" stroke="${G}" stroke-width="2"/><path d="M30 48 l0 8 8 -8z" fill="${G}"/><rect x="62" y="34" width="40" height="26" rx="5" fill="none" stroke="${R}" stroke-width="2"/><path d="M90 60 l0 7 -7 -7z" fill="${R}"/><line x1="26" y1="30" x2="50" y2="30" stroke="${G}" stroke-width="2"/><line x1="70" y1="44" x2="94" y2="44" stroke="${R}" stroke-width="2"/>`);
    case "decide":
      return s(`<rect x="36" y="14" width="48" height="50" rx="6" fill="none" stroke="${G}" stroke-width="2"/><rect x="44" y="24" width="14" height="12" rx="2" fill="none" stroke="${G}" stroke-width="1.6"/><rect x="62" y="24" width="14" height="12" rx="2" fill="${R}"/><rect x="44" y="46" width="32" height="8" rx="2" fill="${R}"/>`);
    case "return":
      return s(`<path d="M28 42 C 50 18 80 20 92 38 C 99 48 90 58 78 52" fill="none" stroke="${R}" stroke-width="2.4" stroke-linecap="round"/><path d="M78 52 l11 -2 -3 10z" fill="${R}"/><circle cx="28" cy="42" r="3.4" fill="${R}"/>`);
    default:
      return s("");
  }
}
function fieldError(element, message) {
  element.classList.add("err");
  const error = qs("#jerr");
  if (error) error.textContent = message;
  backfireAudio.error();
  if (!reduced()) element.animate({ transform: ["translateX(-6px)", "translateX(5px)", "translateX(0)"] }, { duration: 180 });
  window.setTimeout(() => element.classList.remove("err"), 700);
}
function bindPageMotion() {
  revealPage();
  qsa(".btn.primary").forEach((button) => button.addEventListener("pointerenter", () => backfireAudio.cta(), { once: true }));
}
function revealPage() {
  const observer = observeReveal();
  cleanups.push(() => observer.disconnect());
}
function modesRoute(path) {
  document.body.dataset.route = "modes";
  const page = renderModesPage(path, location.search);
  updateMeta(page.title, page.description);
  app.innerHTML = `${header(page.active)}${page.html}${footer()}`;
  page.bind?.(go, render);
  bindPageMotion();
}
function productRoute(path) {
  document.body.dataset.route = "product";
  const page = renderProductPage(path, location.search);
  updateMeta(rebrandVisibleText(page.title), rebrandVisibleText(page.description));
  app.innerHTML = `${header(page.active)}${rebrandVisibleText(page.html)}${footer()}`;
  page.bind?.(go, render);
  revealPage();
}
function updateMeta(title, description) {
  document.title = `${SITE_BRAND} — ${title}`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  const canonical = document.querySelector('link[rel="canonical"]') ?? document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" }));
  canonical.href = new URL(location.pathname, configuredPublicOrigin || location.origin).href;
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonical.href);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  const preview = new URL(SOCIAL_PREVIEW_PATH, configuredPublicOrigin || location.origin).href;
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", preview);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", preview);
}
function bindChrome() {
  const head = qs("#site-head");
  const onScroll = () => {
    head?.classList.toggle("scrolled", scrollY > 12);
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  cleanups.push(() => removeEventListener("scroll", onScroll));
  const menu = qs("#menu");
  const panel = qs("#mpanel");
  const close = () => {
    if (panel) panel.hidden = true;
    menu?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };
  menu?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!panel) return;
    panel.hidden = !panel.hidden;
    menu.setAttribute("aria-expanded", String(!panel.hidden));
    document.body.classList.toggle("menu-open", !panel.hidden);
  });
  const outside = (event) => {
    const target = event.target;
    if (!panel?.contains(target) && !menu?.contains(target)) close();
  };
  const escape = (event) => {
    if (event.key === "Escape") {
      close();
      menu?.focus();
    }
  };
  document.addEventListener("click", outside);
  document.addEventListener("keydown", escape);
  cleanups.push(() => document.removeEventListener("click", outside), () => document.removeEventListener("keydown", escape));
}
function bindNetworkNotice() {
  const paint = () => {
    qs("#network-notice")?.remove();
    if (navigator.onLine) return;
    const banner = document.createElement("div");
    banner.id = "network-notice";
    banner.className = "network-notice";
    banner.setAttribute("role", "status");
    banner.textContent = "أنت غير متصل — إنشاء الغرف والانضمام يحتاجان اتصالًا بالإنترنت.";
    document.body.append(banner);
  };
  addEventListener("online", paint);
  addEventListener("offline", paint);
  paint();
  cleanups.push(() => {
    removeEventListener("online", paint);
    removeEventListener("offline", paint);
    qs("#network-notice")?.remove();
  });
}
queueMicrotask(render);
//# sourceMappingURL=bundle.js.map
