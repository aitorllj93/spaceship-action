# Deploy your Obisian Vault with Spaceship to GitHub Pages

This action for [Spaceship](https://aitorllamas.com/astro-loader-obsidian/) builds your Obsidian Vault for [GitHub Pages](https://pages.github.com/).


## Usage

### Inputs

- `spaceship_template` - Optional: The template repository to use for the deployment.
- `spaceship_template_branch` - Optional: The template branch to use for the deployment.
- `site` - The site name to use in the site metadata. Eg https://google.es
- `base` - Optional: The base path to use in the site metadata. Eg /my-vault/

For more information about the inputs, check the [action.yml](./action.yml) file.

### Example workflow:

#### Build and Deploy to GitHub Pages

Create a file at `.github/workflows/deploy.yml` with the following content.

```yml
name: Deploy to GitHub Pages

on:
  # Trigger the workflow every time you push to the `main` branch
  # Using a different branch name? Replace `main` with your branch’s name
  push:
    branches: [ main ]
  # Allows you to run this workflow manually from the Actions tab on GitHub.
  workflow_dispatch:

# Allow this job to clone the repo and create a page deployment
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Install, build, and upload your site
        uses: aitorllj93/spaceship-action@main
        with:
          site: https://owner.github.io
          base: /repo-name/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```