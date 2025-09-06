# Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/financial_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=15m

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Session Configuration
SESSION_EXPIRE_DAYS=30
```

## MongoDB Setup

1. Make sure MongoDB is installed and running on your system
2. The default connection string connects to localhost on port 27017
3. Database name will be `financial_management`
4. Collections will be created automatically:
   - `users` - User accounts
   - `sessions` - Login sessions

## Security Notes

- Change `JWT_SECRET` to a strong, random string in production
- Use a cloud MongoDB service like MongoDB Atlas for production
- Consider using environment-specific configuration files
