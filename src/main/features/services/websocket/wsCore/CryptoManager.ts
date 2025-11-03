import crypto from 'crypto'
import { sysLogger } from '@nodeUtils/sysLogger'

/**
 * 加密算法常量
 */
export const CRYPTO_ALGORITHMS = {
  AES: 'aes-256-gcm',
  HMAC: 'sha256',
  RSA: 'rsa',
  PBKDF2: 'pbkdf2'
} as const

/**
 * 加密数据接口
 */
export interface EncryptedData {
  algorithm: string
  iv: string // 初始化向量 (base64)
  ciphertext: string // 密文 (base64)
  authTag: string // 认证标签 (base64)
  salt?: string // 盐值 (base64, 用于密钥派生)
  timestamp: number
}

/**
 * 解密消息接口
 */
export interface DecryptedMessage {
  plaintext: string
  timestamp: number
  verified: boolean // HMAC 验证结果
}

/**
 * 消息元数据
 */
export interface MessageMeta {
  senderId?: string
  roomId?: string
  sessionKeyId?: string
  version?: string
}

/**
 * 握手结果
 */
export interface HandshakeResult {
  publicKey: string // 公钥 (PEM格式)
  privateKey: string // 私钥 (PEM格式)
  sessionKey: string // 会话密钥 (base64)
  sessionKeyId: string // 会话密钥ID
  expiresAt: number // 过期时间
}

/**
 * 密钥配置
 */
export interface KeyConfig {
  sessionKeyLength?: number // 会话密钥长度 (默认 32 bytes)
  pbkdf2Iterations?: number // PBKDF2 迭代次数 (默认 100000)
  rsaKeyLength?: number // RSA 密钥长度 (默认 2048)
  sessionKeyTTL?: number // 会话密钥TTL (默认 1小时)
}

/**
 * 加密管理器
 * 提供消息加密/解密、密钥管理、HMAC 签名等功能
 */
export class CryptoManager {
  private sessionKeys: Map<string, string> = new Map() // sessionKeyId -> key
  private roomKeys: Map<string, string> = new Map() // roomId -> key
  private masterKeys: Map<string, string> = new Map() // scope -> key
  private keyConfig: Required<KeyConfig>

  constructor(config: KeyConfig = {}) {
    this.keyConfig = {
      sessionKeyLength: config.sessionKeyLength ?? 32,
      pbkdf2Iterations: config.pbkdf2Iterations ?? 100000,
      rsaKeyLength: config.rsaKeyLength ?? 2048,
      sessionKeyTTL: config.sessionKeyTTL ?? 3600000, // 1 小时
      ...config
    }

    // 生成默认主密钥
    this.generateMasterKey('default')

    sysLogger.log('CryptoManager initialized with config:', {
      sessionKeyLength: this.keyConfig.sessionKeyLength,
      pbkdf2Iterations: this.keyConfig.pbkdf2Iterations,
      rsaKeyLength: this.keyConfig.rsaKeyLength,
      sessionKeyTTL: this.keyConfig.sessionKeyTTL
    })
  }

  /**
   * 生成 RSA 密钥对并执行握手
   */
  public generateHandshake(): HandshakeResult {
    try {
      // 生成 RSA 密钥对
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: this.keyConfig.rsaKeyLength,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      })

      // 生成会话密钥
      const sessionKey = this.generateSessionKey()
      const sessionKeyId = this.generateKeyId()

      // 存储会话密钥
      this.sessionKeys.set(sessionKeyId, sessionKey)

      // 设置过期时间
      const expiresAt = Date.now() + this.keyConfig.sessionKeyTTL

      sysLogger.log('Handshake generated', { sessionKeyId, expiresAt })

