# Contributing to Les Ambassadeurs du Bien

Thank you for your interest in contributing! Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## Quick Start

1. Fork the repository
2. Clone your fork: git clone https://github.com/YOUR_USERNAME/les-ambassadeurs-web.git
3. Create a branch: git checkout -b feat/your-feature-name
4. Copy .env.example to .env and fill in the values
5. Install dependencies: 
pm install
6. Start development server: 
pm run dev
7. Make your changes
8. Run lint and tests: 
pm run lint && npm test
9. Commit using conventional commits: git commit -m "feat: add new feature"
10. Push and open a Pull Request

## Branch Naming
- eat/feature-name — new features
- ix/bug-description — bug fixes
- docs/what-changed — documentation
- chore/task-name — maintenance

## Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- eat: — new feature
- ix: — bug fix
- docs: — documentation
- perf: — performance
- chore: — maintenance
- efactor: — code refactoring
- 	est: — tests
