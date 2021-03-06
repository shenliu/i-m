﻿/**
 * String defining the default swf file
 * overrides jSocket.swf in jsocket.js
 * @var String
 */
JSocket.swf = "script/3rdpart/jsocket/jSocketAdvanced.swf";

/**
 * Flushes the write buffer to the remote host
 *
 * You need to use this function everytime you want to
 * send data to the server when using the advanced socket
 */
JSocket.prototype.flush = function() {
  this.assertConnected();
  return this.movie.flush();
};

/**
 * Write the contents of the array one by one to the write buffer
 * The SWF figures out what type of write to use
 * @param {Array} data
 */
JSocket.prototype.writeArray = function(data) {
  this.assertConnected();
  this.movie.writeArray(data);
};

/**
 * Write a Boolean to the write buffer
 * @param {boolean} data
 */
JSocket.prototype.writeBoolean = function(data) {
  this.assertConnected();
  this.movie.writeBoolean(data);
};

/**
 * Read a Boolean from the read buffer
 * @return bool
 */
JSocket.prototype.readBoolean = function() {
  this.assertConnected();
  return this.movie.readBoolean();
};

/**
 * Write a single Byte to the write buffer
 * @param {String} data
 */
JSocket.prototype.writeByte = function(data) {
  this.assertConnected();
  this.movie.writeByte(data);
};

/**
 * Read a single Byte from the read buffer
 * @return bool
 */
JSocket.prototype.readByte = function() {
  this.assertConnected();
  return this.movie.readByte();
};

/**
 * Write a sequence of Bytes to the write buffer
 * @param {Array} bytes Array holding the bytes to write
 * @param {int} offset (optional)
 * @param {int} length (optional)
 */
JSocket.prototype.writeBytes = function(bytes, offset, length){
  this.assertConnected();
  this.movie.writeBytes(bytes, offset, length);
};

/**
 * Read a sequence of Bytes from the read buffer
 * @param {int} offset (optional)
 * @param {int} length (optional)
 * @return {Array}
 */
JSocket.prototype.readBytes = function(offset, length) {
  this.assertConnected();
  return this.movie.readBytes(offset, length);
};

/**
 * Write a short 16-bit integer to the write buffer
 * @param {int} data 16-bit integer
 */
JSocket.prototype.writeShort = function(data) {
  this.assertConnected();
  this.movie.writeShort(data);
};

/**
 * Read a short 16-bit integer from the read buffer
 * @return int 16-bit integer
 */
JSocket.prototype.readShort = function() {
  this.assertConnected();
  return this.movie.readShort();
};

/**
 * Write a signed integer to the write buffer
 * @param {int} data
 */
JSocket.prototype.writeInt = function(data) {
  this.assertConnected();
  this.movie.writeInt(data);
};

/**
 * Read a signed integer from the read buffer
 * @return int
 */
JSocket.prototype.readInt = function() {
  this.assertConnected();
  return this.movie.readInt();
};

/**
 * Write a unsigned integer to the write buffer
 * @param {int} data
 */
JSocket.prototype.writeUnsignedInt = function(data) {
  this.assertConnected();
  this.movie.writeUnsignedInt(data);
};

/**
 * Read a unsigned integer from the read buffer
 * @return int
 */
JSocket.prototype.readUnsignedInt = function() {
  this.assertConnected();
  return this.movie.readUnsignedInt();
};

/**
 * Write a float to the write buffer
 * @param {Number} data
 */
JSocket.prototype.writeFloat = function(data) {
  this.assertConnected();
  this.movie.writeFloat(data);
};

/**
 * Read a float from the read buffer
 * @return float
 */
JSocket.prototype.readFloat = function() {
  this.assertConnected();
  return this.movie.readFloat();
};

/**
 * Write a double to the write buffer
 * @param {Number} data
 */
JSocket.prototype.writeDouble = function(data) {
  this.assertConnected();
  this.movie.writeDouble(data);
};

