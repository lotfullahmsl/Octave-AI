# 🚀 Deploying Octave AI Frontend to Vercel

## Quick Deploy Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd octave-ai/frontend
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N** (for first deployment)
   - Project name: **octave-ai-frontend**
   - Directory: **./** (current directory)

## Alternative: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Set root directory to `octave-ai/frontend`
6. Deploy!

## Environment Variables (if needed later):
- `VITE_API_URL`: Your backend API URL
- Add in Vercel dashboard under Project Settings > Environment Variables

## Custom Domain (Optional):
- Go to Project Settings > Domains
- Add your custom domain
- Follow DNS configuration steps

Your app will be live at: `https://your-project-name.vercel.app`