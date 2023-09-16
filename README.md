<!--
*** Thanks for checking out this Quran.com repo. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
***  an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://quran.com">
    <img src="public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">The Noble Quran</h1>

  <p align="center">
    The official source code repository for Quran.com
    <br />
    <a href="https://discord.gg/SpEeJ5bWEQ"><strong>Join Quran.com community »</strong></a>
    <br />
    <br />
    <a href="https://quran.com">Visit Quran.com</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-next/issues">Report Bug</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-next/issues">Request Feature</a>
    •
    <a href="https://quran.github.io/quran.com-frontend-next/storybook/master">Storybook</a>
  </p>
</p>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

This project is the frontend for Quran.com. It is built on top of [Next.js](https://nextjs.org/docs/getting-started), a popular framework that takes the trouble and setup of setting up an isomorphic react app. We deploy it on now.sh automatically with automatic generation of builds for PRs.

### How to Contribute

We trust that you will not copy this idea/project, this is at the end for the sake of Allah and we all have good intentions while working with this project. But we must stress that copying the code/project is unacceptable.

### Running the App Locally

- Ensure you have the latest `nodejs` and `npm` installed. Prefer 10+
- Ensure you have `yarn` installed. Simply `npm i -g yarn`
- Clone this repo
- Run `yarn` on the repo to install `node_modules`
- Run `yarn dev` to start the app. If you wish to run on a different port, run `yarn dev -p 8000`
- Open `localhost:3000` in your browser

The app runs on Next.js and will automatically hot reload when you make changes.

### Environment Variables

If you have access to a Quran.com associated Vercel account, run `vercel env pull`. Otherwise, rename the `env.example` file to `env.local` and you should be good to go.

### DLS (Design Language System)

One mistake we made previously is treated each component as unique. This made our work not scalable. Secondly, when looking at large companies, they often develop a design style language that can be used across the app without the need to create unique components and ensure better consistency across the product. We are trying to take a similar approach. If something can be used elsewhere, please put it inside the `dls/` directory and create stories for it.

### Storybook.js

Our components are built within Storybook.js. See files with name `.stories.tsx`. This helps engineers view their work outside of the product, making it super easy to test different configurations of the component.

[We also display all our components here](https://quran.github.io/quran.com-frontend-next/storybook/master).

### Recommended Extensions

Check `.vscode/extensions.json` for recommended VSCode Extensions

### TypeScript

We chose TypeScript as the language of choice of it's ease of type-safety. Please create types where you see fit.

### Helping Out and Issues

If you are interested to help out, please look at issues on the GitHub repo. This is a good place to start.

### Filing Bugs

Thank you for taking time to file a bug! We'd appreciate your help on fixing it 🙏. Please [open an issue](https://github.com/quran/quran.com-frontend-next/issues).

### Community

<a href="https://discord.gg/SpEeJ5bWEQ"><strong>Join Quran.com Discord community »</strong></a>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/quran/quran.com-frontend-next?style=for-the-badge
[contributors-url]: https://github.com/quran/quran.com-frontend-next/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/quran/quran.com-frontend-next?style=for-the-badge
[forks-url]: https://github.com/quran/quran.com-frontend-next/network/members
[stars-shield]: https://img.shields.io/github/stars/quran/quran.com-frontend-next?style=for-the-badge
[stars-url]: https://github.com/quran/quran.com-frontend-next/stargazers
[issues-shield]: https://img.shields.io/github/issues/quran/quran.com-frontend-next?style=for-the-badge
[issues-url]: https://github.com/quran/quran.com-frontend-next/issues
[license-shield]: https://img.shields.io/github/license/quran/quran.com-frontend-next?style=for-the-badge
[license-url]: https://github.com/quran/quran.com-frontend-next/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png

### Credits

- Localization was made possible by the help of [Lokalise](https://lokalise.com/) which is a computer-aided translation system that focuses on productivity and quality assurance and provides a seamless localization workflow.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15169499/139687128-15ed6189-6be2-44bf-9173-75cce317d546.png" width="400">
</p>

- Deployment was made possible by the help of [Vercel](https://vercel.com/?utm_source=quran-pro&utm_campaign=oss) which is a deployment and collaboration platform for frontend developers which puts the frontend developer first, giving them comprehensive tools to build high-performance websites and applications.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15169499/147745340-b7e84819-d1b0-4399-87a0-d5276ba21bca.png" width="250">
</p>
