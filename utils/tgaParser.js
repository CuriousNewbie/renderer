class TGA {
    constructor(buffer) {
        this.buffer = buffer;
        this.isFlipy = true;
        this.parse();
    }
    static getHeader(buffer) {
        let header = {};
        let int8 = new Int8Array(buffer);
        let int16 = new Int16Array(buffer, 0, Math.floor(buffer.byteLength / 2));

        header.idlength = int8[0];
        header.colourMapType = int8[1];
        header.dataTypeCode = int8[2];
        header.colourMapOrigin = int16[3];
        header.colourMapLength = int16[5];
        header.colourMapDepth = int8[7];
        header.width = int16[6];
        header.height = int16[7];
        header.bitsPerPixel = int8[16];
        header.imageDescriptor = int8[17];
        return header;
    }
    parse() {
        this.header = this.readHeader();
        if (!this.check()) {
            return;
        }
        this.readPixels();
    }
    readHeader() {
        let header = TGA.getHeader(this.buffer);
        this.width = header.width;
        this.height = header.height;
        this.bytesPerPixel = header.bytesPerPixel = header.bitsPerPixel / 8;
        return header;
    }
    check() {
        let header = this.header;
        /* What can we handle */
        if (header.dataTypeCode != 2 && header.dataTypeCode != 10) {
            console.error(header.dataTypeCode)
            console.error('Can only handle image type 2 and 10');
            return false;
        }
        if (header.bitsPerPixel != 16 &&
            header.bitsPerPixel != 24 && header.bitsPerPixel != 32) {
            console.error('Can only handle pixel depths of 16, 24, and 32');
            return false;
        }
        if (header.colourMapType != 0 && header.colourMapType != 1) {
            console.error('Can only handle colour map types of 0 and 1');
            return false;
        }
        return true;
    }
    addPixel(arr, offset, idx) {
        if (this.isFlipY) {
            let y = this.height - 1 - Math.floor(idx / this.width);
            idx = y * this.width + idx % this.width;
        }
        idx *= 4;
        let count = this.bytesPerPixel;
        let r = 255;
        let g = 255;
        let b = 255;
        let a = 255;
        if (count === 3 || count === 4) {
            r = arr[offset + 2];
            g = arr[offset + 1];
            b = arr[offset];
            a = count === 4 ? arr[offset + 3] : 255;
        } else if (count === 2) {
            r = (arr[offset + 1] & 0x7c) << 1;
            g = ((arr[offset + 1] & 0x03) << 6) | ((arr[offset] & 0xe0) >> 2);
            b = (arr[offset] & 0x1f) << 3;
            a = (arr[offset + 1] & 0x80);
        } else {
            console.error('cant transform to Pixel');
        }

        this.pixels[idx] = r;
        this.pixels[idx + 1] = g;
        this.pixels[idx + 2] = b;
        this.pixels[idx + 3] = a;
    }
    readPixels() {
        let header = this.header;
        let bytesPerPixel = header.bytesPerPixel;
        let pixelCount = header.width * header.height;
        let data = new Uint8Array(this.buffer);
        this.pixels = new Uint8Array(pixelCount * 4);
        let offset = 18;
        for (let i = 0; i < pixelCount; i++) {
            if (header.dataTypeCode === 2) {
                this.addPixel(data, offset, i);
            } else if (header.dataTypeCode === 10) {
                let flag = data[offset++];
                let count = flag & 0x7f;
                let isRLEChunk = flag & 0x80;
                this.addPixel(data, offset, i);
                for (let j = 0; j < count; j++) {
                    if (!isRLEChunk) {
                        offset += this.bytesPerPixel;
                    }
                    this.addPixel(data, offset, ++i);
                }
            }
            offset += this.bytesPerPixel;
        }
    }
}

const getTextureData = (buffer) => {
    let tga = new TGA(buffer);
    return {
        width: tga.width,
        height: tga.height,
        data: tga.pixels
    }
}
module.exports = getTextureData