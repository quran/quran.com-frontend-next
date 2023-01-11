const path = require('path');

module.exports = {
    "stories": [
        "../src/**/*.stories.tsx"
    ],
    "addons": [{
            name: '@storybook/preset-scss',
            options: {
                cssLoaderOptions: {
                    modules: {
                        auto: true
                    }
                }
            }
        },
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-a11y",
        "storybook-addon-next-router",
        "@storybook/addon-storysource"
    ],
    typescript: {
        check: false,
        checkOptions: {},
        // ideally we use `react-docgen-typescript`. But there's still some issue, related to webpack 5.
        // so we use `react-docgen` for now
        reactDocgen: 'react-docgen',
        // reactDocgenTypescriptOptions: {
        //   shouldExtractLiteralValuesFromEnum: true,
        //   propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        // },
    },
    "core": {
        "builder": "webpack5"
    },
    webpackFinal: async (config) => {
        // Add support for absolute paths
        config.resolve.modules = [
            ...(config.resolve.modules || []),
            path.resolve('./'),
        ];

        // We do this because next-i18next will try to load files with fs (https://github.com/i18next/next-i18next/issues/1843) 
        config.resolve ||= {}
        config.resolve.fallback ||= {}
        config.resolve.fallback.fs =  false;

        // @/ root alias doesn't work in storybook, so we have to write the aliases manually
        const otherAliases = ['components', 'utils', 'redux', 'hooks', 'contexts'];

        // Add support for module aliases (same aliases in tsconfig.json)
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            '@/icons': path.resolve(__dirname, "../public/icons"),
            '@/dls': path.resolve(__dirname, "../src/components/dls"),
            '@/api': path.resolve(__dirname, "../src/api"),
            '@/data': path.resolve(__dirname, "../data"),
            '@/types': path.resolve(__dirname, "../types"),
            ...(otherAliases.reduce((acc, folder) => ({ 
                ...acc, 
                [`@/${folder}`]: path.resolve(__dirname, "../src", folder) 
            }), {})),
          };

        const fileLoaderRule = config.module.rules.find(rule => Array.isArray(rule.test) ? rule.test[0].test('.svg') : rule.test.test('.svg'));
        fileLoaderRule.exclude = /\.svg$/;
        // This is needed for inline svg imports
        config.module.rules.push({
            test: /\.svg$/,
            exclude: /node_modules/,
            use: [{
                loader: '@svgr/webpack',
                options: {
                    prettier: false,
                    svgo: true,
                    svgoConfig: {
                        plugins: [{
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    removeViewBox: false,
                                },
                            },
                        }, ],
                    },
                }
            }, ],
        });
        return config;
    },
}