import crypto from "node:crypto"

// PII 암호화·해시 헬퍼
//
// 운영 정책:
//   - phoneCipher / plateCipher 등 Bytes 컬럼: AES-256-GCM 암호화
//   - phoneHash / plateHash: SHA-256 (검색용, 일방향)
//   - 키는 PII_ENCRYPTION_KEY env (32바이트 base64)
//
// 주의 (장기 운영):
//   - 운영 환경에선 PII_ENCRYPTION_KEY를 AWS Secrets Manager로 관리, 분기 1회 rotation
//   - rotation 시 이전 키도 보존해야 기존 데이터 복호화 가능 (key version 컬럼 추가 검토)
//   - dev에서는 .env.local에 임시 키 사용

const RAW_KEY = process.env.PII_ENCRYPTION_KEY ?? "dev-only-please-rotate-in-production-32b!"

// 32바이트로 정규화 (sha256으로 derive)
function getKey(): Buffer {
  return crypto.createHash("sha256").update(RAW_KEY).digest()
}

// Prisma Bytes 컬럼은 Uint8Array<ArrayBuffer> 타입을 요구
// Buffer는 내부 ArrayBufferLike (SharedArrayBuffer 가능)이라 직접 호환 X → 새 ArrayBuffer로 복사
function bufferToUint8(buf: Buffer): Uint8Array<ArrayBuffer> {
  const ab = new ArrayBuffer(buf.length)
  const u = new Uint8Array(ab)
  u.set(buf)
  return u
}

export function encryptPII(plaintext: string): Uint8Array<ArrayBuffer> {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv)
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  // [iv(12) | tag(16) | ciphertext]
  return bufferToUint8(Buffer.concat([iv, tag, enc]))
}

export function decryptPII(blob: Uint8Array): string {
  const buf = Buffer.from(blob)
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const enc = buf.subarray(28)
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(enc), decipher.final()])
  return dec.toString("utf8")
}

export function hashPII(value: string): string {
  // 정규화: 휴대폰 하이픈 제거 등은 호출 측에서
  return crypto.createHash("sha256").update(value).digest("hex")
}

// 휴대폰 정규화 (010-1234-5678 → 01012345678)
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "")
}

// 차량번호 정규화 (12가 3456 → 12가3456)
export function normalizePlate(plate: string): string {
  return plate.replace(/\s/g, "")
}

// 차량번호 마스킹 (12가3456 → 12가****)
export function maskPlate(plate: string): string {
  const normalized = normalizePlate(plate)
  if (normalized.length <= 3) return normalized
  return normalized.slice(0, 3) + "*".repeat(Math.max(normalized.length - 3, 4))
}
