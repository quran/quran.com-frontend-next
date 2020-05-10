<!--
*** Thanks for checking out this Quran.com repo. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
*** an issue with the tag "enhancement".
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
    <a href="#contact"><strong>Join the Slack Channel »</strong></a>
    <br />
    <br />
    <a href="https://quran.com">Visit Quran.com</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-next/issues">Report Bug</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-next/issues">Request Feature</a>
  </p>
</p>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

This project is the frontend for Quran.com. It is built on top of [next.js](https://nextjs.org/docs/getting-started), a popular framework that takes the trouble and setup of setting up an isomorphic react app. We deploy it on now.sh automatically with automatic generation of builds for PRs.

Unlike the previous [Quran.com build](https://quran-com-frontend-next.mmahalwy.now.sh), we want this repo to focus on consistency and scale. We will document the process of setting this up on your local dev, making changes, picking up issues and finally getting work to deploy!

### How to contribute

We trust that you will not copy this idea/project, this is at the end for the sake of Allah and we all have good intentions while working with this project. But we must stress that copying the code/project is unacceptable.

### Running the app locally

- Ensure you have the latest nodejs and npm installed. Prefer 10+.
- Ensure you have `yarn` installed. Simply `npm i -g yarn`
- Clone this repo
- Run `yarn` on the repo to install `node_modules`
- Run `yarn dev` to start the app. If you wish to run on a different port, run `yarn dev -p 8000`
- Open `localhost:3000`

The app runs on next.js and will automatically hot reload when you make changes.

### Styling

We use `styled-components` as our styling library. When adding a new library (for example, for tooltips), please ensure it uses `styled-components` as the styling library. We want to avoid sending large JS files to our users, so having a mix of styling solutions will not be good. `styled-components` also allows us to code-split and send JS + CSS for what is needed.

### DLS (design language system)

One mistake we made previously is treated each component as unique. This made our work not scalable. Secondly, when looking at large companies, they often develop a design style language that can be used across the app without the need to create unique components and ensure better consistency across the product. We are trying to take a similar approach. If something can be used elsewhere, please put it inside the `dls/` directory and create stories for it.

### Storybook.js

Our components are built within Storybook.js. See files with name `.stories.tsx`. This helps engineers view their work outside of the product, making it super easy to test different configurations of the component.

### Typescript

We chose typescript as the language of choice of it's ease of type-safety. Please create types where you see fit.

### Helping out and issues

If you are interested to help out, please look at issues on the Github repo. This is a good place to start.

### Filing bugs

Thank you for taking time to file a bug! We'd appreciate your help on fixing it 🙏

### Contact

Please [open an issue](https://github.com/quran/quran.com-frontend/issues/new) with your email to join our Slack channel, and we'll try to add you as soon as possible.

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