/**
 * Read a double from the read buffer
 * @return float
 */
JSocket.prototype.readDouble = function() {
  this.assertConnected();
  return this.movie.readDouble();
};

/**
 * Write a multiByte string to the write buffer
 * @param {string} data The string to send
 * @param {string} charSet The charset of the string that is being send (valid charset codes: http://help.adobe.com/en_US/AS3LCR/Flash_10.0/charset-codes.html)
 */
JSocket.prototype.writeMultiByte = function(data, charSet) {
  this.assertConnected();
  this.movie.writeMultiByte(data, charSet);
};

/**
 * Read a multiByte string from the read buffer
 * @param {int} length The number of bytes to read from the read buffer
 * @param {string} charSet The string denoting the character set to use to interpret the bytes.
 * @return string The string is always returned in UTF-8
 */
JSocket.prototype.readMultiByte = function(length,charSet) {
  this.assertConnected();
  return this.movie.readMultiByte(length, charSet);
};

/**
 * Write a UTF-8 encoded string to the write buffer
 * @param {string} data The string to write
 */
JSocket.prototype.writeUTFBytes = function(data) {
  this.assertConnected();
  this.movie.writeUTFBytes(data);
};

/**
 * Reads the number of UTF-8 data bytes specified by the length parameter from the socket, and returns a string.
 * @param {int} length The number of bytes to read.
 * @return string A UTF-8 string
 */
JSocket.prototype.readUTFBytes = function(length) {
  this.assertConnected();
  return this.movie.readUTFBytes(length);
};

/**
 * Writes the following data to the write buffer: a 16-bit unsigned integer, which indicates the length of the specified UTF-8 string in bytes, followed by the string itself.
 * @param {string} data The string to write
 */
JSocket.prototype.writeUTF = function(data) {
  this.assertConnected();
  this.movie.writeUTF(data);
};

/**
 * Reads a UTF-8 string from the read buffer. The string is assumed to be prefixed with an unsigned short integer that indicates the length in bytes.
 * @return string A UTF-8 string
 */
JSocket.prototype.readUTF = function() {
  this.assertConnected();
  return this.movie.readUTF();
};

/**
 * Write an object to the write buffer in AMF serialized format.
 * @see jSocket.prototype.getObjectEncoding
 * @param {object} data The object to be serialized
 */
JSocket.prototype.writeObject = function(data) {
  this.assertConnected();
  this.movie.writeObject(data);
};

/**
 * Reads an object from the socket, encoded in AMF serialized format.
 * @see jSocket.prototype.getObjectEncoding
 * @return object The deserialized object
 */
JSocket.prototype.readObject = function() {
  this.assertConnected();
  return this.movie.readObject();
};

/**
 * Sets the object encoding when serializing objects
 * @param {int} value 0 for AS 1.0 and 2.0. 3 for AS 3.0
 */
JSocket.prototype.setObjectEncoding = function(value) {
  this.assertConnected();
  this.movie.setObjectEncoding(value);
};

/**
 * Gets the object encoding
 * @return int 0 for AS 1.0 and 2.0. 3 for AS 3.0
 */
JSocket.prototype.getObjectEncoding = function() {
  this.assertConnected();
  return this.movie.getObjectEncoding();
};

/**
 * Set the byte order for the data (default is bigEndian)
 * @param {string} value either "bigEndian" or "littleEndian"
 */
JSocket.prototype.setEndian = function(value) {
  this.assertConnected();
  this.movie.setEndian(value);
};

/**
 * Get the byte order used for the data
 * @return string either "bigEndian" or "littleEndian"
 */
JSocket.prototype.getEndian = function() {
  this.assertConnected();
  return this.movie.getEndian();
};

/**
 * The number of bytes available for reading
 * @return int
 */
JSocket.prototype.getBytesAvailable = function() {
  this.assertConnected();
  return this.movie.getBytesAvailable();
};
