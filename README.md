# Jack Kinney - Personal Portfolio Website 🤖

A clean, modern portfolio website for a Robotics Engineering student at UC Santa Cruz, specializing in quantum computing, reinforcement learning, computer vision, and autonomous systems.

## 🌟 Features

- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Modern Aesthetics**: Clean dark theme with smooth animations and interactions
- **Performance Focused**: Fast loading with embedded styles and optimized code
- **Accessibility First**: WCAG compliant with proper ARIA labels and keyboard navigation
- **SEO Optimized**: Meta tags, sitemap, and structured data for search engines
- **Professional Layout**: Perfect for showcasing robotics and AI projects

## 🚀 Live Demo

Your portfolio will be available at: `https://your-username.github.io`

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3 (embedded), JavaScript (embedded)
- **Fonts**: Inter & JetBrains Mono from Google Fonts
- **Icons**: Font Awesome 6.4.0
- **Animations**: CSS transitions and keyframes
- **Hosting**: GitHub Pages (free)

## 📁 Project Structure

```
portfolio/
├── index.html              # Main homepage with embedded styles
├── projects.html           # Projects showcase page  
├── research.html           # Academic research page
├── robots.txt             # SEO robots file
├── sitemap.xml            # SEO sitemap  
├── README.md              # This file
│
└── assets/ (optional)
    ├── images/
    │   ├── profile.jpg     # Your profile photo (optional)
    │   └── projects/       # Project images (optional)
    └── docs/
        └── resume.pdf      # Your resume (optional)
```

## 🎯 Quick Setup (5 Minutes!)

### Method 1: Direct Download & Upload

1. **Create GitHub Repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it **exactly**: `your-username.github.io` (replace with your actual username)
   - Make it public
   - Don't add README, .gitignore, or license (we'll add our own)

2. **Get the Files**
   - Copy the HTML content from the artifacts above
   - Save each as the corresponding filename:
     - `index.html` (main page)
     - `projects.html` (projects page)
     - `research.html` (research page)
     - `robots.txt` (SEO file)
     - `sitemap.xml` (SEO file)

3. **Upload to GitHub**
   - Go to your repository on GitHub
   - Click "uploading an existing file"
   - Drag and drop all the HTML and other files
   - Commit the files

4. **Enable GitHub Pages**
   - Go to your repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save

5. **Done!** Your site will be live at `https://your-username.github.io` in a few minutes!

### Method 2: Command Line (For Developers)

```bash
# Clone your repository
git clone https://github.com/your-username/your-username.github.io.git
cd your-username.github.io

# Add the HTML files (copy from artifacts above)
# Create and save each file with the provided content

# Commit and push
git add .
git commit -m "Initial portfolio setup"
git push origin main
```

## ✏️ Customization Guide

### 1. Personal Information
**In all HTML files**, update these sections:
- **Name**: Search for "Jack Kinney" and replace with your name
- **Email**: Replace `jack.kinney@ucsc.edu` with your email
- **University**: Replace "UC Santa Cruz" with your school
- **Social Links**: Update LinkedIn, GitHub, etc. URLs

### 2. Content Updates
**index.html**:
- Hero section: Update title and description
- About section: Rewrite with your background
- Skills: Update with your actual skills
- Projects: Replace with your projects
- Contact: Update contact information

**projects.html**:
- Replace example projects with your actual work
- Update project descriptions, technologies, and links
- Add your GitHub repository links

**research.html**:
- Replace with your actual publications and research
- Update research interests
- Add your academic activities

### 3. Colors & Styling
All styles are embedded in each HTML file. To change colors, look for this section in each file:

```css
:root {
  --primary: #6366f1;        /* Main blue color */
  --secondary: #ec4899;      /* Pink accent */
  --bg-primary: #0f172a;     /* Dark background */
  /* ... other colors ... */
}
```

### 4. Adding Images
- Create an `assets/images/` folder in your repository
- Add your profile photo as `assets/images/profile.jpg`
- Update the image placeholder in the about section:

```html
<!-- Replace this -->
<div class="image-placeholder">
  <i class="fas fa-user"></i>
</div>

<!-- With this -->
<img src="./assets/images/profile.jpg" alt="Your Name" loading="lazy">
```

### 5. SEO Updates
**Update these files**:
- `sitemap.xml`: Replace `your-username.github.io` with your actual domain
- `robots.txt`: Replace `your-username.github.io` with your actual domain
- In HTML files: Update meta descriptions and titles

## 🔧 Troubleshooting

### Site Not Loading
- ✅ Repository name must be exactly `your-username.github.io`
- ✅ Repository must be public
- ✅ GitHub Pages must be enabled in Settings > Pages
- ✅ Wait 5-10 minutes for changes to appear

### Styling Issues
- ✅ All CSS is embedded in HTML files - no external stylesheets needed
- ✅ Check browser console for any JavaScript errors
- ✅ Try refreshing with Ctrl+F5 (hard refresh)

### Images Not Showing
- ✅ Check file paths are correct (`./assets/images/filename.jpg`)
- ✅ File names are case-sensitive
- ✅ Make sure images are uploaded to the repository

### Mobile Menu Not Working
- ✅ JavaScript is embedded in each HTML file
- ✅ Check browser console for errors
- ✅ Ensure all `<script>` tags are properly closed

## 📱 Features Included

### ✨ Interactive Elements
- Smooth scrolling navigation
- Mobile hamburger menu
- Hover effects on cards and buttons
- Progress bars for research projects
- Working contact form (frontend only)
- Scroll progress indicator

### 🎨 Design Features
- Dark theme with professional colors
- Gradient accents and smooth transitions
- Font Awesome icons throughout
- Responsive grid layouts
- Modern typography with Inter and JetBrains Mono

### 🔍 SEO & Performance
- Meta tags for social media sharing
- Structured data for search engines
- Fast loading with embedded styles
- Mobile-optimized design
- Accessibility features

## 📈 Next Steps

1. **Customize Content**: Replace all placeholder content with your actual information
2. **Add Images**: Upload your profile photo and project screenshots
3. **Update Links**: Add your real GitHub, LinkedIn, and project URLs
4. **Create Resume**: Add a PDF resume to `assets/docs/resume.pdf`
5. **Test Everything**: Check all links and features work correctly
6. **Share**: Add the link to your LinkedIn, resume, and job applications!

## 🤝 Getting Help

If you run into issues:
1. Check this README for troubleshooting tips
2. Ensure you've followed the setup steps exactly
3. Check GitHub Pages status in your repository settings
4. Try viewing the site in an incognito/private browser window

## 📄 License

This portfolio template is free to use for personal and educational purposes. Feel free to customize it for your own use!

---

**🎉 Your professional robotics portfolio is ready! Replace this content with your own and start showcasing your amazing work in robotics, quantum computing, and AI.**