import Hashes from "jshashes"

const MD5 = new Hashes.MD5

export const customHash = ({ string, min = 0, max = 2}) => {
    const hash = MD5.hex(string)
    let hashNum = BigInt('0x' + hash) % BigInt( max - min)
    hashNum += BigInt(min)

    return Number(hashNum)
}