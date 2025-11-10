# Authentication Specification Delta

## ADDED Requirements

### Requirement: User Registration
系统 SHALL 提供用户注册功能,支持邮箱和用户名注册。

#### Scenario: 成功注册
- **GIVEN** 用户提供有效的邮箱、用户名和密码
- **WHEN** 用户提交注册请求
- **THEN** 系统创建新用户账户
- **AND** 返回JWT access token和refresh token
- **AND** 密码使用bcrypt加密存储

#### Scenario: 邮箱已存在
- **GIVEN** 用户提供的邮箱已被注册
- **WHEN** 用户提交注册请求
- **THEN** 系统返回错误:"Email already exists"
- **AND** HTTP状态码为409 Conflict

#### Scenario: 密码强度不足
- **GIVEN** 用户提供的密码不符合强度要求
- **WHEN** 用户提交注册请求
- **THEN** 系统返回错误:"Password too weak"
- **AND** 提示密码要求(最少8位,包含大小写数字特殊字符)

### Requirement: User Login
系统 SHALL 提供用户登录功能,支持邮箱/用户名 + 密码登录。

#### Scenario: 登录成功
- **GIVEN** 用户提供正确的邮箱和密码
- **WHEN** 用户提交登录请求
- **THEN** 系统验证密码
- **AND** 生成新的JWT access token(1小时有效期)
- **AND** 生成refresh token(30天有效期)
- **AND** 创建session记录
- **AND** 返回tokens给客户端

#### Scenario: 密码错误
- **GIVEN** 用户提供错误的密码
- **WHEN** 用户提交登录请求
- **THEN** 系统返回错误:"Invalid credentials"
- **AND** 不泄露具体错误原因(用户名或密码)
- **AND** 增加失败尝试计数

#### Scenario: 账户被锁定
- **GIVEN** 用户在15分钟内失败登录5次
- **WHEN** 用户再次尝试登录
- **THEN** 系统返回错误:"Account locked, please try again in 15 minutes"
- **AND** HTTP状态码为429 Too Many Requests

### Requirement: JWT Token Management
系统 SHALL 使用JWT进行会话管理,支持token生成、验证和刷新。

#### Scenario: 生成Access Token
- **GIVEN** 用户成功认证
- **WHEN** 系统生成access token
- **THEN** token包含用户ID、角色、过期时间
- **AND** 使用HS256算法签名
- **AND** 有效期为1小时

#### Scenario: 验证Token
- **GIVEN** 客户端发送带有token的请求
- **WHEN** 系统验证token
- **THEN** 检查token签名有效性
- **AND** 检查token是否过期
- **AND** 从token提取用户信息

#### Scenario: 刷新Token
- **GIVEN** access token即将过期(剩余<5分钟)
- **WHEN** 客户端使用refresh token请求刷新
- **THEN** 验证refresh token有效性
- **AND** 生成新的access token
- **AND** 可选:滚动更新refresh token
- **AND** 返回新tokens

### Requirement: OAuth2.0 Integration
系统 SHALL 支持第三方OAuth登录,包括Google和GitHub。

#### Scenario: Google OAuth登录
- **GIVEN** 用户选择Google登录
- **WHEN** 用户完成Google授权
- **THEN** 系统接收Google回调
- **AND** 获取用户邮箱和profile信息
- **AND** 如果用户不存在,自动创建账户
- **AND** 如果用户存在,关联OAuth账号
- **AND** 生成JWT tokens并登录

#### Scenario: GitHub OAuth登录
- **GIVEN** 用户选择GitHub登录
- **WHEN** 用户完成GitHub授权
- **THEN** 系统接收GitHub回调
- **AND** 获取用户信息
- **AND** 创建或关联账户
- **AND** 生成JWT tokens并登录

#### Scenario: OAuth账号关联
- **GIVEN** 用户已有密码账户
- **WHEN** 用户使用相同邮箱的OAuth登录
- **THEN** 系统自动关联OAuth账号到现有用户
- **AND** 用户可使用两种方式登录

