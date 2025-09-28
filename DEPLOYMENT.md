# Deployment Guide

## Overview

This project is a Next.js application with TypeScript, Tailwind CSS, and shadcn/ui components. It includes Socket.IO functionality for real-time features.

## Deployment Options

### 1. Vercel (Recommended)

#### Prerequisites
- Node.js 18+ installed locally
- Vercel account
- GitHub repository connected to Vercel

#### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Environment Variables**
   Create `.env.local` file with required variables:
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your environment variables.

4. **Build and Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

#### Automatic Deployment
- Push your code to GitHub
- Connect your GitHub repository to Vercel
- Set environment variables in Vercel dashboard
- Vercel will automatically deploy on every push to main branch

### 2. Netlify

#### Setup Steps

1. **Install Netlify CLI**
   ```bash
   npm install netlify-cli -g
   ```

2. **Build the project**
   ```bash
   npm run build
   npm run export
   ```

3. **Deploy to Netlify**
   ```bash
   netlify deploy --prod --dir=out
   ```

### 3. AWS Amplify

#### Setup Steps

1. **Install AWS Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add hosting**
   ```bash
   amplify add hosting
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

## Known Limitations

### Socket.IO in Serverless Environments

The current implementation uses Socket.IO for real-time features, which has limitations in serverless environments:

**Issue**: Socket.IO requires persistent connections, which serverless functions don't support natively.

**Solutions**:

1. **Use Pusher** (Recommended for Vercel)
   ```bash
   npm install pusher-js
   ```
   Update your real-time code to use Pusher instead of Socket.IO.

2. **Use Ably**
   ```bash
   npm install ably
   ```

3. **Use Socket.IO Cloud**
   - Sign up for Socket.IO Cloud
   - Update your Socket.IO client configuration

4. **Use Server-Sent Events (SSE)**
   - Implement SSE for simpler real-time updates

## Environment Variables

### Required for Production
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXTAUTH_URL`: Your application URL
- `DATABASE_URL`: Database connection string (if using Prisma)

### Optional
- `ZAI_API_KEY`: AI SDK API key
- `PUSHER_APP_ID`: Pusher app ID
- `PUSHER_KEY`: Pusher key
- `PUSHER_SECRET`: Pusher secret
- `PUSHER_CLUSTER`: Pusher cluster

## Build Commands

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm install
npm run build
npm run start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clean build
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **TypeScript Errors**
   ```bash
   # Check types
   npm run type-check
   ```

3. **Environment Variables Missing**
   - Ensure all required environment variables are set in your deployment platform
   - Check that `.env.local` is not committed to git

4. **Socket.IO Issues**
   - Replace Socket.IO with Pusher/Ably for serverless deployment
   - Use the provided `/api/socketio` route as a fallback

### Performance Optimization

The project includes several optimizations:
- Image optimization with Next.js Image component
- SWC minification
- CSS optimization
- Bundle size optimization

## Support

If you encounter deployment issues:
1. Check the deployment platform's logs
2. Ensure all dependencies are properly installed
3. Verify environment variables are correctly set
4. Review the build logs for specific error messages

For additional help, refer to:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)