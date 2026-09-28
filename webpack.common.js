const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",

    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },

    plugins: [
        new webpack.DefinePlugin({
            "process.env.API_FOOTBALL_KEY": JSON.stringify(process.env.API_FOOTBALL_KEY || ""),
        }),
        new HtmlWebpackPlugin({
            template: "./src/template.html",
            favicon: "./favicon/favicon.ico",
        }),
    ],

    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },

            {
                test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
                type: "asset/resource",
            },
        ],
    },
};
