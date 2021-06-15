const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const webpack = require('webpack')

module.exports = (env) => {
    let environment = 'development'
    if(env.ENV){
        environment = env.ENV
    }

    return {
        entry: './src/index.tsx',
        output: {
            filename: 'index.[fullhash].js',
            path: path.join(__dirname, 'dist'),
        },
        devtool: 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            babelrc: false,
                            presets: [
                                '@babel/preset-typescript',
                                [
                                    '@babel/preset-env',
                                    { targets: { browsers: '> 5%, not IE <= 11' } },
                                ],
                                '@babel/preset-react',
                            ],
                            plugins: [
                                'babel-plugin-styled-components',
                            ],
                        },
                    },
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'source-map-loader'
                },
                {
                    test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf|ico)$/,
                    use: ['file-loader'],
                },
            ],
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
            }),
            new webpack.DefinePlugin({
                'process.env.ENV': JSON.stringify(environment),
            })
        ],
        devServer: {
            historyApiFallback: true,
            host: '0.0.0.0',
            stats: 'errors-only',
            overlay: true,
            hot: true,
        },
        stats: 'minimal',
    }
}