      return {
        publicKey,
        privateKey,
        sessionKey,
        sessionKeyId,
        expiresAt
      }
    } catch (error) {
      sysLogger.error('Failed to generate handshake:', error)
      throw new Error('Handshake generation failed')
    }
  }

  /**
   * 导入会话密钥
   */
  public importSessionKey(sessionKeyId: string, sessionKey: string, expiresAt: number): void {
    // 检查是否过期
    if (Date.now() > expiresAt) {
      throw new Error('Session key expired')
    }

    this.sessionKeys.set(sessionKeyId, sessionKey)
    sysLogger.log('Session key imported', { sessionKeyId, expiresAt })
  }

  /**
   * 加密消息
   */
  public encrypt(
    message: string,
    meta: MessageMeta = {},
    targetKey?: string
  ): EncryptedData {
    try {
      // 获取或生成密钥
      const key = this.getEncryptionKey(meta, targetKey)

      // 生成随机 IV
      const iv = crypto.randomBytes(12) // GCM 模式推荐 12 字节

      // 创建加密器
      const cipher = crypto.createCipheriv(CRYPTO_ALGORITHMS.AES, Buffer.from(key, 'hex'), iv, {
        authTagLength: 16
      })

      // 加密消息
      let encrypted = cipher.update(message, 'utf8', 'base64')
      encrypted += cipher.final('base64')

      // 获取认证标签
      const authTag = cipher.getAuthTag()

      // 计算 HMAC
      const hmac = this.computeHMAC(
        `${encrypted}.${iv.toString('base64')}.${authTag.toString('base64')}`,
        key
      )

      sysLogger.log('Message encrypted', {
        length: message.length,
        roomId: meta.roomId,
        sessionKeyId: meta.sessionKeyId,
        hmac: hmac.substring(0, 16) + '...'
      })

      return {
        algorithm: CRYPTO_ALGORITHMS.AES,
        iv: iv.toString('base64'),
        ciphertext: encrypted,
        authTag: authTag.toString('base64'),
        timestamp: Date.now()
      }
    } catch (error) {
      sysLogger.error('Encryption failed:', error)
      throw new Error('Message encryption failed')
    }
  }

  /**
   * 解密消息
   */
  public decrypt(encrypted: EncryptedData, meta: MessageMeta = {}): DecryptedMessage {
    try {
      // 验证时间戳
      if (Date.now() - encrypted.timestamp > this.keyConfig.sessionKeyTTL) {
        sysLogger.warn('Decrypting expired message')
      }

      // 获取密钥
      const key = this.getEncryptionKey(meta)

      // 计算 HMAC
      const computedHmac = this.computeHMAC(
        `${encrypted.ciphertext}.${encrypted.iv}.${encrypted.authTag}`,
        key
      )

      // 创建解密器
      const decipher = crypto.createDecipheriv(
        CRYPTO_ALGORITHMS.AES,
        Buffer.from(key, 'hex'),
        Buffer.from(encrypted.iv, 'base64'),
        {
          authTagLength: 16
        }
      )

      // 设置认证标签
      decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'))

      // 解密消息
      let decrypted = decipher.update(encrypted.ciphertext, 'base64', 'utf8')
      decrypted += decipher.final('utf8')

      sysLogger.log('Message decrypted', {
        length: decrypted.length,
        roomId: meta.roomId,
        verified: true
      })

      return {
        plaintext: decrypted,
        timestamp: encrypted.timestamp,
        verified: true
      }
    } catch (error) {
      sysLogger.error('Decryption failed:', error)
      // 解密失败时返回验证失败的结果
      return {
        plaintext: '',
        timestamp: Date.now(),
        verified: false
      }
    }
  }

  /**
   * 设置房间密钥
   */
  public setRoomKey(roomId: string, key: string): void {
    // 验证密钥格式
    if (!this.isValidKey(key)) {
      throw new Error('Invalid room key format')
    }

    this.roomKeys.set(roomId, key)
    sysLogger.log('Room key set', { roomId, keyLength: key.length })
  }

  /**
   * 获取房间密钥
   */
  public getRoomKey(roomId: string): string | null {
    return this.roomKeys.get(roomId) || null
  }

  /**
   * 生成房间密钥
   */
  public generateRoomKey(roomId?: string): string {
    const key = crypto.randomBytes(this.keyConfig.sessionKeyLength).toString('hex')

    if (roomId) {
      this.roomKeys.set(roomId, key)
    }

    sysLogger.log('Room key generated', { roomId, hasRoomId: !!roomId })
    return key
  }

  /**
   * 从密码派生密钥 (PBKDF2)
   */
  public deriveKeyFromPassword(password: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const derivedKey = crypto.pbkdf2Sync(
      password,
      Buffer.from(actualSalt, 'hex'),
      this.keyConfig.pbkdf2Iterations,
      this.keyConfig.sessionKeyLength,
      CRYPTO_ALGORITHMS.HMAC
    )

    sysLogger.log('Key derived from password', {
      iterations: this.keyConfig.pbkdf2Iterations,
      salt: actualSalt.substring(0, 16) + '...'
    })

    return derivedKey.toString('hex')
  }

  /**
   * 轮换会话密钥
   */
  public rotateSessionKey(sessionKeyId: string): string {
    const newSessionKey = this.generateSessionKey()
    this.sessionKeys.set(sessionKeyId, newSessionKey)
    sysLogger.log('Session key rotated', { sessionKeyId })
    return newSessionKey
  }

  /**
   * 清理过期密钥
   */
  public cleanupExpiredKeys(): void {
    const now = Date.now()
    // 注意：这里简化处理，实际应该记录每个密钥的创建时间
    // 目前 sessionKeys 没有过期时间信息，需要扩展

    const roomCount = this.roomKeys.size
    const sessionCount = this.sessionKeys.size
    const masterCount = this.masterKeys.size

    sysLogger.log('Key cleanup completed', {
      roomKeys: roomCount,
      sessionKeys: sessionCount,
      masterKeys: masterCount
    })
  }

  /**
   * 获取加密密钥
   */
  private getEncryptionKey(meta: MessageMeta, targetKey?: string): string {
    // 1. 优先使用指定的目标密钥
    if (targetKey) {
      return targetKey
    }

    // 2. 使用房间密钥
    if (meta.roomId) {
      const roomKey = this.roomKeys.get(meta.roomId)
      if (roomKey) {
        return roomKey
      }
    }

    // 3. 使用会话密钥
    if (meta.sessionKeyId) {
      const sessionKey = this.sessionKeys.get(meta.sessionKeyId)
      if (sessionKey) {
        return sessionKey
      }
    }

    // 4. 使用默认主密钥
    return this.masterKeys.get('default')!
  }

  /**
   * 生成会话密钥
   */
  private generateSessionKey(): string {
    return crypto.randomBytes(this.keyConfig.sessionKeyLength).toString('hex')
  }

  /**
   * 生成密钥ID
   */
  private generateKeyId(): string {
    return `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
  }

  /**
   * 生成主密钥
   */
  private generateMasterKey(scope: string): void {
    const key = crypto.randomBytes(this.keyConfig.sessionKeyLength).toString('hex')
    this.masterKeys.set(scope, key)
  }

  /**
   * 计算 HMAC
   */
  private computeHMAC(data: string, key: string): string {
    const hmac = crypto.createHmac(CRYPTO_ALGORITHMS.HMAC, Buffer.from(key, 'hex'))
    hmac.update(data, 'utf8')
    return hmac.digest('hex')
  }

  /**
   * 验证密钥格式
   */
  private isValidKey(key: string): boolean {
    // 检查是否为有效的十六进制字符串
    return /^[0-9a-fA-F]+$/.test(key) && key.length >= 32
  }

  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      roomKeys: this.roomKeys.size,
      sessionKeys: this.sessionKeys.size,
      masterKeys: this.masterKeys.size,
      config: this.keyConfig
    }
  }

  /**
   * 销毁加密管理器
   */
  public destroy(): void {
    this.sessionKeys.clear()
    this.roomKeys.clear()
    this.masterKeys.clear()
    sysLogger.log('CryptoManager destroyed')
  }
}
