# Contributing to Speed Alarm

Thank you for your interest in contributing to Speed Alarm! We're excited to have you as part of our community. This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@gurkhatech.com](mailto:support@gurkhatech.com).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots, etc.)
- **Describe the behavior you observed** and what you expected to see
- **Include details about your environment** (browser, OS, device type)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **Include mockups or examples** if applicable

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues suitable for beginners
- `help wanted` - Issues where we need community help
- `documentation` - Documentation improvements

### Pull Requests

We welcome pull requests! Here's how to submit one:

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor or IDE
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control

### Local Development Setup

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/speed-alarm.git
   cd speed-alarm
   ```

2. **Open the Application**

   Simply open `index.html` in your web browser. For testing geolocation features:
   
   - Use a local web server (recommended for testing service workers)
   - Or use browser developer tools to simulate geolocation

3. **Using a Local Web Server (Recommended)**

   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have npx)
   npx http-server
   ```

   Then open `http://localhost:8000` in your browser.

## Development Workflow

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. **Make Your Changes**

   - Write clean, readable code
   - Follow existing code style and conventions
   - Add comments where necessary
   - Test your changes thoroughly

3. **Test Your Changes**

   - Test in multiple browsers if possible
   - Test with different screen sizes (mobile, tablet, desktop)
   - Test the service worker and offline functionality
   - Verify geolocation features work correctly

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template with details

## Pull Request Process

1. **Ensure your PR**:
   - Follows the coding standards
   - Includes appropriate comments and documentation
   - Works across different browsers and devices
   - Doesn't break existing functionality

2. **Update Documentation**:
   - Update the README.md if you're adding new features
   - Add comments to complex code sections
   - Update plan.md if your changes affect future plans

3. **PR Review Process**:
   - At least one maintainer will review your PR
   - Address any requested changes
   - Once approved, a maintainer will merge your PR

4. **After Merge**:
   - Delete your branch (optional)
   - Pull the latest changes from main
   - Celebrate! 🎉

## Coding Standards

### JavaScript

- Use modern ES6+ syntax where appropriate
- Use descriptive variable and function names
- Follow camelCase naming convention
- Add comments for complex logic
- Avoid global variables when possible
- Keep functions small and focused

**Example:**

```javascript
// Good
function calculateSpeed(coords1, coords2, timeElapsed) {
    // Calculate distance using Haversine formula
    const distance = haversineDistance(coords1, coords2);
    const speed = (distance / timeElapsed) * 3.6; // Convert m/s to km/h
    return speed;
}

// Avoid
function calc(c1, c2, t) {
    var d = hd(c1, c2);
    return (d / t) * 3.6;
}
```

### HTML

- Use semantic HTML5 elements
- Include proper accessibility attributes
- Keep markup clean and well-indented
- Use meaningful IDs and class names

### CSS

- Use existing Bootstrap classes when possible
- Keep custom CSS organized
- Use descriptive class names
- Avoid inline styles

## Commit Message Guidelines

Write clear and meaningful commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when applicable

**Examples:**

```
Add ability to select custom alarm sounds

Fix speed calculation accuracy issue #123

Update README with installation instructions

Refactor geolocation tracking for better performance
```

## Issue Guidelines

### Creating Issues

When creating an issue:

1. **Search existing issues** first to avoid duplicates
2. **Use a clear and descriptive title**
3. **Provide detailed information**:
   - For bugs: steps to reproduce, expected vs actual behavior
   - For features: use case, benefits, implementation ideas
4. **Add appropriate labels** (bug, enhancement, documentation, etc.)
5. **Be respectful and constructive**

### Working on Issues

- Comment on the issue to let others know you're working on it
- Ask questions if anything is unclear
- Update the issue with your progress
- Link your PR to the issue when ready

## Questions?

If you have any questions or need help:

- Open an issue with the `question` label
- Reach out to the maintainers
- Check existing documentation and issues

## Recognition

Contributors will be recognized in our project! Thank you for helping make Speed Alarm better for everyone.

---

**Happy Contributing! 🚀**

*This project is maintained by [Gurkha Technology](https://www.gurkhatech.com/)*