### Requirement: Session Management
系统 SHALL 管理用户会话,支持多设备登录和会话撤销。

#### Scenario: 创建Session
- **GIVEN** 用户成功登录
- **WHEN** 系统生成tokens
- **THEN** 创建session记录,包含:
  - session ID
  - 用户ID
  - refresh token
  - IP地址
  - User-Agent
  - 过期时间

#### Scenario: 登出
- **GIVEN** 用户请求登出
- **WHEN** 系统处理登出请求
- **THEN** 撤销当前session
- **AND** 将refresh token加入黑名单
- **AND** 清除客户端cookies

#### Scenario: 查看活跃设备
- **GIVEN** 用户登录
- **WHEN** 用户查看活跃设备列表
- **THEN** 显示所有session信息:
  - 登录设备
  - 登录时间
  - 最后活跃时间
  - IP地址

#### Scenario: 撤销其他设备
- **GIVEN** 用户在设备A登录
- **WHEN** 用户撤销设备B的session
- **THEN** 设备B的session被删除
- **AND** 设备B的refresh token失效
- **AND** 设备B需要重新登录

### Requirement: Password Security
系统 SHALL 安全存储和验证密码,防止常见攻击。

#### Scenario: 密码加密
- **GIVEN** 用户注册或修改密码
- **WHEN** 系统存储密码
- **THEN** 使用bcrypt算法加密
- **AND** cost factor设置为12
- **AND** 每个密码使用唯一的salt

#### Scenario: 密码验证
- **GIVEN** 用户登录
- **WHEN** 系统验证密码
- **THEN** 使用恒定时间比较,防止时序攻击
- **AND** 不泄露密码hash信息

#### Scenario: 密码强度要求
- **GIVEN** 用户设置密码
- **WHEN** 系统检查密码强度
- **THEN** 密码必须至少8个字符
- **AND** 包含至少1个大写字母
- **AND** 包含至少1个小写字母
- **AND** 包含至少1个数字
- **AND** 包含至少1个特殊字符

### Requirement: Security Protection
系统 SHALL 实现多层安全防护,防止常见攻击。

#### Scenario: 防暴力破解
- **GIVEN** 系统监测登录尝试
- **WHEN** 单个IP在15分钟内失败5次
- **THEN** 锁定该IP 15分钟
- **AND** 后续请求返回429状态码

#### Scenario: CSRF防护
- **GIVEN** 系统处理状态变更请求
- **WHEN** 验证CSRF token
- **THEN** 检查CSRF token有效性
- **AND** token与session绑定
- **AND** 无效token拒绝请求

#### Scenario: XSS防护
- **GIVEN** 系统返回用户输入内容
- **WHEN** 渲染HTML
- **THEN** 转义所有用户输入
- **AND** 设置Content-Security-Policy头
- **AND** HttpOnly标记cookies

#### Scenario: HTTPS强制
- **GIVEN** 客户端使用HTTP访问
- **WHEN** 系统接收请求
- **THEN** 重定向到HTTPS
- **AND** 设置HSTS头
- **AND** 强制secure cookies

### Requirement: Role-Based Access Control
系统 SHALL 实现基于角色的权限控制(RBAC)。

#### Scenario: 角色定义
- **GIVEN** 系统初始化
- **WHEN** 创建默认角色
- **THEN** 创建'user'角色(普通用户)
- **AND** 创建'admin'角色(管理员)
- **AND** 每个角色有对应权限集合

#### Scenario: 权限检查
- **GIVEN** 用户访问受保护资源
- **WHEN** 系统检查权限
- **THEN** 从JWT提取用户角色
- **AND** 验证角色是否有对应权限
- **AND** 无权限返回403 Forbidden

#### Scenario: 角色升级
- **GIVEN** 管理员提升用户权限
- **WHEN** 系统更新用户角色
- **THEN** 修改users表的role字段
- **AND** 下次登录生成新token(包含新角色)
- **AND** 记录权限变更日志
