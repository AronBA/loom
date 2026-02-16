# Loom Documentation

This directory contains the documentation for Loom, published via GitHub Pages.

## Publishing to GitHub Pages

### Option 1: GitHub Actions (Recommended)

1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. The documentation will automatically deploy on push to main

### Option 2: Manual Deployment

1. Go to your repository Settings
2. Navigate to Pages
3. Under "Source", select "Deploy from a branch"
4. Select the `main` branch and `/docs` folder
5. Click Save

Your documentation will be available at:
```
https://yourusername.github.io/loom/
```

## Local Development

To preview the documentation locally:

```bash
# Install Jekyll
gem install bundler jekyll

# Navigate to docs directory
cd docs

# Serve locally
jekyll serve

# Open http://localhost:4000
```

## Structure

- `index.md` - Homepage
- `getting-started.md` - Installation and setup guide
- `api-reference.md` - Complete API documentation
- `integration.md` - Integration examples for various languages
- `deployment.md` - Production deployment guide
- `_config.yml` - Jekyll configuration

## Customization

### Theme

The documentation uses the Cayman theme. To change it, edit `_config.yml`:

```yaml
theme: jekyll-theme-minimal
```

Available themes: cayman, minimal, slate, architect, tactile, dinky, leap-day, merlot, midnight, modernist, time-machine

### Custom Domain

To use a custom domain:

1. Create a file named `CNAME` in the docs directory
2. Add your domain name:
   ```
   docs.yourdomain.com
   ```
3. Configure your DNS to point to GitHub Pages

## Contributing

To contribute to the documentation:

1. Edit the relevant `.md` file
2. Test locally with Jekyll
3. Submit a pull request
