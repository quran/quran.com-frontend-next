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

        const fileLoaderRule = config.module.rules.find(rule => rule.test.test('.svg'));
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