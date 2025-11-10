# 设计文档

## 架构
- JWT + RefreshToken双token机制
- OAuth2.0支持Google/GitHub

## 技术栈
- jsonwebtoken
- passport
- bcrypt

## 风险点
- Token泄露风险 -> 使用httpOnly cookie
- CSRF攻击 -> 添加CSRF token
