🌐 **Live Website**: [https://mutlukurt.github.io/JobFlow/](https://mutlukurt.github.io/JobFlow/)

# JobFlow - Modern Job Search Website

A world-class job marketplace built with vanilla HTML, CSS, and JavaScript. JobFlow connects talented professionals with innovative companies through an intuitive, accessible, and feature-rich platform.

## ✨ Features

### For Job Seekers
- **Advanced Search & Filters**: Find jobs by role, location, experience level, employment type, and salary range
- **Smart Job Matching**: AI-powered relevance scoring based on your preferences and search history
- **Save & Track**: Save interesting jobs and track your applications
- **Responsive Design**: Optimized for all devices with mobile-first approach
- **Dark/Light Theme**: Toggle between themes for comfortable browsing

### For Employers
- **Easy Job Posting**: Comprehensive form with validation and draft saving
- **Company Profiles**: Showcase your company culture and benefits
- **Featured Listings**: Highlight urgent positions and premium opportunities
- **Application Management**: Track candidate applications and responses

### Technical Features
- **No Framework Dependencies**: Pure vanilla HTML, CSS, and JavaScript
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Accessibility First**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance Optimized**: Lighthouse scores target 95+ across all metrics
- **Local Storage**: Client-side data persistence for saved jobs and searches

## 🚀 Quick Start

1. **Clone or Download** the project files
2. **Open `index.html`** in your web browser
3. **That's it!** No build tools, no dependencies, no setup required

### File Structure
```
JobFlow/
├── index.html              # Home page
├── jobs.html              # Job listings with filters
├── job.html               # Individual job details
├── post.html              # Post a job form
├── about.html             # About us and blog
├── assets/
│   ├── css/
│   │   └── styles.css     # All styling and components
│   └── js/
│       ├── app.js         # Main application logic
│       ├── ui.js          # UI components and modals
│       └── jobs.js        # Job management and rendering
├── data/
│   ├── jobs.json          # Mock job data
│   └── companies.json     # Mock company data
└── README.md              # This file
```

## 🎨 Design System

### Color Themes
- **Clean Blue**: Primary #0A84FF, Accent #00C2A8
- **Dark Mode**: Primary #06B6D4, Accent #F97316

### Typography
- **Font Family**: Inter (Google Fonts) with system fallbacks
- **Responsive Sizing**: Uses `clamp()` for fluid typography
- **Accessibility**: High contrast ratios and readable font sizes

### Components
- **Buttons**: Primary, outline, subtle, and full-width variants
- **Cards**: Consistent spacing, shadows, and hover effects
- **Forms**: Real-time validation with helpful error messages
- **Modals**: Accessible overlays with focus trapping
- **Toasts**: Non-intrusive notifications for user feedback

## 🔧 Customization

### Adding New Jobs
Edit `data/jobs.json` to add new job listings:

```json
{
  "id": "job-009",
  "title": "Your Job Title",
  "companyId": "company-001",
  "role": "frontend",
  "type": "Full Time",
  "experience": "mid",
  "location": "Your City, State",
  "remote": "hybrid",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "description": "Job description...",
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "requirements": ["Requirement 1", "Requirement 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "featured": false,
  "urgent": false,
  "posted": "2024-03-16T10:00:00Z"
}
```

### Adding New Companies
Edit `data/companies.json` to add new companies:

```json
{
  "id": "company-011",
  "name": "Your Company",
  "description": "Company description...",
  "website": "https://yourcompany.com",
  "size": "11-50 employees",
  "industry": "Your Industry",
  "location": "Your City, State",
  "founded": "2020",
  "logo": "YC"
}
```

### Styling Customization
Modify `assets/css/styles.css` to customize:
- Color schemes and themes
- Typography and spacing
- Component styles and animations
- Responsive breakpoints

## 📱 Responsive Design

The website is built with a mobile-first approach and includes:
- **12-column responsive grid system**
- **Fluid typography** using `clamp()`
- **Flexible layouts** that adapt to all screen sizes
- **Touch-friendly** interface elements
- **Optimized navigation** for mobile devices

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: AA compliant color combinations
- **Reduced Motion**: Respects user's motion preferences
- **Skip Links**: Quick navigation to main content

## 🚀 Performance Features

- **Lazy Loading**: Images and non-critical resources
- **Debounced Search**: 300ms delay for optimal performance
- **Efficient Rendering**: Virtual scrolling for large job lists
- **Optimized Assets**: SVG icons and minimal external dependencies
- **Local Storage**: Fast access to saved data
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🔒 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Graceful degradation for older browsers

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Search and filters work properly
- [ ] Job applications can be submitted
- [ ] Jobs can be saved and unsaved
- [ ] Theme switching works
- [ ] Mobile navigation functions
- [ ] Forms validate correctly
- [ ] Modals open and close properly
- [ ] Toast notifications appear

### Performance Testing
- **Lighthouse**: Target 95+ scores
- **Page Load**: Under 2 seconds
- **Bundle Size**: Under 200KB (excluding data)
- **First Contentful Paint**: Under 1.5 seconds

## 📝 Development Notes

### Code Organization
- **Modular JavaScript**: Classes for different functionality areas
- **CSS Architecture**: BEM methodology with utility classes
- **HTML Structure**: Semantic markup with accessibility in mind
- **Data Flow**: Centralized state management with localStorage

### Best Practices
- **Progressive Enhancement**: Core functionality without JavaScript
- **Accessibility First**: WCAG guidelines from the start
- **Performance Conscious**: Optimized for speed and efficiency
- **Maintainable Code**: Clean, commented, and well-structured

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines
- Follow existing code style and structure
- Add comments for complex logic
- Test across different browsers and devices
- Ensure accessibility compliance
- Optimize for performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Inter Font**: Beautiful, readable typography from Google Fonts
- **Feather Icons**: Clean, consistent iconography
- **Modern CSS**: Advanced features like `clamp()` and CSS Grid
- **Web Standards**: HTML5, CSS3, and ES6+ JavaScript

## 📞 Support

For questions, issues, or contributions:
- **Issues**: Use the GitHub issue tracker
- **Discussions**: Start a conversation in GitHub Discussions
- **Email**: hello@jobflow.com (mock)

---

**JobFlow** - Connecting talent with opportunity since 2024

*Built with ❤️ using vanilla web technologies*
