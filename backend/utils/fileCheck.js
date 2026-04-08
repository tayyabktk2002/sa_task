const getMagicBytesHex = (buffer, length) => buffer.subarray(0, length).toString('hex');

const isFileSignatureValid = (file) => {
  const buffer = file?.buffer;
  if (!buffer || buffer.length < 4) return false;

  const mime = file.mimetype;
  if (mime === 'image/png') return getMagicBytesHex(buffer, 8) === '89504e470d0a1a0a';
  if (mime === 'image/gif') return getMagicBytesHex(buffer, 6) === '474946383761' || getMagicBytesHex(buffer, 6) === '474946383961';
  if (mime === 'image/webp') return getMagicBytesHex(buffer, 4) === '52494646' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  if (mime === 'application/pdf') return buffer.subarray(0, 4).toString('ascii') === '%PDF';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return getMagicBytesHex(buffer, 3) === 'ffd8ff';

  return false;
};

module.exports = { isFileSignatureValid };