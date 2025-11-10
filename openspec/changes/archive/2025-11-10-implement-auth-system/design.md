# 认证系统技术设计

## Context

电商系统需要安全可靠的用户认证体系,支持多种登录方式,满足业务增长需求。

**约束**:
- 必须符合GDPR数据保护要求
- 密码必须使用bcrypt加密(cost factor ≥ 12)
- Token有效期不超过1小时
- 需要支持水平扩展

## Goals / Non-Goals

**Goals**:
- 实现安全的用户认证
- 支持传统密码和OAuth登录
- 良好的用户体验(token自动刷新)
- 可扩展的权限系统

**Non-Goals**:
- 不实现生物识别认证
- 不实现单点登录(SSO)
- 暂不支持多因素认证(MFA)

## Architecture

### 认证流程

```
1. 密码认证流程:
   用户 -> 注册/登录 -> 密码验证 -> 生成JWT -> 返回token
                                    ↓
                              存储session

2. OAuth流程:
   用户 -> OAuth提供商 -> 授权回调 -> 获取用户信息 -> 账号关联/创建 -> 生成JWT
```

### Token策略

- **Access Token**: 1小时有效期,包含用户ID和角色
- **Refresh Token**: 30天有效期,仅用于刷新access token
- 使用Redis存储session,支持快速撤销

### 数据库设计

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- bcrypt hash
  username VARCHAR(50) UNIQUE,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OAuth关联表
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(20),  -- 'google' | 'github'
  provider_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 会话表
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  refresh_token VARCHAR(255) UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Technology Stack

- **密码加密**: bcrypt (cost factor 12)
- **JWT**: jsonwebtoken (HS256算法)
- **OAuth SDK**: passport.js
- **Session存储**: Redis
- **数据库**: PostgreSQL

## Security Considerations

### 1. 密码安全
- ✅ 使用bcrypt(cost 12)加密
- ✅ 密码强度验证(最少8位,包含大小写数字特殊字符)
- ✅ 防止时序攻击(固定时间比较)

### 2. Token安全
- ✅ 短期access token(1小时)
- ✅ HttpOnly cookie存储refresh token
- ✅ CSRF token验证
- ✅ Token签名验证

### 3. 防护措施
- ✅ 登录尝试限制(5次/15分钟)
- ✅ IP白名单(可选)
- ✅ 异常登录检测
- ✅ HTTPS强制

## Performance Considerations

### 缓存策略
- User信息缓存(TTL 5分钟)
- Session缓存在Redis
- 减少数据库查询

### 扩展性
- 无状态JWT设计,支持水平扩展
- Redis集群支持session共享
- 数据库读写分离

## Migration Plan

### Phase 1: 基础认证(Week 1)
- 数据库表创建
- 注册/登录API
- JWT生成和验证

### Phase 2: OAuth集成(Week 2)
- Google OAuth
- GitHub OAuth
- 账号关联逻辑

### Phase 3: 安全加固(Week 3)
- 限流和防护
- 安全测试
- 文档完善

### Rollback Plan
- 保留旧认证接口(如有)
- 数据库迁移可回滚
- 功能开关控制

## Open Questions

1. 是否需要支持邮箱验证?
   - 建议: Phase 2实现

2. 是否需要记住登录设备?
   - 建议: 使用refresh token实现

3. Token刷新策略?
   - 建议: 滑动窗口,access token过期前5分钟自动刷新

## Risk Analysis

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 密码泄露 | 高 | bcrypt加密 + 密码强度要求 |
| Token劫持 | 高 | HTTPS + HttpOnly cookie + 短期token |
| 暴力破解 | 中 | 登录限流 + 验证码 |
| OAuth配置错误 | 中 | 严格的回调URL验证 |
| 性能瓶颈 | 低 | Redis缓存 + 数据库优化 |
