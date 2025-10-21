# 🤝 Contributing to Face Recognition System

Thank you for your interest in contributing to the Face Recognition & Attendance System! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Poetry
- Git

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/student-surveillance.git
cd student-surveillance

# Setup development environment
./scripts/setup.sh  # Linux/macOS
# or
scripts\setup.bat   # Windows

# Create a new branch
git checkout -b feature/your-feature-name
```

## 📋 Development Guidelines

### Code Style
- **Python**: Follow PEP 8, use Black for formatting
- **TypeScript/JavaScript**: Use Prettier and ESLint
- **Commits**: Use conventional commit messages

### Testing
```bash
# Backend tests
cd backend
poetry run pytest src/tests/ -v

# Frontend tests (if available)
cd frontend
npm test
```

### Documentation
- Update README.md for new features
- Add docstrings to Python functions
- Update API documentation

## 🎯 Areas for Contribution

### High Priority
- [ ] Multi-camera support
- [ ] Database integration
- [ ] Performance optimizations
- [ ] Mobile responsiveness improvements

### Medium Priority
- [ ] Additional analytics features
- [ ] Export functionality enhancements
- [ ] UI/UX improvements
- [ ] Test coverage improvements

### Low Priority
- [ ] Documentation improvements
- [ ] Code refactoring
- [ ] Additional language support

## 🔄 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests if applicable
5. **Update** documentation
6. **Submit** a pull request

### PR Requirements
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Clear description of changes

## 🐛 Reporting Issues

### Bug Reports
Include:
- OS and version
- Python/Node.js versions
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Documentation**: Check README.md and INSTALLATION.md

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
