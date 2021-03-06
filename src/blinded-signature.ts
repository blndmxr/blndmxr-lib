import * as assert from './util/assert';
import * as ecc from './util/ecc';
import * as bech32 from './util/bech32';

const serializedPrefix = 'bsmp'; // blinded signature blindmixer

export default class BlindedSignature {
  public static fromPOD(data: any) {
    if (typeof data !== 'string') {
      return new Error('BlindedSignature.fromPOD expected a string');
    }

    const { prefix, words } = bech32.decode(data);

    if (prefix !== serializedPrefix) {
      return new Error('Got prefix: ' + prefix + ' but expected ' + serializedPrefix);
    }

    return BlindedSignature.fromBytes(bech32.fromWords(words));
  }

  public static fromBytes(bytes: Uint8Array): BlindedSignature | Error {
    assert.equal(bytes.length, 32);
    const s = ecc.Scalar.fromBytes(bytes);
    if (s instanceof Error) {
      return s;
    }

    return new BlindedSignature(s);
  }

  public s: ecc.Scalar;

  constructor(s: ecc.Scalar) {
    this.s = s;
  }

  public verify(nonce: ecc.Point, message: bigint, signer: ecc.Point): boolean {
    return ecc.blindVerify(this.s, nonce, message, signer)
  }

  get buffer(): Uint8Array {
    return ecc.Scalar.toBytes(this.s);
  }

  public toPOD() {
    return bech32.encode(serializedPrefix, bech32.toWords(this.buffer));
  }
}
