# Jack Kinney - Personal Portfolio Website 🤖

A modern, responsive personal portfolio website showcasing robotics engineering projects, skills, and research. Built with modern web technologies and optimized for performance and accessibility.

## 🌟 Features

- **Responsive Design**: Looks great on all devices from mobile to desktop
- **Modern Animations**: Smooth scroll animations and interactive elements
- **PWA Ready**: Installable as a Progressive Web App
- **SEO Optimized**: Meta tags, sitemap, and structured data
- **Performance Focused**: Lazy loading, optimized assets, and fast load times
- **Accessibility First**: WCAG compliant with proper ARIA labels
- **Dark Theme**: Modern dark color scheme with accent colors

## 🚀 Live Demo

Visit the live site: [https://your-username.github.io](https://your-username.github.io)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Fonts**: Inter & JetBrains Mono from Google Fonts
- **Icons**: Font Awesome 6.4.0
- **Animations**: CSS transitions and keyframes
- **Hosting**: GitHub Pages

## 📁 Project Structure

```
your-username.github.io/
├── index.html              # Main homepage
├── README.md               # This file
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── robots.txt             # SEO robots file
├── sitemap.xml            # SEO sitemap
│
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   └── main.js        # Main JavaScript
│   ├── images/
│   │   ├── profile.jpg    # Your profile photo
│   │   ├── favicon.ico    # Site favicon
│   │   └── projects/      # Project screenshots
│   └── docs/
│       ├── resume.pdf     # Your resume
│       └── papers/        # Research papers
```

## 🎯 Getting Started

### Prerequisites

- Git installed on your machine
- A GitHub account
- Basic knowledge of HTML, CSS, and JavaScript

### Installation

1. **Create a new repository** on GitHub named `your-username.github.io`

2. **Clone the repository** to your local machine:
   ```bash
   git clone https://github.com/your-username/your-username.github.io.git
   cd your-username.github.io
   ```

3. **Add your files** to the repository:
   - Copy all the provided files into your repository
   - Replace placeholder content with your actual information
   - Add your profile photo as `assets/images/profile.jpg`
   - Add project screenshots to `assets/images/projects/`

4. **Customize the content**:
   - Update personal information in `index.html`
   - Modify projects, skills, and achievements
   - Replace social media links with your own
   - Update contact information

5. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Initial portfolio setup"
   git push origin main
   ```

6. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save the settings

Your site will be live at `https://your-username.github.io` within a few minutes!

## ✏️ Customization

### Personal Information
Edit the following in `index.html`:
- Hero section title and description
- About section content
- Contact information
- Social media links
- Project details

### Colors and Styling
Modify CSS variables in `assets/css/style.css`:
```css
:root {
  --primary: #6366f1;        /* Primary brand color */
  --secondary: #ec4899;      /* Secondary accent color */
  --bg-primary: #0f172a;     /* Main background */
  /* ... other colors */
}
```

### Adding New Projects
Add new project cards in the projects section:
```html
<article class="project-card reveal" data-category="your-category">
  <!-- Project content -->
</article>
```

### Adding New Skills
Add skills in the appropriate category:
```html
<span class="skill-tag">Your Skill</span>
```

## 📱 Progressive Web App (PWA)

This site is configured as a PWA, meaning users can install it on their devices. The PWA features include:

- **Installable**: Users can add the site to their home screen
- **Offline Support**: Basic caching for offline viewing
- **App-like Experience**: Runs in standalone mode when installed

## 🔍 SEO Optimization

The site includes several SEO optimizations:

- **Meta Tags**: Comprehensive meta tags for search engines
- **Open Graph**: Social media sharing optimization
- **Schema.org**: Structured data for rich snippets
- **Sitemap**: XML sitemap for search engine crawling
- **Robots.txt**: Search engine crawler instructions

## 🚀 Performance

The site is optimized for performance with:

- **Lazy Loading**: Images load only when needed
- **Minified Assets**: Compressed CSS and JavaScript
- **Optimized Images**: Properly sized and compressed images
- **CDN Fonts**: Google Fonts loaded efficiently
- **Preconnect**: DNS prefetching for external resources

## 🆘 Troubleshooting

### Site Not Loading
- Check that GitHub Pages is enabled in repository settings
- Ensure the repository name is exactly `your-username.github.io`
- Wait 5-10 minutes for changes to propagate

### Images Not Showing
- Verify image file paths are correct
- Ensure images are in the `assets/images/` directory
- Check that image file names match exactly (case-sensitive)

### JavaScript Not Working
- Check browser console for errors
- Ensure `assets/js/main.js` file exists and is properly linked
- Verify there are no syntax errors in the JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Jack Kinney - [jack.t.kinney@gmail.com](mailto:jack.t.kinney@gmail.com)

Project Link: [https://github.com/your-username/your-username.github.io](https://github.com/your-username/your-username.github.io)

---

⭐ **Star this repository if you found it helpful!**