# DynaTemp

DynaTemp is a dynamic website template built with [Astro.js](https://astro.build/), [Decap CMS](https://decapcms.org/) (formerly Netlify CMS), and [Netlify Identity](https://www.netlify.com/products/identity/). It's designed to be a flexible and easily customizable foundation for building content-driven websites.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Development

To start the local development server, run the following command:

```bash
pnpm dev
```

This will start a development server at `http://localhost:4321`.

### Building for Production

To build the website for production, run the following command:

```bash
pnpm build
```

This will create a `dist` directory with the production-ready files.

## Decap CMS

Decap CMS is used to manage the content of the website. You can access the CMS by navigating to `/admin` on your live site or local development server.

### Configuration

The Decap CMS configuration is located in the `public/admin/config.yml` file. This file defines the content collections, fields, and other settings for the CMS.

The following collections are pre-configured:

*   **Events:** For creating and managing events.
*   **Contributions:** For creating and managing contributions.
*   **Reunions:** For creating and managing reunions.
*   **Gallery:** For creating and managing gallery items.
*   **Pages:** For creating and managing static pages.

You can customize these collections or add new ones to fit your needs.

## Netlify Identity

Netlify Identity is used for authentication with Decap CMS. When you deploy the website to Netlify, you can enable Identity to manage users who can access the CMS.

## Deployment

This project is configured for deployment to [Netlify](https://www.netlify.com/). When you deploy to Netlify, make sure to do the following:

1.  **Enable Identity:** In your Netlify site settings, go to the "Identity" tab and enable it.
2.  **Enable Git Gateway:** Under the Identity settings, enable Git Gateway to allow Decap CMS to interact with your Git repository.

## Customization

### Content Collections

To customize the content collections, edit the `public/admin/config.yml` file. You can add, remove, or modify the collections and their fields.

### Website Pages and Components

The website's pages and components are located in the `src` directory.

*   **Pages:** The `src/pages` directory contains the Astro pages for the website.
*   **Components:** The `src/components` directory contains reusable Astro components.

You can modify these files to change the layout, styling, and functionality of the website.